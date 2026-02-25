import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    register: (data: any) => api.post('/auth/register', data),
    login: (data: any) => api.post('/auth/login', data),
};

export const testService = {
    submit: (data: any) => api.post('/tests/submit', data),
    getHistory: () => api.get('/tests/history'),
};

export const userService = {
    getPatients: () => api.get('/users/patients'),
    getPatientDetail: (id: string) => api.get(`/users/patients/${id}`),
    getAllUsers: () => api.get('/users/all'),
};

export default api;
