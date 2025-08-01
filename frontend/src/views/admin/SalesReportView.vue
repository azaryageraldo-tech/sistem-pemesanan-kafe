<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

const reportData = ref(null);
const isLoading = ref(true);

const fetchReport = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/reports/sales');
    reportData.value = response.data.data;
  } catch (error) {
    console.error("Gagal mengambil laporan:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchReport);
</script>

<template>
  <div class="p-8 bg-gray-100 min-h-screen">
    <div class="max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Laporan Penjualan</h1>
        <RouterLink to="/admin" class="text-blue-500 hover:underline">&larr; Kembali ke Dashboard</RouterLink>
      </div>

      <div v-if="isLoading" class="text-center py-16">Memuat data laporan...</div>
      
      <div v-else-if="reportData" class="space-y-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white p-6 rounded-lg shadow-md flex items-center">
            <div class="bg-green-100 p-4 rounded-full mr-4">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01"></path></svg>
            </div>
            <div>
              <p class="text-sm text-gray-500">Total Pendapatan Hari Ini</p>
              <p class="text-3xl font-bold text-gray-900">Rp {{ reportData.totalRevenueToday.toLocaleString('id-ID') }}</p>
            </div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md flex items-center">
            <div class="bg-blue-100 p-4 rounded-full mr-4">
               <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            </div>
            <div>
              <p class="text-sm text-gray-500">Jumlah Pesanan Hari Ini</p>
              <p class="text-3xl font-bold text-gray-900">{{ reportData.totalOrdersToday }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-bold mb-4">Top 5 Menu Terlaris</h2>
          <ul class="space-y-3">
            <li v-for="(menu, index) in reportData.topSellingMenus" :key="menu.name" class="flex justify-between items-center pb-2 border-b last:border-b-0">
              <div class="flex items-center">
                <span class="text-lg font-bold text-gray-400 w-8">{{ index + 1 }}.</span>
                <span class="font-semibold text-gray-800">{{ menu.name }}</span>
              </div>
              <span class="font-bold text-indigo-600">{{ menu.totalSold }}x terjual</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>