import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useTableStore = defineStore('table', () => {
  // State untuk menyimpan nomor meja
  const tableNumber = ref(null);

  // Action untuk mengatur nomor meja
  function setTableNumber(number) {
    if (number) {
         console.log('2. Menyimpan ke Store. Nomor Meja:', number); 
      tableNumber.value = number;
    }
  }

  return { tableNumber, setTableNumber };
});