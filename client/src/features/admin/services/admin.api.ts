import apiClient from '../../../services/apiClient';

export const adminApi = {
  getDashboardStats: async () => {
    const { data } = await apiClient.get('/admin/dashboard');
    return data;
  },
  createAdmin: async (payload) => {
    const { data } = await apiClient.post('/admin/admins', payload);
    return data;
  }
};
