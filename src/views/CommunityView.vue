<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useConfessionStore,  } from '@/stores/confessionStore';
import { storeToRefs } from 'pinia';
import { View, Pointer } from '@element-plus/icons-vue';
import  HotPostsList from '@/components/HotPostsList.vue';
import type { Confession } from '@/api/confession';
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();
const confessionStore = useConfessionStore();
const router = useRouter();
const { allConfessions, allTotalItems, allCurrentPage, isLoading } = storeToRefs(confessionStore);

const handlePageChange = (newPage: number) => {
  confessionStore.fetchAllConfessions({ page: newPage, size: 10 });
};
const handleLike = (post: Confession) => {
  confessionStore.toggleLike(post);
};

const navigateToDetail = (postId: number) => {
  router.push(`/confessions/${postId}`);
};

const navigateToProfileDetail = (username: string) => {
  router.push(`/users/${username}`);
};

onMounted(() => {
  confessionStore.fetchAllConfessions({ page: 1, size: 10 });
  userStore.fetchUserProfile();
});
</script>

<template>
    <div class="community-home">
    <aside class="sidebar-left">
      <HotPostsList />
    </aside>
  <div class="main-content">
    <h1>社区广场</h1>

    <div v-if="isLoading" class="loading">加载中...</div>

    <div v-else-if="confessionStore.allConfessions.length > 0" class="posts-list">
      <el-card v-for="post in confessionStore.allConfessions" :key="post.id" class="post-card" >
        <template #header>
          <div class="card-header">
            <!-- 用户信息部分 -->
            <div class="user-info" @click ="navigateToProfileDetail(post.poster_name)">
              <el-avatar :size="40" :src="post.avatar" />
              <div class="user-details">
                <span class="user-name">{{ post.name }}</span>
                <span class="post-time">发布于: {{ post.create_at }}</span>
              </div>
            </div>
          </div>
        </template>
        
        <!-- 帖子主体内容 -->
        <div class="post-body" @click="navigateToDetail(post.id)">
          <h3 class="post-title">{{ post.title }}</h3>
          <p class="post-content">{{ post.content }}</p>

          <!-- 帖子图片 -->
          <div v-if="post.photos && post.photos.length > 0" class="post-images">
            <el-image
              v-for="(photoUrl, index) in post.photos"
              :key="index"
              :src="photoUrl"
              :preview-src-list="post.photos"
              :initial-index="index"
              fit="cover"
              class="post-image"
            />
          </div>
        </div>

        <!-- 帖子底部互动栏 -->
        <div class="card-footer">
          <div class="meta-item">
            <el-icon><View /></el-icon>
            <span>{{ post.views }} 次浏览</span>
          </div>
          <div class="meta-item interactive" @click="handleLike(post)">
            <el-icon :color="!post.liked ? '#F56C6C' : ''"><Pointer /></el-icon>
            <span>{{ post.likes }} 次点赞</span>
          </div>
        </div>
      </el-card>
    </div>


    <div class="pagination-container">
      <el-pagination
        v-model:current-page="allCurrentPage"
        :page-size="10"
        :total="allTotalItems"
        layout="prev, pager, next, jumper"
        @current-change="handlePageChange"
      />
    </div>
  </div>
  </div>
</template>

<style scoped> 
.community-home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  gap: 20px;
  align-items: flex-start; 
  background-color: var(--primary-color);
}

.sidebar-left {
  flex-shrink: 0;
  width: 400px;
  position: sticky;
  top: 20px;
  order: 1; 
}

.main-content {
  flex-grow: 1;
  min-width: 0;
  order: 2;
}

h1 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 25px;
  text-align: center;
  color: #1a1a1a;
}


.loading,
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #8a8a8a;
  font-size: 1rem;
}

.loading::before {
  content: '';
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: #409EFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 12px;
  vertical-align: middle;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 20px; 
}

.post-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  overflow: hidden; /* 保证圆角效果 */
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}


.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.user-name {
  font-weight: 600;
  color: #333;
}

.post-time {
  font-size: 0.8rem;
  color: #999;
}

/* --- 卡片主体 --- */
.post-body {
  padding: 16px 20px; 
}

.post-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #2c3e50;
}

.post-content {
  color: #555;
  line-height: 1.7;
  /* 限制内容显示行数，超出显示省略号 */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-images {
  margin-top: 16px;
  display: grid;
  /* 响应式网格布局，每行最多3张图 */
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
}

.post-image {
  width: 100%;
  height: 100px;
  border-radius: 8px;
  background-color: #f0f2f5;
  object-fit: cover; /* 保证图片不变形 */
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 24px;
  padding: 12px 20px;
  border-top: 1px solid #f0f0f0;
  background-color: #fafafa;
  color: #666;
  font-size: 0.9rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-item.interactive {
  cursor: pointer;
  transition: color 0.2s;
}

.meta-item.interactive:hover {
  color: #409EFF; 
}

.pagination-container {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

:deep(.el-card__header) {
  padding: 16px 20px;
}
:deep(.el-card__body) {
  padding: 0; 
}

</style>