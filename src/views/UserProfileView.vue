<template>
  <div class="user-profile-page">
    <div v-if="isLoadingProfile && !profile" class="loading-state">
      正在加载用户主页...
    </div>

    <div v-else-if="profile" class="profile-container">
      <div class="profile-header">
        <el-avatar :size="100" :src="profile.avatar" class="profile-avatar" />
        <div class="profile-info">
          <h1 class="profile-name">{{ profile.name }}</h1>
          <p class="profile-username">@{{ profile.username }}</p>
        </div>
        <div class="profile-actions">
        <div class="actions">
        
        <el-button 
          v-if="!isUserBlocked"
          type="danger" 
          plain 
          @click="handleBlock"
        >
          屏蔽该用户
        </el-button>
        </div>

        </div>

    </div>
</div >
    <el-empty v-else description="无法找到该用户，或加载失败。" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { storeToRefs } from 'pinia';
import { Delete } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const { 
  isLoadingProfile, 
  viewingUserProfile:profile, 
} = storeToRefs(userStore);

const username = route.params.username as string;

const isUserBlocked = computed(() => {
  if (!profile.value) {
    return false;
  }
  return userStore.isBlocked(profile.value.username);
});

const handleBlock = () => {
  if (profile.value && profile.value.username) {
    userStore.blockUser(profile.value.username);
  }
};

const handleUnblock = () => {
  if (profile.value) {
    userStore.unblockUser(profile.value.username);
  }
};

onMounted(() => {
  if (username) {
    userStore.fetchotherUserProfile(username);
  } else {
    console.error('无法加载用户信息');
  }
});


</script>

<style scoped>
.user-profile-page { 
  max-width: 900px; 
  margin: 20px auto; 
}
.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 30px;
  background-color: var(--primary-color);
  border-radius: 12px;
  margin-bottom: 30px;
}
.profile-avatar { 
  border: 4px solid #fff; 
  box-shadow: 0 4px 10px rgba(0,0,0,0.1); 
}
.profile-info {
  flex-grow: 1; 
}
.profile-name { 
  font-size: 2em; 
  margin: 0; 
}
.profile-name { 
  font-size: 2em; 
  margin: 0; }
.profile-username { 
  font-size: 1.5em; 
  margin: 0; 
}
.profile-actions {
  display: flex;
  gap: 10px;
}
.loading-state { 
  text-align: center; 
}
</style>
