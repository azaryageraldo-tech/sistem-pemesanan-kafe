<script setup>
import axios from 'axios';
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import { computed, onMounted, ref } from 'vue';
import { Bar, Line } from 'vue-chartjs';
import { RouterLink } from 'vue-router';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement);

const isLoading = ref(true);
const analyticsData = ref(null);

// State untuk filter tanggal
const today = new Date().toISOString().slice(0, 10);
let sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

const startDate = ref(sevenDaysAgo.toISOString().slice(0, 10));
const endDate = ref(today);

// Fungsi untuk mengambil data dari backend
const fetchAnalytics = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get('http://localhost:3000/api/reports/analytics', {
      params: {
        startDate: startDate.value,
        endDate: endDate.value
      }
    });
    analyticsData.value = response.data.data;
  } catch (error) {
    console.error("Gagal mengambil data analitik:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchAnalytics);

// Computed property untuk memformat data untuk grafik garis (tren penjualan)
const lineChartData = computed(() => {
  if (!analyticsData.value?.salesOverTime) return { labels: [], datasets: [] };
  const labels = analyticsData.value.salesOverTime.map(d => new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }));
  const data = analyticsData.value.salesOverTime.map(d => d.dailyRevenue);
  return {
    labels,
    datasets: [{
      label: 'Pendapatan Harian',
      backgroundColor: '#4f46e5',
      borderColor: '#4f46e5',
      data,
    }]
  };
});

// Computed property untuk memformat data untuk grafik batang (menu terlaris)
const barChartData = computed(() => {
  if (!analyticsData.value?.topSellingMenus) return { labels: [], datasets: [] };
  const labels = analyticsData.value.topSellingMenus.map(m => m.name);
  const data = analyticsData.value.topSellingMenus.map(m => m.totalSold);
  return {
    labels,
    datasets: [{
      label: 'Jumlah Terjual',
      backgroundColor: ['#34D399', '#60A5FA', '#FBBF24', '#F87171', '#93C5FD'],
      data,
    }]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false
};
</script>

<template>
  <div class="p-8 bg-gray-100 min-h-screen">
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h1 class="text-2xl font-bold text-gray-800">Laporan & Analitik</h1>
        <div class="flex items-center gap-4">
          <input type="date" v-model="startDate" class="px-3 py-2 border rounded-md">
          <span class="text-gray-500">hingga</span>
          <input type="date" v-model="endDate" class="px-3 py-2 border rounded-md">
          <button @click="fetchAnalytics" class="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700">Filter</button>
          <RouterLink to="/admin" class="text-blue-500 hover:underline flex-shrink-0">&larr; Dashboard</RouterLink>
        </div>
      </div>

      <div v-if="isLoading" class="text-center py-16">Memuat data analitik...</div>
      
      <div v-else-if="analyticsData" class="space-y-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white p-6 rounded-lg shadow-md">
            <p class="text-sm text-gray-500">Total Pendapatan (Selesai)</p>
            <p class="text-3xl font-bold text-gray-900">Rp {{ (analyticsData.summary.totalRevenue || 0).toLocaleString('id-ID') }}</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
            <p class="text-sm text-gray-500">Total Pesanan (Selesai)</p>
            <p class="text-3xl font-bold text-gray-900">{{ analyticsData.summary.totalOrders || 0 }}</p>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-bold mb-4">Tren Pendapatan Harian</h2>
          <div class="h-80">
            <Line :data="lineChartData" :options="chartOptions" />
          </div>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-bold mb-4">Top 5 Menu Terlaris</h2>
          <div class="h-80">
            <Bar :data="barChartData" :options="chartOptions" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>