import { createRouter, createWebHistory } from 'vue-router'
import AuthView from '../views/AuthView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
     {
      path: '/',          // 当访问根路径时
      name: 'home', 
      component: AuthView 
    },
    {
      // 登录注册页
      path: '/auth',
      name: 'auth',
      component: AuthView
    },

    
  ],
})

export default router
