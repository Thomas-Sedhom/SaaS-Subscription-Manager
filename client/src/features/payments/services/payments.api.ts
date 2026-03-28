import apiClient from '../../../services/apiClient';

export const paymentsApi = {
  getMine: async () => {
    const { data } = await apiClient.get('/payments/me');
    return data;
  }
};
