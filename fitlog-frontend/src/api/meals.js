import client from './client';

export const mealsApi = {
  getMeals: async (params = {}) => {
    const res = await client.get('/meals', { params });
    return res.data;
  },

  getMealById: async (id) => {
    const res = await client.get(`/meals/${id}`);
    return res.data;
  },

  createMeal: async (data) => {
    const res = await client.post('/meals', data);
    return res.data;
  },

  updateMeal: async (id, data) => {
    const res = await client.put(`/meals/${id}`, data);
    return res.data;
  },

  deleteMeal: async (id) => {
    await client.delete(`/meals/${id}`);
  }
};
