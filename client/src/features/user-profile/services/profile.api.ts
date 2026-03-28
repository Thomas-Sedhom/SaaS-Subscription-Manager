import apiClient from '../../../services/apiClient';

export const profileApi = {
  getProfile: async () => {
    const { data } = await apiClient.get('/users/profile');
    return data;
  },
  updateProfile: async (payload) => {
    const { data } = await apiClient.patch('/users/profile', payload);
    return data;
  },
  getUsers: async () => {
    const { data } = await apiClient.get('/users');
    return data;
  },
  getUserById: async (userId) => {
    const { data } = await apiClient.get(`/users/${userId}`);
    return data;
  }
};
