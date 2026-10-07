import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_URL || 'http://192.168.100.17:8080/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('tchat_token');
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return config;
  },
  (error: AxiosError): Promise<never> => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const errorData = error.response.data as {
        message?: string;
        messages?: { error?: string };
      } | undefined;
      const errorMsg = errorData?.messages?.error || errorData?.message || '';

      if (
        errorMsg.includes('não possui vínculo ativo') ||
        errorMsg.includes('desativada') ||
        errorMsg.includes('Token inválido') ||
        errorMsg.includes('Token expirado')
      ) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('tchat_token');
          localStorage.removeItem('tchat_user');
          localStorage.removeItem('tchat_empresa');
          localStorage.removeItem('tchat_empresas_disponiveis');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
