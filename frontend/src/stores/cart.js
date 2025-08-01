import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useCartStore = defineStore('cart', () => {
  // STATE
  const items = ref([]);

  // GETTERS
  const cartItemCount = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0);
  });

  const cartTotal = computed(() => {
    return items.value.reduce((total, item) => total + (item.price * item.quantity), 0);
  });

  // ACTIONS
  function addItem(menuItem) {
    const existingItem = items.value.find(item => item.id === menuItem.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      items.value.push({ ...menuItem, quantity: 1 });
    }
  }

  function removeItem(menuId) {
    items.value = items.value.filter(item => item.id !== menuId);
  }

  function clearCart() {
    items.value = [];
  }

  return { items, cartItemCount, cartTotal, addItem, removeItem, clearCart };
});