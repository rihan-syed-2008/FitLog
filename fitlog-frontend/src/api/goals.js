import client from './client';

export const goalsApi = {
  getCurrentGoal: async () => {
    try {
      const res = await client.get('/goals/current');
      return res.data;
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return null;
      }
      throw err;
    }
  },

  upsertGoal: async (weeklyWorkoutTarget) => {
    const res = await client.put('/goals', { weeklyWorkoutTarget });
    return res.data;
  },

  getProgress: async () => {
    const res = await client.get('/goals/progress');
    return res.data;
  }
};
