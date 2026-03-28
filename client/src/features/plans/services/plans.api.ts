import apiClient from '../../../services/apiClient';

export const plansApi = {
  getPlans: async () => {
    const { data } = await apiClient.get('/plans');
    return data;
  },
  getPlanById: async (planId) => {
    const { data } = await apiClient.get(`/plans/${planId}`);
    return data;
  },
  createPlan: async (payload) => {
    const { data } = await apiClient.post('/plans', payload);
    return data;
  },
  updatePlan: async (planId, payload) => {
    const { data } = await apiClient.patch(`/plans/${planId}`, payload);
    return data;
  },
  deletePlan: async (planId) => {
    const { data } = await apiClient.delete(`/plans/${planId}`);
    return data;
  }
};
