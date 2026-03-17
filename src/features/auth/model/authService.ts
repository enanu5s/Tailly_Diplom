// /src/features/auth/model/authService.ts
import { authStore } from './authStore';
import { authApi } from '../api/authApi';

import type { LoginPayload } from './types';

export const authService = {
  async login(dto: LoginPayload) {
    const res = await authApi.login(dto);
    authStore.setAuth(res.accessToken, res.user);
    return res;
  },

  logout() {
    authStore.logout();
  },
};