<script setup>
import axios from 'axios';
import { computed, ref } from 'vue';
import { useToast } from 'vue-toastification'; // <-- Impor useToast
import { useCartStore } from '../stores/cart';
import { useTableStore } from '../stores/table';

const cartStore = useCartStore();
const tableStore = useTableStore();
const toast = useToast(); // <-- Inisialisasi toast

const isCheckoutModalVisible = ref(false);
const customerName = ref('');
const manualTableNumber = ref('');
const errorMessage = ref('');

// Computed property untuk membaca nomor meja secara reaktif
const detectedTableNumber = computed(() => tableStore.tableNumber);

const openCheckoutModal = () => {
  if (cartStore.items.length === 0) return;
  isCheckoutModalVisible.value = true;
};

const handleConfirmCheckout = async () => {
  const finalTableNumber = detectedTableNumber.value || manualTableNumber.value;

  if (!customerName.value || !finalTableNumber) {
    errorMessage.value = 'Nama dan Nomor Meja wajib diisi.';
    return;
  }
  errorMessage.value = '';

  const payload = {
    customer_name: customerName.value,
    table_number: finalTableNumber,
    total_price: cartStore.cartTotal,
    payment_method: 'Cash',
    items: cartStore.items.map(item => ({ id: item.id, quantity: item.quantity }))
  };

  try {
    await axios.post('http://localhost:3000/api/orders', payload);
    toast.success('Pesanan berhasil dibuat!'); // <-- Ganti alert
    cartStore.clearCart();
    isCheckoutModalVisible.value = false;
    customerName.value = '';
    manualTableNumber.value = '';
  } catch {
    toast.error('Terjadi kesalahan saat membuat pesanan.'); // <-- Ganti alert
  }
};
</script>

<template>
  <div class="bg-white rounded-xl shadow-lg p-6 flex flex-col h-auto lg:h-[calc(100vh-2rem)]">
    <h2 class="text-xl font-bold text-gray-800 mb-4 border-b pb-3">
      Keranjang Anda ({{ cartStore.cartItemCount }})
    </h2>

    <div v-if="cartStore.items.length === 0" class="flex-grow flex flex-col justify-center items-center text-gray-500 py-10 lg:py-0">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <p>Keranjang masih kosong.</p>
    </div>

    <div v-else class="flex flex-col flex-grow">
      <ul class="flex-grow space-y-4 overflow-y-auto max-h-80 pr-2">
        <li v-for="item in cartStore.items" :key="item.id" class="flex items-center justify-between">
          <div>
            <p class="font-semibold text-gray-800">{{ item.name }}</p>
            <p class="text-sm text-gray-500">{{ item.quantity }}x</p>
          </div>
          <div class="flex items-center gap-4">
            <p class="font-semibold text-gray-900">
              Rp {{ (item.price * item.quantity).toLocaleString('id-ID') }}
            </p>
            <button @click="cartStore.removeItem(item.id)" class="bg-red-100 text-red-600 hover:bg-red-200 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold transition-colors">
              &times;
            </button>
          </div>
        </li>
      </ul>

      <div class="mt-auto border-t pt-4">
        <div class="flex justify-between items-center font-bold text-lg text-gray-900 mb-4">
          <span>Total:</span>
          <span>Rp {{ cartStore.cartTotal.toLocaleString('id-ID') }}</span>
        </div>
        <button @click="openCheckoutModal" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition duration-300">
          Pesan Sekarang
        </button>
      </div>
    </div>
  </div>

  <div v-if="isCheckoutModalVisible" class="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
    <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-4">
      <h2 class="text-2xl font-bold mb-6">Konfirmasi Pesanan</h2>
      <form @submit.prevent="handleConfirmCheckout">
        <div class="mb-4">
          <label for="customerName" class="block text-gray-700 font-bold mb-2">Nama Anda</label>
          <input type="text" v-model="customerName" id="customerName" class="w-full px-3 py-2 border rounded-md" placeholder="Masukkan nama Anda">
        </div>
        
        <div class="mb-6">
          <label class="block text-gray-700 font-bold mb-2">Nomor Meja</label>
          <div v-if="detectedTableNumber" class="w-full px-3 py-2 border border-dashed rounded-md bg-gray-100">
            Meja #<span class="font-bold text-lg">{{ detectedTableNumber }}</span>
          </div>
          <input v-else type="number" v-model="manualTableNumber" id="tableNumber" class="w-full px-3 py-2 border rounded-md" placeholder="Masukkan nomor meja">
        </div>

        <p v-if="errorMessage" class="text-red-500 text-sm text-center mb-4">{{ errorMessage }}</p>
        <div class="flex justify-end gap-4">
          <button type="button" @click="isCheckoutModalVisible = false" class="bg-gray-300 hover:bg-gray-400 px-6 py-2 rounded-lg">Batal</button>
          <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">Konfirmasi</button>
        </div>
      </form>
    </div>
  </div>
</template>