import axios from 'axios';

// Criação da instância do cliente HTTP Axios configurado para o SURTE
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor opcional para logs de desenvolvimento ou inserção automática de token JWT no futuro
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('surte_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
