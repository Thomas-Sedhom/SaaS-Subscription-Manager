import apiClient from '../../../services/apiClient';

export const paymentMethodsApi = {
  getMine: async () => {
    const { data } = await apiClient.get('/payment-methods/me');
    return data;
  },
  create: async (payload) => {
    const { data } = await apiClient.post('/payment-methods', payload);
    return data;
  },
  setDefault: async (paymentMethodId) => {
    const { data } = await apiClient.patch(`/payment-methods/${paymentMethodId}/default`);
    return data;
  }
};
