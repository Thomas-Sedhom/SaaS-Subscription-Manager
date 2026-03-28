import apiClient from '../../../services/apiClient';
import type { AuthMeResponse, AuthResponse, LogoutResponse } from '../../../types/app';

interface LoginPayload {
  email: string;
  password: string;
}

interface SignupPayload extends LoginPayload {
  name: string;
}

export const authApi = {
  login: async (payload: LoginPayload) => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
    return data;
  },
  signup: async (payload: SignupPayload) => {
    const { data } = await apiClient.post<AuthResponse>('/auth/signup', payload);
    return data;
  },
  logout: async () => {
    const { data } = await apiClient.post<LogoutResponse>('/auth/logout');
    return data;
  },
  getCurrentUser: async () => {
    const { data } = await apiClient.get<AuthMeResponse>('/auth/me');
    return data;
  }
};
