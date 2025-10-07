import { defineStore } from 'pinia'
import axios from 'axios';
import { ElMessage } from 'element-plus';

import { refreshTokenApi, type RefreshAuthTokens,
  registerApi, type RegisterData,
   loginApi, type LoginData,
   type AuthTokens, getProfileApi, type UserProfile,
    updateProfileApi,  type UpdateProfileData, uploadImageApi, type ImageUploadResponse,
    getUserProfileApi, 
    blockUserApi, unblockUserApi, getBlacklistApi,
     } from '@/api/user' 

import router from '@/router'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: {
      accessToken: localStorage.getItem('ACCESS_TOKEN') || '',
      refreshToken: localStorage.getItem('REFRESH_TOKEN') || '',
    },

    profile: null as UserProfile | null, // 用来存放用户信息

    blacklist: [] as UserProfile[], 
    isLoadingBlacklist: false,
    blockedUsernames: new Set<string>(),

    viewingUserProfile: null as UserProfile | null, // 当前正在查看的用户信息
    isLoadingProfile: false, 

  }),
  getters: {
    // 用于路由守卫判断登录状态
    accessToken: (state) => state.token.accessToken,
    isLoggedIn: (state) => !!state.token.refreshToken && state.profile !== null,

    // 用户是否被拉黑
    isBlocked: (state) => {
      return (username: string): boolean => !!state.blacklist.find(user=>user.username === username);
    },
  },
  actions: {

    setTokens(tokens: RefreshAuthTokens) {
      this.token.accessToken = tokens['access-token'];
      this.token.refreshToken = tokens['refresh-token'];
      localStorage.setItem('ACCESS_TOKEN', this.token.accessToken);
      localStorage.setItem('REFRESH_TOKEN', this.token.refreshToken);
    },
    logout() {
      this.token.accessToken = '';
      this.token.refreshToken = '';
      this.profile = null;
      localStorage.removeItem('ACCESS_TOKEN');
      localStorage.removeItem('REFRESH_TOKEN');
      router.push('/Auth');
    },

    // 刷新 token
    async refreshTokenAction() {
      try {
        if (!this.token.refreshToken) {
          throw new Error('No refresh token available.');
        }
        const newTokens = await refreshTokenApi(this.token.refreshToken);
        this.setTokens(newTokens);
        return newTokens['access-token'];
      } catch (error) {
        console.error('Failed to refresh token:', error);
        this.logout();
        throw error;
      }
    },


    // 注册
     async register(registerData: RegisterData) {
      try {
        const responseData = await registerApi(registerData); 

        this.setTokens(responseData);

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

        this.setTokens(responseData);

        await this.fetchUserProfile();
        console.log('登录成功!');
        return true; 

      } catch (error) {
        console.error('登录失败:', error);
        return error; 
      }
    },

    // 获取用户(自己)信息
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

    // 获取其他用户信息
    async fetchotherUserProfile(username: string) {
      this.isLoadingProfile = true;
      this.viewingUserProfile = null; 
      
      try {
        const userProfileData = await getUserProfileApi(username);
        this.viewingUserProfile = userProfileData;
        return true; 
      } catch (error) {
        console.error(`获取用户 @${username} 信息失败:`, error);
        ElMessage.error('无法加载用户信息');
        return false;
      } finally {
        this.isLoadingProfile = false;
      }
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

    // 拉黑用户
    async fetchBlacklistUsernames() {
      this.isLoadingBlacklist = true;
      this.blacklist = []; 
      try {
        console.log('开始执行...');

        const { users: usernames } = await getBlacklistApi();
         if (!usernames || usernames.length === 0) {
        return; 
      }
        const profilePromises = usernames.map(username => getUserProfileApi(username));
        const profiles = await Promise.all(profilePromises);
        this.blacklist = profiles;
        console.log('获取黑名单成功:', this.blockedUsernames);
      } catch (error) {
        console.error('获取黑名单失败:', error);
        ElMessage.error('获取黑名单失败');
       } 
      finally { this.isLoadingBlacklist = false; }
    },
    
    async blockUser(username: string) {
      try {
        await blockUserApi(username);
        
        ElMessage.success(`已屏蔽 @${username}`);
        await this.fetchBlacklistUsernames();

      } catch (error) { 
        console.error(`屏蔽用户 @${username} 失败:`, error);
        ElMessage.error(`屏蔽用户 @${username} 失败`);
       }
    },

    async unblockUser(username: string) {
      try {
        await unblockUserApi(username);
        this.blacklist = this.blacklist.filter(
      user => user.username !== username
    );
        ElMessage.success(`已取消对 @${username} 的屏蔽`);
      } catch (error) { 
        console.error(`取消屏蔽用户 @${username} 失败:`, error);
        ElMessage.error(`取消屏蔽用户 @${username} 失败`);
       }
    },


  
  },

  },
);