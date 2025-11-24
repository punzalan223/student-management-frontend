import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import Login from '@/pages/Login.vue';
import ServiceRequest from '@/pages/ServiceRequest.vue';
import { useAuthStore } from '@/stores/auth';
import AppSideBar from '@/components/AppSideBar.vue';
import StudentManagement from '@/pages/StudentManagement.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Login',
    component: Login,
  },
  {
    path: '/service-requests',
    component: AppSideBar,
    meta: { requiresAuth: true },
    children: [
        {
          path: '',
          name: 'ServiceRequests',
          component: ServiceRequest,
        },
    ],
  },
  {
    path: '/student-management',
    component: AppSideBar,
    meta: { requiresAuth: true },
    children: [
        {
          path: '',
          name: 'StudentManagement',
          component: StudentManagement,
        },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Global auth guard
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();

  // If token exists but user info is empty, fetch user
  if (auth.token && !auth.user) {
    await auth.fetchUser();
  }

  // Redirect to login if route requires auth but no token
  if (to.meta.requiresAuth && !auth.token) {
    return next('/');
  }

  // Redirect logged-in users away from login page
  if (to.path === '/' && auth.token) {
    return next('/service-requests');
  }

  next();
});


export default router;
