import client from './client';

export const summariesApi = {
  getDailySummary: async (date) => {
    const params = date ? { date } : {};
    const res = await client.get('/summaries/daily', { params });
    return res.data;
  },

  getWeeklyTrend: async (weeks = 8) => {
    const res = await client.get('/summaries/weekly-trend', { params: { weeks } });
    return res.data;
  },

  generateWeeklySummary: async (weekOf) => {
    const params = weekOf ? { weekOf } : {};
    const res = await client.post('/summaries/weekly', null, { params });
    return { data: res.data, status: res.status };
  },

  getWeeklySummaries: async () => {
    const res = await client.get('/summaries/weekly');
    return res.data;
  }
};
