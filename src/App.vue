<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { watchEffect } from 'vue';

import { useUserStore } from './stores/userStore'; 
import { useThemeStore } from './stores/themeStore'; 
import Sidebar from './components/Sidebar.vue'; 

const userStore = useUserStore();
const themeStore = useThemeStore();

watchEffect(() => {
  const root = document.documentElement;
  root.style.setProperty('--primary-color', themeStore.primaryColor);

  root.style.setProperty('--base-font-size', `${themeStore.fontSize}px`);
});
</script>

<template>
<div class="app-layout">
    <!-- 主内容区域 -->
    <main class="main-content":class="{ 'content-shifted': userStore.isLoggedIn }">
      <RouterView />
    </main>

    <template v-if="userStore.isLoggedIn"> <!--待修改-->
      <Sidebar />
    </template>
  </div>
</template>

<style>
:root {
  --primary-color: #007bff; 
  --base-font-size: 16px; 
}

html,
body {
  margin: 0;
  padding: 0;
}
#app {
  height: 100vh;
  width: 100vw;
}
.main-content {
  transition: margin 0.3s ease;
  
  box-sizing: border-box;
}
.main-content.content-shifted {
  margin-left: 200px;
}
</style>
