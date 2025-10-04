import { createRouter, createWebHistory } from 'vue-router'
import AuthView from '../views/AuthView.vue'
import ProfileView from '../views/ProfileView.vue'
import MyPost from '../views/MyPost.vue'

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

    
  ],
})

export default router
