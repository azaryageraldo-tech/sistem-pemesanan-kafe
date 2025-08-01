<script setup>
import axios from 'axios';
import { io } from "socket.io-client";
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const orders = ref([]);
const isLoading = ref(true);

const currentPage = ref(1);
const totalPages = ref(0);
const searchQuery = ref('');
let searchTimeout = null;

const statusClass = computed(() => {
  return (status) => {
    if (status === 'diterima') return 'bg-yellow-200 text-yellow-800';
    if (status === 'disiapkan') return 'bg-blue-200 text-blue-800';
    if (status === 'selesai') return 'bg-green-200 text-green-800';
    return 'bg-gray-200 text-gray-800';
  }
});

const fetchOrders = async (page = 1) => {
  isLoading.value = true;
  try {
    const response = await axios.get('http://localhost:3000/api/orders', {
      params: {
        page: page,
        search: searchQuery.value
      }
    });
    const responseData = response.data.data;
    orders.value = responseData.orders;
    totalPages.value = responseData.totalPages;
    currentPage.value = responseData.currentPage;
  } catch (error) {
    console.error('Gagal mengambil data pesanan:', error);
  } finally {
    isLoading.value = false;
  }
};

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    fetchOrders(page);
  }
};

const changeStatus = async (orderId, newStatus) => {
  try {
    await axios.put(`http://localhost:3000/api/orders/${orderId}/status`, { status: newStatus });
  } catch (error) {
    console.error('Gagal mengubah status:', error);
    alert('Gagal mengubah status pesanan.');
  }
};

watch(searchQuery, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchOrders(1);
  }, 500);
});

onMounted(() => {
  fetchOrders();
  const socket = io('http://localhost:3000');
  socket.on('new_order', () => {
    if (currentPage.value === 1 && !searchQuery.value) {
      fetchOrders(1);
    }
  });
  socket.on('order_updated', (updatedOrder) => {
    const index = orders.value.findIndex(order => order.id === updatedOrder.id);
    if (index !== -1) {
      orders.value[index] = updatedOrder;
    } else {
        fetchOrders(currentPage.value);
    }
  });
  onUnmounted(() => socket.disconnect());
});
</script>

<template>
  <div class="bg-gray-100 min-h-screen">
    <header class="bg-white shadow-md">
      <div class="container mx-auto px-6 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-800">Dashboard Admin</h1>
        <div class="flex items-center">
          <RouterLink to="/admin/reports" class="bg-green-100 hover:bg-green-200 text-green-800 font-bold py-2 px-4 rounded-md transition duration-300 mr-4">
    Laporan
  </RouterLink>
          <RouterLink to="/admin/menus" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-300 mr-4">
            Manajemen Menu
          </RouterLink>
          <span class="text-gray-700 mr-4">Selamat datang, <span class="font-semibold">{{ authStore.user?.username }}</span>!</span>
          <button @click="authStore.logout()" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition duration-300">
            Logout
          </button>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-6 py-8">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-700">Daftar Pesanan Masuk</h2>
        <input 
          type="text" 
          v-model="searchQuery"
          placeholder="Cari nama atau no. meja..."
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
      </div>
      
      <div v-if="isLoading" class="text-center py-16 text-gray-500">Memuat pesanan...</div>
      
      <div v-else-if="orders.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="order in orders" :key="order.id" class="bg-white rounded-lg shadow-lg p-6 flex flex-col">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-bold text-gray-900">Pesanan #{{ order.id }}</h3>
            <span :class="statusClass(order.status)" class="text-xs font-semibold px-3 py-1 rounded-full uppercase">
              {{ order.status }}
            </span>
          </div>
          <div class="space-y-2 text-sm text-gray-600 mb-4">
            <p><strong>Pemesan:</strong> {{ order.customer_name }}</p>
            <p><strong>Meja:</strong> {{ order.table_number }}</p>
            <p><strong>Total:</strong> Rp {{ order.total_price.toLocaleString('id-ID') }}</p>
            <p><strong>Waktu:</strong> {{ new Date(order.created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}</p>
          </div>
          <div class="border-t pt-4 mt-4 flex-grow">
            <h4 class="font-semibold text-gray-700 mb-2">Detail Item:</h4>
            <ul class="space-y-1 text-sm text-gray-500">
              <li v-for="item in order.items" :key="item.name" class="flex justify-between">
                <span>{{ item.name }}</span>
                <span>x{{ item.quantity }}</span>
              </li>
            </ul>
          </div>
          <div class="mt-4 pt-4 border-t flex justify-end gap-2">
            <button v-if="order.status === 'diterima'" @click="changeStatus(order.id, 'disiapkan')" class="bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-2 px-3 rounded-md transition duration-300">
              Siapkan
            </button>
            <button v-if="order.status === 'disiapkan'" @click="changeStatus(order.id, 'selesai')" class="bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-2 px-3 rounded-md transition duration-300">
              Selesaikan
            </button>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-16 text-gray-500">
        <p>Tidak ada pesanan yang ditemukan.</p>
      </div>

      <div v-if="totalPages > 1" class="mt-8 flex justify-center items-center gap-2">
        <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="px-4 py-2 bg-white rounded-md shadow disabled:opacity-50">
          &laquo; Sebelumnya
        </button>
        <span class="text-gray-600">
          Halaman {{ currentPage }} dari {{ totalPages }}
        </span>
        <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="px-4 py-2 bg-white rounded-md shadow disabled:opacity-50">
          Berikutnya &raquo;
        </button>
      </div>
    </main>
  </div>
</template>