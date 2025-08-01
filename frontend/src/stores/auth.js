import axios from 'axios';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import router from '../router';

export const useAuthStore = defineStore('auth', () => {
  // STATE
  const token = ref(localStorage.getItem('token'));
  const user = ref(JSON.parse(localStorage.getItem('user')));

  // ACTION: untuk login
  async function login(credentials) {
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', credentials);
      const responseToken = response.data.token;

      // Simpan token ke localStorage dan state
      localStorage.setItem('token', responseToken);
      token.value = responseToken;

      // (Opsional) Ambil data user dari token jika perlu, atau simpan data dasar
      // Di sini kita anggap saja menyimpan username
      const userData = { username: credentials.username };
      localStorage.setItem('user', JSON.stringify(userData));
      user.value = userData;

      // Atur header default Axios untuk request selanjutnya
      axios.defaults.headers.common['Authorization'] = `Bearer ${responseToken}`;

      // Arahkan ke halaman admin
      router.push('/admin');
    } catch (error) {
      console.error('Login gagal:', error);
      throw error; // Lemparkan eror agar bisa ditangkap di komponen
    }
  }

  // ACTION: untuk logout
  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    token.value = null;
    user.value = null;
    delete axios.defaults.headers.common['Authorization'];
    router.push('/login');
  }

  return { token, user, login, logout };
});