import axios from 'axios'
import { useUserStore } from '@/stores/userStore'
import { ElMessage } from 'element-plus';

const service = axios.create({
  baseURL: '/api',
  timeout: 5000
});

service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();

    if (userStore.accessToken) {
      config.headers['Authorization'] = `Bearer ${userStore.accessToken}`;
    }

    return config;
  },
    // 处理请求发送前的错误
  (error) => {
    console.error('请求发送失败:', error);
    return Promise.reject(error);
  }
  
);

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void, reject: (reason?: any) => void }> = [];

service.interceptors.response.use(
  (response) => {
    const { code, msg, data } = response.data;

    if (code == 200) {
      return data;
    }

    ElMessage.error(msg || '业务错误');
    return Promise.reject(new Error(msg || 'Error'));

  },
  async(error) => {
   const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const userStore = useUserStore();
        const newAccessToken = await userStore.refreshTokenAction();
        
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        failedQueue.forEach(promise => promise.resolve(service(originalRequest)));
        failedQueue = []; // 清空队列

        return service(originalRequest);

      } catch (refreshError) {
        failedQueue.forEach(promise => promise.reject(refreshError));
        failedQueue = [];
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    ElMessage.error(error.response?.data?.msg || error.message || '请求失败');
    return Promise.reject(error);
  }
);

export default service;