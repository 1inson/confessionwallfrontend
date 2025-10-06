import { createRouter, createWebHistory } from 'vue-router'
import AuthView from '../views/AuthView.vue'
import ProfileView from '../views/ProfileView.vue'
import MyPost from '../views/MyPost.vue'
import CommunityView from '@/views/CommunityView.vue'
import PostDetailPage from '@/views/PostDetailPage.vue'
import UserProfileView from '@/views/UserProfileView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
     {
      path: '/',          // 当访问根路径时
      name: 'home', 
      component: AuthView ,
      meta: { hideNavbar: true } 
    },
    {
      // 登录注册页
      path: '/auth',
      name: 'auth',
      component: AuthView,
      meta: { hideNavbar: true } 
    },

    {
      // 个人中心页
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true }
    },

    {
      // 我的帖子页
      path: '/my-posts',
      name:'my-posts',
      component: MyPost,
      meta: { requiresAuth: true }
    },

    {
      //社区帖子页
      path: '/community',
      name: 'community',
      component: CommunityView,
      meta: { requiresAuth: true }
    },

    // 帖子详情页
    {
     path: '/confessions/:id',
     name: 'post-detail',
     component: PostDetailPage,
     meta: { requiresAuth: true }
    },
    
    // 用户详情页
    {
      path: '/users/:username',
      name: 'user-profile',
      component: UserProfileView,
      meta: { requiresAuth: true }
    },
  ],
})

export default router
