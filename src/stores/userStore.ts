import { defineStore } from 'pinia'
import axios from 'axios';

import { registerApi, type RegisterData,
   loginApi, type LoginData,
   type AuthTokens, getProfileApi, type UserProfile,
    updateProfileApi,  type UpdateProfileData, uploadImageApi, type ImageUploadResponse} from '@/api/user' 

import router from '@/router'

export const useUserStore = defineStore('user', {
  state: () => ({
    accessToken: localStorage.getItem('accessToken') || '',
    refreshToken: localStorage.getItem('refreshToken') || '',
    profile: null as UserProfile | null, // 用来存放用户信息
  }),
  getters: {
    // 用于路由守卫判断登录状态
    isLoggedIn: (state) => !!state.accessToken&&!!state.profile,
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

        await this.fetchUserProfile(); // 获取用户信息

        console.log('注册成功获取用户信息!');
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

        await this.fetchUserProfile();
        console.log('登录成功!');
        return true; 

      } catch (error) {
        console.error('登录失败:', error);
        return error; 
      }
    },

    // 获取用户信息
    async fetchUserProfile() {
      if (!this.accessToken) return;

      try {
        const profileData = await getProfileApi();
        this.profile = profileData;
      } catch (error) {
        console.error('获取用户信息失败，可能是 token 失效:', error);
        this.logout();
      }
    },

    logout() {
      this.accessToken = '';
      this.refreshToken = '';
      this.profile = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      // 跳转到登录页
      router.push('/auth');
    },

 // 修改用户信息
    async updateProfile(profileData: UpdateProfileData){
      if (!this.accessToken) {
        console.error('无法更新用户信息：用户未登录');
        this.logout(); 
        return false;
      }

      try {

        await updateProfileApi(profileData);
        await this.fetchUserProfile();

        console.log('用户信息更新成功！');
        return true; 

      } catch (error) {
        console.error('更新用户信息失败:', error);

        if (axios.isAxiosError(error) && error.response?.status == 401) {
          this.logout();
        }

        throw error;
      }
    },

    // 上传头像
        async uploadImage(file: File) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        // 调用专门的图片上传 API
        const response: ImageUploadResponse = await uploadImageApi(formData);
        
        // 成功后，返回新的图片 URL
        return response.file_url;

      } catch (error) {
        console.error('图片上传 Action 失败:', error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            this.logout();
        }
        // 将错误抛出，让调用方 (UI层) 知道上传失败了
        throw error; 
      }
    },


  },

  },
);