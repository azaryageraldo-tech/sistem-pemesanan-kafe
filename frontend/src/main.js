import './assets/main.css';

import axios from 'axios';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';

import App from './App.vue';
import router from './router';

// <-- TAMBAHKAN BARIS DI BAWAH INI -->
// Atur baseURL default untuk semua permintaan Axios
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
// <-- AKHIR DARI BARIS BARU -->

// Cek token saat aplikasi dimuat
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Daftarkan plugin Toast dengan beberapa opsi default
app.use(Toast, {
  transition: "Vue-Toastification__bounce",
  maxToasts: 5,
  newestOnTop: true,
  position: "top-right",
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: true,
  closeButton: "button",
  icon: true,
  rtl: false
});

// --- BLOK INTERCEPTOR BARU ---
// Dapatkan auth store setelah pinia di-inisialisasi
import { useAuthStore } from './stores/auth';
const pinia = createPinia();
app.use(pinia);
const authStore = useAuthStore(pinia);


axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      authStore.logout();
    }
    return Promise.reject(error);
  }
);
// --- AKHIR BLOK INTERCEPTOR ---

app.mount('#app')