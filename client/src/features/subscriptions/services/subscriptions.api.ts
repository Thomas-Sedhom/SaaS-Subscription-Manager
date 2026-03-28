import apiClient from '../../../services/apiClient';

export const subscriptionsApi = {
  getMine: async () => {
    const { data } = await apiClient.get('/subscriptions/me');
    return data;
  },
  subscribe: async (payload) => {
    const { data } = await apiClient.post('/subscriptions', payload);
    return data;
  },
  changePlan: async (subscriptionId, payload) => {
    const { data } = await apiClient.post(`/subscriptions/${subscriptionId}/change-plan`, payload);
    return data;
  },
  cancel: async (subscriptionId, payload = {}) => {
    const { data } = await apiClient.post(`/subscriptions/${subscriptionId}/cancel`, payload);
    return data;
  }
};