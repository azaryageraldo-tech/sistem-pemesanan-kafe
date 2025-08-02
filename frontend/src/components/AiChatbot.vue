<script setup>
import axios from 'axios';
import { nextTick, ref, watch } from 'vue';

// Prop untuk menerima daftar menu dari parent (HomeView)
const props = defineProps({
  menuList: {
    type: Array,
    required: true
  }
});

const isOpen = ref(false);
const newMessage = ref('');
const isLoading = ref(false);
const chatHistory = ref([]);
const chatbox = ref(null);

// Prompt awal untuk mengatur kepribadian dan aturan AI
const initializeChat = () => {
  chatHistory.value = [{
    role: 'user',
    text: `Kamu adalah 'Kafebot', asisten AI yang ramah di sebuah kafe. Tugasmu hanya membantu pelanggan memilih menu. Jangan menjawab pertanyaan di luar topik menu atau kafe. Gunakan bahasa yang santai dan ceria. Berikut daftar menu yang tersedia: ${JSON.stringify(props.menuList)}`
  }, {
    role: 'model',
    text: 'Tentu! Ada yang bisa aku bantu? Tanya aja soal menu atau minta rekomendasi, ya!'
  }];
};

// Scroll otomatis ke pesan terbaru
watch(chatHistory, () => {
  nextTick(() => {
    if (chatbox.value) {
      chatbox.value.scrollTop = chatbox.value.scrollHeight;
    }
  });
}, { deep: true });

const toggleChat = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value && chatHistory.value.length === 0) {
    initializeChat();
  }
};

const sendMessage = async () => {
  const userMessageText = newMessage.value.trim();
  if (!userMessageText || isLoading.value) return;

  // Tambahkan pesan pengguna ke riwayat
  chatHistory.value.push({ role: 'user', text: userMessageText });
  newMessage.value = '';
  isLoading.value = true;

  try {
    const payload = {
      menuList: props.menuList,
      chatHistory: chatHistory.value
    };
    const response = await axios.post('http://localhost:3000/api/ai/chat', payload);
    
    // Tambahkan balasan AI ke riwayat
    chatHistory.value.push({ role: 'model', text: response.data.reply });

  } catch {
    chatHistory.value.push({ role: 'model', text: 'Aduh, koneksiku lagi bermasalah nih. Coba tanya lagi nanti ya.' });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="fixed bottom-6 right-6 z-40">
    <button @click="toggleChat" class="bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
      <svg v-if="!isOpen" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
      <svg v-else class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
    </button>
  </div>

  <div v-if="isOpen" class="fixed bottom-24 right-6 w-96 max-w-[90vw] h-[60vh] bg-white rounded-2xl shadow-2xl flex flex-col z-50 transition-transform transform origin-bottom-right" :class="isOpen ? 'scale-100' : 'scale-0'">
    <div class="bg-indigo-600 text-white p-4 rounded-t-2xl">
      <h3 class="font-bold text-lg">Kafebot Asisten</h3>
    </div>
    <div ref="chatbox" class="flex-grow p-4 overflow-y-auto space-y-4">
      <div v-for="(message, index) in chatHistory.slice(2)" :key="index">
        <div class="flex" :class="message.role === 'user' ? 'justify-end' : 'justify-start'">
          <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl" :class="message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'">
            <p class="text-sm">{{ message.text }}</p>
          </div>
        </div>
      </div>
      <div v-if="isLoading" class="flex justify-start">
          <div class="bg-gray-200 text-gray-800 px-4 py-2 rounded-2xl text-sm">
            Kafebot sedang mengetik...
          </div>
      </div>
    </div>
    <div class="p-4 border-t">
      <form @submit.prevent="sendMessage" class="flex gap-2">
        <input v-model="newMessage" type="text" placeholder="Ketik pesanmu..." class="flex-grow px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500">
        <button type="submit" class="bg-indigo-600 text-white rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center">
          <svg class="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
        </button>
      </form>
    </div>
  </div>
</template>