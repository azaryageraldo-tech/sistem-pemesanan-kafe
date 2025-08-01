<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useToast } from 'vue-toastification'; // <-- Impor useToast

const toast = useToast(); // <-- Inisialisasi toast

// State untuk daftar menu
const menus = ref([]);
const isLoading = ref(true);

// State untuk form Tambah Menu
const newMenu = ref({ name: '', description: '', price: null, category: 'Makanan', is_available: 1 });
const newImageFile = ref(null);

// State untuk modal Edit Menu
const isEditModalVisible = ref(false);
const editingMenu = ref(null);
const editImageFile = ref(null);

// Fetch semua menu (versi admin)
const fetchAdminMenus = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get('http://localhost:3000/api/menus/admin');
    menus.value = response.data.data;
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchAdminMenus);

// --- Logika Tambah Menu ---
const handleFileChange = (event, type) => {
  if (type === 'new') {
    newImageFile.value = event.target.files[0];
  } else {
    editImageFile.value = event.target.files[0];
  }
};

const handleAddSubmit = async () => {
  const formData = new FormData();
  Object.keys(newMenu.value).forEach(key => formData.append(key, newMenu.value[key]));
  if (newImageFile.value) formData.append('image', newImageFile.value);

  try {
    await axios.post('http://localhost:3000/api/menus', formData);
    toast.success('Menu berhasil ditambahkan!'); // <-- Ganti message.value
    await fetchAdminMenus(); // Refresh daftar menu
    // Reset form
    newMenu.value = { name: '', description: '', price: null, category: 'Makanan', is_available: 1 };
    newImageFile.value = null;
    document.getElementById('new_image').value = null;
  } catch {
    toast.error('Gagal menambahkan menu.');
  }
};

// --- Logika Edit Menu ---
const openEditModal = (menu) => {
  editingMenu.value = { ...menu }; // Salin data menu ke form edit
  isEditModalVisible.value = true;
};

const handleUpdateSubmit = async () => {
  const formData = new FormData();
  Object.keys(editingMenu.value).forEach(key => formData.append(key, editingMenu.value[key]));
  formData.append('existing_image_url', editingMenu.value.image_url || '');
  if (editImageFile.value) formData.append('image', editImageFile.value);

  try {
    await axios.put(`http://localhost:3000/api/menus/${editingMenu.value.id}`, formData);
    toast.success('Menu berhasil diperbarui!'); // <-- Ganti message.value
    await fetchAdminMenus();
    setTimeout(() => {
      isEditModalVisible.value = false;
    }, 1000);
  } catch {
    toast.error('Gagal memperbarui menu.');
  }
};

// --- Logika Hapus Menu ---
const handleDelete = async (menuId) => {
  if (confirm('Apakah Anda yakin ingin menghapus menu ini?')) {
    try {
      await axios.delete(`http://localhost:3000/api/menus/${menuId}`);
      toast.success('Menu berhasil dihapus.');
      await fetchAdminMenus();
    } catch {
      toast.error('Gagal menghapus menu.');
    }
  }
};
</script>

<template>
  <div class="p-8 bg-gray-100 min-h-screen">
    <div class="max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Manajemen Menu</h1>
        <RouterLink to="/admin" class="text-blue-500 hover:underline">&larr; Kembali ke Dashboard</RouterLink>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 class="text-xl font-bold mb-4">Tambah Menu Baru</h2>
        <form @submit.prevent="handleAddSubmit">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" v-model="newMenu.name" placeholder="Nama Menu" class="w-full px-3 py-2 border rounded-md">
            <input type="number" v-model="newMenu.price" placeholder="Harga" class="w-full px-3 py-2 border rounded-md">
            <textarea v-model="newMenu.description" placeholder="Deskripsi" rows="2" class="md:col-span-2 w-full px-3 py-2 border rounded-md"></textarea>
            <select v-model="newMenu.category" class="w-full px-3 py-2 border rounded-md bg-white">
              <option>Makanan</option> <option>Minuman</option> <option>Snack</option>
            </select>
            <input type="file" @change="handleFileChange($event, 'new')" id="new_image" class="w-full px-3 py-1.5 border rounded-md file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100">
          </div>
          <button type="submit" class="mt-4 w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700">Tambah</button>
        </form>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-bold mb-4">Daftar Menu Tersedia</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="bg-gray-100">
              <tr>
                <th class="p-3">Gambar</th>
                <th class="p-3">Nama</th>
                <th class="p-3">Harga</th>
                <th class="p-3">Kategori</th>
                <th class="p-3">Status</th>
                <th class="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="menu in menus" :key="menu.id" class="border-b">
                <td class="p-3">
                  <img :src="'http://localhost:3000' + menu.image_url" v-if="menu.image_url" class="w-16 h-16 object-cover rounded-md">
                </td>
                <td class="p-3 font-semibold">{{ menu.name }}</td>
                <td class="p-3">Rp {{ menu.price.toLocaleString('id-ID') }}</td>
                <td class="p-3">{{ menu.category }}</td>
                <td class="p-3">
                  <span :class="menu.is_available ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'" class="px-2 py-1 rounded-full text-xs font-semibold">
                    {{ menu.is_available ? 'Tersedia' : 'Habis' }}
                  </span>
                </td>
                <td class="p-3">
                  <button @click="openEditModal(menu)" class="text-blue-600 hover:underline mr-4">Edit</button>
                  <button @click="handleDelete(menu.id)" class="text-red-600 hover:underline">Hapus</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="isEditModalVisible" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 class="text-2xl font-bold mb-4">Edit Menu</h2>
        <form @submit.prevent="handleUpdateSubmit">
          <input type="text" v-model="editingMenu.name" class="w-full mb-2 p-2 border rounded">
          <textarea v-model="editingMenu.description" rows="3" class="w-full mb-2 p-2 border rounded"></textarea>
          <input type="number" v-model="editingMenu.price" class="w-full mb-2 p-2 border rounded">
          <select v-model="editingMenu.category" class="w-full mb-2 p-2 border rounded bg-white">
            <option>Makanan</option> <option>Minuman</option> <option>Snack</option>
          </select>
          <input type="file" @change="handleFileChange($event, 'edit')" class="w-full mb-2 p-1.5 border rounded">
          <select v-model="editingMenu.is_available" class="w-full mb-4 p-2 border rounded bg-white">
            <option :value="1">Tersedia</option>
            <option :value="0">Habis</option>
          </select>
          <div class="flex justify-end gap-4">
            <button type="button" @click="isEditModalVisible = false" class="bg-gray-300 px-4 py-2 rounded-lg">Batal</button>
            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-lg">Simpan Perubahan</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>