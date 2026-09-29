import client from './client';

export const authApi = {
  register: async (data) => {
    const res = await client.post('/auth/register', data);
    return res.data;
  },

  login: async (credentials) => {
    const res = await client.post('/auth/login', credentials);
    return res.data;
  },

  getMe: async () => {
    const res = await client.get('/auth/me');
    return res.data;
  }
};
