// src/features/auth/model/authService.ts
import { authApi } from '../api/authApi';
import type { LoginRequest } from '../api/authApi';
import { authStore } from './store';

export const authService = {
  async login(dto: LoginRequest) {
    const res = await authApi.login(dto);
    authStore.setAuth(res.accessToken, res.user);
    return res;
  },
  logout() {
    authStore.logout();
  },
};