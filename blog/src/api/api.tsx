import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// 创建 Axios 实例
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // 开发时 /api，生产时完整地址
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});


// 添加请求拦截器
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers = {
                ...config.headers,
                Authorization: `${token}`,
            } as typeof config.headers;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

export default api;
