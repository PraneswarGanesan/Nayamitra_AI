import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nayamitra_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (email, password) =>
  api.post('/auth/token', new URLSearchParams({ username: email, password }), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

// Documents
export const uploadDocument = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getDocuments = () => api.get('/documents');
export const getDocument = (docId) => api.get(`/document/${docId}`);
export const verifyDocument = (docId, plan) => api.post(`/verify/${docId}`, plan);

// Dashboard
export const getDashboardActions = () => api.get('/dashboard/actions');

// Feedback
export const submitRouterFeedback = (data) => api.post('/router/feedback', data);

export default api;
