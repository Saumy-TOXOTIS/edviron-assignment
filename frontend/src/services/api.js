import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL,
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export const login = (email, password) => api.post('/auth/login', { email, password });
export const refresh = (refreshToken) => api.post('/auth/refresh', { refreshToken });

export const fetchSummary = (params) => api.get('/reports/fees/summary', { params });
export const fetchPendingFees = (params) => api.get('/reports/fees/pending', { params });
export const fetchTransactions = (params) => api.get('/transactions', { params });
export const fetchTransactionById = (id) => api.get(`/transactions/${id}`);

export async function downloadPendingCsv(params = {}) {
  const response = await api.get('/exports/pending', { params, responseType: 'blob' });
  return response;
}
