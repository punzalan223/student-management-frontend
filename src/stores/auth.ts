import { defineStore } from 'pinia';
import api from '@/lib/axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async login(email: string, password: string) {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await api.post('/login', { email, password });

        this.token = data.token;
        localStorage.setItem('token', data.token);

        const userRes = await api.get('/user');
        this.user = userRes.data;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Invalid Credentials';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchUser() {
      if (!this.token) return;
      try {
        const { data } = await api.get('/user');
        this.user = data;
      } catch {
        this.logout();
      }
    },

    async logout() {
      try {
        await api.post('/logout');
      } catch {}
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
    },

    isAdmin() {
      return this.user?.role === 'admin';
    },

    isStaff() {
      return this.user?.role === 'staff';
    },
  },
});
