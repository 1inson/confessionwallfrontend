import axios from 'axios'
import { useUserStore } from '@/stores/userStore'
import { ElMessage } from 'element-plus';

const service = axios.create({
  baseURL: '/api',
  timeout: 10000,
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
let requests: ((token: string) => void)[] = [];

service.interceptors.response.use(
  async (response) => {
    const { code, msg, data } = response.data;
    const originalRequest = response.config;

    if (code === 200) {
      return data;
    }

    if (code === 2201) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          requests.push((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(service(originalRequest));
          });
        });
      }

      isRefreshing = true;
      const userStore = useUserStore();

      try {
        const newAccessToken = await userStore.refreshTokenAction();

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        const retryResponse = await service(originalRequest);
 
        requests.forEach((cb) => cb(newAccessToken));
        requests = [];
        
        return retryResponse;

      } catch (refreshError) {
        console.error('Token 刷新失败:', refreshError);
        userStore.logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    ElMessage.error(msg || '请求失败，请稍后重试');
    return Promise.reject(new Error(msg || 'Error'));
  },

  (error) => {
    ElMessage.error(error.message || '网络错误，请检查您的连接');
    return Promise.reject(error);
  }
);

export default service;