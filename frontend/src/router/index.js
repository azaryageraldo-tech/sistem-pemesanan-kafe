import { createRouter, createWebHistory } from 'vue-router';
import AdminView from '../views/AdminView.vue';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import MenuManagementView from '../views/admin/MenuManagementView.vue';
import SalesReportView from '../views/admin/SalesReportView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/menus',
      name: 'admin-menus',
      component: MenuManagementView,
      meta: { requiresAuth: true }
    },
     {
      path: '/admin/reports',
      name: 'admin-reports',
      component: SalesReportView,
      meta: { requiresAuth: true }
    }
  ]
});

// Navigation Guard untuk melindungi route
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');

  // Jika route yang dituju memerlukan otentikasi dan tidak ada token
  if (to.meta.requiresAuth && !token) {
    // Alihkan ke halaman login
    next({ name: 'login' });
  } else {
    // Jika tidak, lanjutkan navigasi
    next();
  }
});

export default router;