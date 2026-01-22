import axios from 'axios';
import { Proxy, Config, Stats } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const proxyApi = {
  getProxies: async () => {
    const response = await api.get<{ proxies: Proxy[]; total: number }>('/proxies');
    return response.data;
  },

  addProxy: async (proxy: Omit<Proxy, 'id' | 'status' | 'response_time' | 'success_count' | 'fail_count' | 'last_check' | 'created_at'>) => {
    const response = await api.post('/proxies', proxy);
    return response.data;
  },

  deleteProxy: async (id: string) => {
    const response = await api.delete(`/proxies/${id}`);
    return response.data;
  },

  importProxies: async (proxies: any[]) => {
    const response = await api.post('/proxies/import', { proxies });
    return response.data;
  },

  validateProxies: async () => {
    const response = await api.post('/proxies/validate');
    return response.data;
  },

  getConfig: async () => {
    const response = await api.get<Config>('/config');
    return response.data;
  },

  updateConfig: async (config: Config) => {
    const response = await api.put('/config', config);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get<Stats>('/stats');
    return response.data;
  },
};

export default api;
