import axios from 'axios';

const AUTH_TOKEN_KEY = 'saas_subscription_manager_token';

const getStoredToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY);
};

export const authTokenStorage = {
  get: () => getStoredToken(),
  set: (token: string) => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  },
  clear: () => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  }
};

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1',
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  const token = authTokenStorage.get();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default apiClient;
