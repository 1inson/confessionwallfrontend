<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useConfessionStore } from '@/stores/confessionStore';
import { storeToRefs } from 'pinia';

import { Pointer, View } from '@element-plus/icons-vue';

const confessionStore = useConfessionStore();
const router = useRouter();

const { hotConfessions, isLoadingHot } = storeToRefs(confessionStore);

const navigateToDetail = (postId: number) => {
  router.push(`/confessions/${postId}`);
};

onMounted(() => {
  confessionStore.fetchHotConfessions();
});
</script>

<template>
  <div class="hot-posts-list-card">
    <h3 class="card-title">🔥 热度排行榜</h3>
    <div v-if="isLoadingHot" class="loading-state">加载中...</div>
    <div v-else-if="!hotConfessions || hotConfessions.length === 0" class="empty-state">
      暂无热门内容
    </div>
    <ol v-else class="posts-list">
      <li v-for="(post, index) in hotConfessions" :key="post.id" class="post-item" @click="navigateToDetail(post.id)">
        <span class="post-rank">{{ index + 1 }}.</span>
        <span class="post-title">{{ post.title }}</span>
        <span class="post-likes">
          <el-icon><Pointer /></el-icon>
          {{ post.likes }}
        </span>
        <span class="post-views">  
            <el-icon><View /></el-icon>
            {{ post.views }} 
        </span>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.hot-posts-list-card {
  background-color: #f0f0f0;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e0e0e0;
}
.card-title {
  margin: 0 0 15px 0;
  font-size: 1.1rem;
  font-weight: 600;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
}
.posts-list {
  list-style-type: decimal; 
  padding-left: 20px;
  margin: 0;
}
.post-item {
  padding: 10px 5px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 6px;
  transition: background-color 0.2s;
  font-size: 0.95rem;
  flex-shrink: 0; 
}
.post-item:hover {
  background-color: #f5f7fa;
}
.post-title {
  /* 防止标题过长 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80%;
  font-size: var(--base-font-size);
}
.post-likes {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #999;
  font-size: 0.85rem;
  flex-shrink: 0; /* 防止被压缩 */
}
.loading-state, .empty-state {
  color: #999;
  text-align: center;
  padding: 20px 0;
}
</style>