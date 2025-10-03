<template>
  <div class="profile-page">
    <div v-if="userStore.profile" class="profile-card">
      <!-- 顶部，包含头像和操作按钮 -->
      <div class="profile-header">
        <div class="avatar-container">
          <el-avatar :size="130" :src="avatarPreviewUrl || getAvatarUrl(userStore.profile.avatar)">
             <el-icon :size="60"><UserFilled /></el-icon>
          </el-avatar>
        </div>
        <div class="action-buttons">
          <button @click="openEditModal" class="edit-button">编辑个人资料</button>
          <button @click="handleLogout" class="logout-button">退出登录</button>
        </div>
      </div>

      <!-- 用户详细信息，位于头像下方 -->
      <div class="user-details">
        <h1 class="name">{{ userStore.profile.name }}</h1>
        <p class="username">@{{ userStore.profile.username }}</p>
        <p class="user-id">用户ID: {{ userStore.profile.user_id }}</p>
      </div>
    </div>

    <div v-else class="loading-state">
      <p>正在加载用户信息...</p>
    </div>

    <!-- 编辑个人资料弹窗 -->
    <div v-if="isModalOpen" class="modal-overlay" @click.self="isModalOpen = false">
      <div class="modal-content">
        <h2>编辑个人资料</h2>
        <form @submit.prevent="handleProfileUpdate" class="update-form">
          <div class="form-group">
            <label for="name">昵称</label>
            <input id="name" type="text" v-model="editingProfile.name" />
          </div>

          <div class="form-group">
            <label for="username">用户名</label>
            <input id="username" type="text" v-model="editingProfile.username" />
          </div>
          
          <div class="form-group">
            <label for="avatar-upload">更换头像</label>
            <!-- 隐藏的原始文件输入框 -->
            <input id="avatar-upload" type="file" @change="onFileChange" accept="image/*" style="display: none;" />
            <!-- 自定义样式的上传按钮 -->
            <button type="button" @click="triggerFileUpload" class="upload-button">选择本地图片</button>
          </div>

          <!-- 图片预览 -->
          <div v-if="avatarPreviewUrl" class="avatar-preview-container">
            <p>新头像预览:</p>
            <img :src="avatarPreviewUrl" alt="New avatar preview" class="avatar-preview" />
          </div>

          <div class="modal-actions">
            <button type="button" @click="isModalOpen = false" class="cancel-button">取消</button>
            <button type="submit" class="save-button">保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import axios from 'axios';
import { UserFilled } from '@element-plus/icons-vue';

const userStore = useUserStore();

const isModalOpen = ref(false);

const editingProfile = ref({
  username: '',
  name: '',
  avatarFile: null as File | null, // 用于存储上传的文件对象
});

// 用于在前端显示新头像预览的 URL
const avatarPreviewUrl = ref<string | null>(null);

const triggerFileUpload = () => {
  document.getElementById('avatar-upload')?.click();
};
const getAvatarUrl = (avatarPath: string | null | undefined): string => {
  if (!avatarPath || avatarPath.includes('{image-loc}')) {
    return ''; 
  }
  return avatarPath;
};

onMounted(() => {
  if (!userStore.profile) {
    userStore.fetchUserProfile();
  }
});

watch(() => userStore.profile, (newProfile) => {
  if (newProfile) {
    editingProfile.value.username = newProfile.username;
    editingProfile.value.name = newProfile.name;
  }
}, { immediate: true }); 

const handleLogout = () => {
  userStore.logout();
};

const openEditModal = () => {

  if (userStore.profile) {
    editingProfile.value.name = userStore.profile.name;
    editingProfile.value.username = userStore.profile.username;
  }
    // 重置文件相关的状态，确保每次打开都是全新的
    editingProfile.value.avatarFile = null;
    avatarPreviewUrl.value = null;

  isModalOpen.value = true;
};

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    editingProfile.value.avatarFile = file;
    // 创建一个临时的 URL 用于图片预览
    avatarPreviewUrl.value = URL.createObjectURL(file);
  }
};


const handleProfileUpdate = async () => {
   if (!userStore.profile) return;

  const { username, name } = editingProfile.value;

  if (username.trim().length < 6 || username.trim().length > 20) {
    alert('用户名长度必须在 6 到 20 个字符之间！');
    return;
  }
  const usernameRegex = /^[a-zA-Z0-9]+$/;
  if (!usernameRegex.test(username.trim())) {
    alert('用户名只能包含英文和数字！');
    return;
  }
  if (name.trim().length < 1 || name.trim().length > 20) {
    alert('昵称长度必须在 1 到 20 个字符之间！');
    return;
  }

 let finalAvatarUrl = userStore.profile.avatar;

  if (editingProfile.value.avatarFile) {
    try {
      const newUrl = await userStore.uploadImage(editingProfile.value.avatarFile);
      finalAvatarUrl = newUrl; // 更新头像 URL 为上传成功后返回的新 URL
    } catch (error) {
      alert('头像上传失败，请重试！');
      return; 
    }
  }

  try {
    const updateData = {
      username: username.trim(),
      name: name.trim(),
      avatar: finalAvatarUrl 
    };
    
    const result = await userStore.updateProfile(updateData);

    if (result === true) {
      alert('用户信息更新成功！');
      isModalOpen.value = false; 
    } else {
  
      if (axios.isAxiosError(result) && result.response) {
        alert(`更新失败: ${result.response.data.msg || '未知错误'}`);
      } else {
        alert(`更新失败|| '未知错误'}`);
      }
    }
  } catch (error) {
    alert('发生意外错误，请稍后重试。');
  }
};
</script>

