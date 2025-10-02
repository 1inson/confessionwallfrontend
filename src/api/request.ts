import axios from 'axios'
import { useUserStore } from '@/stores/userStore'

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

service.interceptors.response.use(
  (response) => {
    const res = response.data;

    if (res.code == 200) {
      return res.data;
    }


    console.error('业务错误:', res.msg || '未知错误');
 
    return Promise.reject(new Error(res.msg || 'Error'));
  },
  (error) => {
    // 处理 HTTP 网络错误 (例如 404, 500, 401)
    console.error('网络错误:', error.message);

    if (error.response && error.response.status == 401) {
      alert('登录状态已过期，请重新登录！');
    }

    return Promise.reject(error);
  }
);

export default service;