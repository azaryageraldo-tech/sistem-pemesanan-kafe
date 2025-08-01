<script setup>
import axios from 'axios';
import { computed, onMounted, ref } from 'vue';
import MenuCardSkeleton from '../components/MenuCardSkeleton.vue'; // <-- Impor komponen skeleton
import { useCartStore } from '../stores/cart';

const cartStore = useCartStore();
const menus = ref([]);
const isLoading = ref(true);
const error = ref(null);

const categories = ['Semua', 'Makanan', 'Minuman', 'Snack'];
const selectedCategory = ref('Semua');
const searchQuery = ref('');

const filteredMenus = computed(() => {
  let filtered = menus.value;

  if (selectedCategory.value !== 'Semua') {
    filtered = filtered.filter(menu => menu.category === selectedCategory.value);
  }

  if (searchQuery.value) {
    filtered = filtered.filter(menu =>
      menu.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  return filtered;
});

const fetchMenus = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/menus');
    menus.value = response.data.data;
  } catch (err) {
    console.error('Gagal mengambil data menu:', err);
    error.value = 'Tidak dapat memuat data menu.';
  } finally {
    isLoading.value = false;
  }
};

const addToCart = (menu) => {
  cartStore.addItem(menu);
};

onMounted(() => {
  fetchMenus();
});
</script>

<template>
  <main class="bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4 py-6">
      <h1 class="text-3xl md:text-4xl font-extrabold text-center mb-8 text-gray-800">Pilih Menu Favorit Anda</h1>

      <div class="flex flex-col md:flex-row gap-4 mb-8">
        <div class="relative flex-grow">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Cari menu..."
            class="w-full pl-10 pr-4 py-3 border rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
        </div>
        <div class="flex-shrink-0 bg-white p-1 rounded-full shadow-sm flex items-center space-x-1">
          <button 
            v-for="category in categories" 
            :key="category"
            @click="selectedCategory = category"
            :class="[
              'px-4 py-2 rounded-full text-sm font-semibold transition-colors',
              selectedCategory === category ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'
            ]"
          >
            {{ category }}
          </button>
        </div>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <MenuCardSkeleton v-for="n in 8" :key="n" />
      </div>

      <div v-else-if="error" class="text-center text-red-500">
        <p>{{ error }}</p>
      </div>
      
      <div v-else-if="filteredMenus.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <div 
          v-for="menu in filteredMenus" 
          :key="menu.id" 
          class="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 flex flex-col"
        >
          <img 
            :src="'http://localhost:3000' + menu.image_url" 
            v-if="menu.image_url"
            :alt="menu.name" 
            class="w-full h-56 object-cover"
          >
          <img 
            src="https://via.placeholder.com/400x300" 
            v-else
            :alt="menu.name" 
            class="w-full h-56 object-cover"
          >
          <div class="p-6 flex flex-col flex-grow">
            <div class="flex-grow">
              <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ menu.name }}</h3>
              <p class="text-lg text-green-600 font-semibold mb-4">
                Rp {{ menu.price.toLocaleString('id-ID') }}
              </p>
            </div>
            <button 
              @click="addToCart(menu)"
              class="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
            >
              Tambah ke Keranjang
            </button>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-16 text-gray-500">
        <p>Menu yang Anda cari tidak ditemukan.</p>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Kosongkan karena styling sudah ditangani oleh Tailwind */
</style>