<style scoped>
.profile-page {
  display: flex; 
  justify-content: center; 
  align-items: flex-start;
  padding: 50px 15px; 
  min-height: 100vh; 
  background-color: var(--primary-color);/* 背景颜色 */
  color: #e0e0e0; 
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
.profile-card {
  background-color: calc(var(--primary-lightness) - 10%); 
  border: 1px solid #2f3336; 
  border-radius: 16px;
  padding: 20px; 
  width: 100%; 
  max-width: 600px; 
  position: relative;
}
.profile-header {
  display: flex; 
  justify-content: space-between; 
  align-items: flex-start;
  height: 70px; 
  margin-bottom: 15px;
}
.avatar-container {
  margin-top: -60px; 
  position: relative; 
  z-index: 2;
  border: 4px solid #000; 
  border-radius: 50%; 
  background-color: #000;
  width: 130px; height: 130px;
}
.avatar {
  width: 100%; 
  height: 100%; 
  border-radius: 50%; 
  object-fit: cover; 
  display: block;
}
.action-buttons {
  display: flex; 
  gap: 10px;
}
.edit-button, .logout-button {
  padding: 8px 16px; 
  border-radius: 9999px; 
  font-size: 14px; 
  font-weight: bold;
  cursor: pointer; 
  transition: background-color 0.2s ease; 
  background-color: transparent;
  color: #fff; 
  border: 1px solid #536471;
}
.edit-button:hover, .logout-button:hover {
  background-color: rgba(239, 243, 244, 0.1);
}
.user-details { text-align: left; }
.name { font-size: 22px; font-weight: 800; margin: 0 0 2px; color: #fff; }
.username { font-size: 15px; color: #71767b; margin: 0; }
.user-id { font-size: 13px; color: #536471; margin-top: 8px; }

/* 弹窗和表单 */
.modal-overlay {
  position: fixed; 
  top: 0; left: 0; 
  width: 100%; height: 100%;
  background-color: rgba(91, 112, 131, 0.4);
  display: flex; 
  justify-content: center; 
  align-items: center; 
  z-index: 1000;
}
.modal-content {
  background-color: #000; 
  padding: 25px; 
  border-radius: 16px;
  width: 90%; 
  max-width: 450px; 
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
}
.modal-content h2 { color: #fff; font-size: 22px; margin: 0 0 20px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; color: #71767b; margin-bottom: 8px; }

.form-group input[type="text"] {
  width: 100%; 
  padding: 12px; 
  background-color: #000;
  border: 1px solid #536471; 
  border-radius: 8px; color: #fff;
  font-size: 16px; 
  box-sizing: border-box;
}
.form-group input[type="text"]:focus {
  outline: none; 
  border-color: #1d9bf0;
}
.upload-button {
  padding: 10px 15px; 
  border: 1px solid #536471; 
  background-color: transparent;
  color: #fff; 
  border-radius: 8px; 
  cursor: pointer; 
  font-weight: bold;
}
.upload-button:hover { 
  background-color: rgba(255, 255, 255, 0.1); 
}
.avatar-preview-container { 
  margin-top: 15px; 
}
.avatar-preview-container p { 
  font-size: 14px; 
  color: #71767b; 
  margin-bottom: 10px; 
}
.avatar-preview { 
  width: 100px; 
  height: 100px; 
  border-radius: 50%; 
  object-fit: cover; 
  border: 2px solid #2f3336; }
.modal-actions { 
  display: flex; 
  justify-content: flex-end; 
  gap: 15px; margin-top: 25px; }
.cancel-button, .save-button {
  padding: 10px 20px; 
  border-radius: 9999px; 
  border: 1px solid transparent;
  font-weight: bold; 
  cursor: pointer; 
  transition: background-color 0.2s;
}
.cancel-button { 
  background-color: transparent; 
  color: #fff; 
  border: 1px solid #536471; 
}
.cancel-button:hover { 
  background-color: rgba(255, 255, 255, 0.1); 
}
.save-button { 
  background-color: #1d9bf0; color: #fff; 
}
.save-button:hover { 
  background-color: #1a8cd8; 
}

</style>