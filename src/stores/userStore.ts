import { defineStore } from 'pinia'

import { registerApi, type RegisterData, loginApi, type LoginData, type AuthTokens } from '@/api/user' 

export const useUserStore = defineStore('user', {
  state: () => ({
    accessToken: localStorage.getItem('accessToken') || '',
    refreshToken: localStorage.getItem('refreshToken') || '',
    profile: null, // 用来存放用户信息
  }),
  getters: {
    // 用于路由守卫判断登录状态
    isLoggedIn: (state) => !!state.accessToken,
  },
  actions: {

    // 注册
     async register(registerData: RegisterData) {
      try {
        const responseData = await registerApi(registerData); 

        // 注册成功，执行“自动登录”逻辑
        this.accessToken = responseData['access-token'];
        this.refreshToken = responseData['refresh-token'];

        // 将 token 存入 localStorage，防止刷新后丢失
        localStorage.setItem('accessToken', this.accessToken);
        localStorage.setItem('refreshToken', this.refreshToken);

        console.log('注册并自动登录成功!');
        return true; 

      } catch (error) {
        console.error('注册失败:', error);
        return error; 
      }
    },

    // 登录
    async login(loginData: LoginData) {
      try {
        const responseData: AuthTokens = await loginApi(loginData);

        this.accessToken = responseData['access-token'];
        this.refreshToken = responseData['refresh-token'];

        localStorage.setItem('accessToken', this.accessToken);
        localStorage.setItem('refreshToken', this.refreshToken);

        console.log('登录成功!');
        return true; 

      } catch (error) {
        console.error('登录失败:', error);
        return error; 
      }
    },

  },

    },
);