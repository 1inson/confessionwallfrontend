<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useThemeStore } from '@/stores/themeStore';

const themeStore = useThemeStore();

const fontSizes = [
  { key: 'small', name: '小' },
  { key: 'medium', name: '中' },
  { key: 'large', name: '大' },
] as const; // 字体大小选项
</script>

<template>
  <aside class="sidebar">
    <ul class="sidebar-nav">
      <li>
        <RouterLink to="/community">
          <span class="icon">🏠</span>
          <span class="text">社区主页</span>
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/profile">
          <span class="icon">👤</span>
          <span class="text">个人中心</span>
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/my-posts">
          <span class="icon">📄</span>
          <span class="text">我的帖子</span>
        </RouterLink>
      </li>
    </ul>

    <div class="sidebar-footer">
      <div class="theme-settings">
        <h4 class="settings-title">主题设置</h4>
        
        <div class="setting-item">
          <span class="setting-label">主题颜色</span>
          <el-color-picker 
            :model-value="themeStore.primaryColor"
            @change="themeStore.setPrimaryColor" 
          />
        </div>

        <!-- 字体大小选择 -->
        <div class="setting-item">
          <span class="setting-label">字体</span>
          <div class="font-size-selector">
            <button
              v-for="size in fontSizes"
              :key="size.key"
              :class="{ 'active': themeStore.fontSizeKey === size.key }"
              @click="themeStore.setFontSizeKey(size.key)"
            >
              {{ size.name }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 200px;
  background-color: var(--primary-color);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0; 
  height: 100%; 
  z-index: 1000;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
  padding-top: 20px; 
}

.sidebar-nav {
  list-style: none;
  padding: 0;
  margin: 0;
}
.sidebar-nav li a {
  display: flex; 
  align-items: center; 
  gap: 15px;
  padding: 15px 20px; 
  color: #ecf0f1; 
  text-decoration: none;
  transition: background-color 0.3s;
}
.sidebar-nav li a:hover {
  background-color: #34495e;
}
.sidebar-nav li a.router-link-exact-active {
  background-color: var(--primary-color);
  color: white;
  font-weight: bold;
}
.text{
  font-size: var(--base-font-size);
}

/* 底部主题设置区域 */
.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #34495e;
}
.settings-title {
  margin: 0 0 15px 0;
  font-size: 0.9em;
  font-weight: bold;
  color: #bdc3c7;
  text-transform: uppercase;
}
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.setting-label {
  color: #ecf0f1;
  font-size: 14px;
}
.setting-item .el-color-picker {
  height: 28px;
}
/* 字体大小选择器 */
.font-size-selector {
  display: flex;
  border: 1px solid #7f8c8d;
  border-radius: 6px;
  overflow: hidden;
}
.font-size-selector button {
  background: none;
  border: none;
  color: #bdc3c7;
  padding: 5px 12px;
  cursor: pointer;
  transition: all 0.3s;
  border-left: 1px solid #7f8c8d;
}
.font-size-selector button:first-child {
  border-left: none;
}
.font-size-selector button:hover {
  background-color: #34495e;
}
.font-size-selector button.active {
  background-color: var(--primary-color);
  color: white;
  font-weight: bold;
}
</style>
