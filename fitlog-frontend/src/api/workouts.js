import client from './client';

export const workoutsApi = {
  getWorkouts: async (params = {}) => {
    const res = await client.get('/workouts', { params });
    return res.data;
  },

  getWorkoutById: async (id) => {
    const res = await client.get(`/workouts/${id}`);
    return res.data;
  },

  createWorkout: async (data) => {
    const res = await client.post('/workouts', data);
    return res.data;
  },

  updateWorkout: async (id, data) => {
    const res = await client.put(`/workouts/${id}`, data);
    return res.data;
  },

  deleteWorkout: async (id) => {
    await client.delete(`/workouts/${id}`);
  }
};
