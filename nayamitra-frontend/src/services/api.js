import axios from 'axios';

const API_BASE = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nyayamitra_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('nyayamitra_token');
      localStorage.removeItem('nyayamitra_user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export const authService = {
  async login(username, password) {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    const res = await api.post('/api/auth/token', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return res.data;
  },
  async signup(email, password, role, tenantId) {
    const res = await api.post('/api/auth/signup', {
      email,
      password,
      role,
      tenant_id: tenantId,
    });
    return res.data;
  },
};

export const documentService = {
  async list() {
    const res = await api.get('/api/documents');
    return res.data;
  },
  async get(docId) {
    const res = await api.get(`/api/document/${docId}`);
    return res.data;
  },
  async upload(file) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await api.post('/api/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  async verify(docId, actionPlan) {
    const res = await api.post(`/api/verify/${docId}`, actionPlan);
    return res.data;
  },
  async chat(docId, message, history) {
    const res = await api.post(`/api/chat/${docId}`, { message, history });
    return res.data;
  },
};

export const dashboardService = {
  async getActions() {
    const res = await api.get('/api/dashboard/actions');
    return res.data;
  },
  async getAuditLogs() {
    const res = await api.get('/api/audit-log');
    return res.data;
  },
};

export const feedbackService = {
  async submit(directiveText, originalDept, correctedDept) {
    const res = await api.post('/api/router/feedback', {
      directive_text: directiveText,
      original_department: originalDept,
      corrected_department: correctedDept,
    });
    return res.data;
  },
};

export default api;
