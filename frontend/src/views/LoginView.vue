<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const username = ref('');
const password = ref('');
const errorMessage = ref(null);

const handleLogin = async () => {
  try {
    errorMessage.value = null;
    await authStore.login({
      username: username.value,
      password: password.value
    });
  } catch {
    errorMessage.value = 'Login gagal. Periksa kembali username dan password Anda.';
  }
};
</script>

<template>
  <div class="bg-gray-100 flex items-center justify-center min-h-screen">
    
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
      <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Login Admin</h2>
      <form @submit.prevent="handleLogin">
        
        <div class="mb-4">
          <label for="username" class="block text-gray-700 text-sm font-bold mb-2">
            Username
          </label>
          <input 
            type="text" 
            id="username" 
            v-model="username"
            class="w-full px-3 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
        </div>

        <div class="mb-6">
          <label for="password" class="block text-gray-700 text-sm font-bold mb-2">
            Password
          </label>
          <input 
            type="password" 
            id="password" 
            v-model="password"
            class="w-full px-3 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
        </div>
        
        <p v-if="errorMessage" class="text-red-500 text-sm text-center mb-4">
          {{ errorMessage }}
        </p>

        <button 
          type="submit" 
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
        >
          Login
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Kosongkan bagian ini karena semua styling sudah ditangani oleh Tailwind */
</style>