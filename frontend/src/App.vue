<script setup>
import { computed, watch } from 'vue'; // <-- Tambahkan watch
import { RouterView, useRoute } from 'vue-router';
import ShoppingCart from './components/ShoppingCart.vue';
import { useTableStore } from './stores/table';

const route = useRoute();
const tableStore = useTableStore();

const isAdminRoute = computed(() => route.path.startsWith('/admin'));
const isLoginRoute = computed(() => route.path === '/login');

// GUNAKAN WATCH UNTUK MENJAMIN REAKTIVITAS
watch(
  () => route.query.meja, // Sumber yang diamati
  (newTableNumber) => {   // Fungsi yang dijalankan saat ada perubahan
    if (newTableNumber) {
      tableStore.setTableNumber(newTableNumber);
    }
  },
  { immediate: true } // Opsi agar watch langsung berjalan saat komponen dimuat
);
</script>

<template>
  <div v-if="isAdminRoute || isLoginRoute">
    <RouterView />
  </div>
  <div v-else class="flex flex-col lg:flex-row min-h-screen bg-gray-50">
    <main class="flex-grow p-4 sm:p-6">
      <RouterView />
    </main>
    <aside class="w-full lg:w-96 flex-shrink-0 p-4">
      <div>
        <ShoppingCart />
      </div>
    </aside>
  </div>
</template>

<style>
body {
  font-family: sans-serif;
}
</style>