<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useConfessionStore } from '@/stores/confessionStore';
import { storeToRefs } from 'pinia';

import { View, Pointer } from '@element-plus/icons-vue';
import { ElMessage, ElInput, ElButton, ElAvatar, ElImage, ElEmpty } from 'element-plus';

const route = useRoute();
const confessionStore = useConfessionStore();

const { currentPostDetail: post, isLoadingDetail } = storeToRefs(confessionStore);

// 评论
const newCommentText = ref('');
const isSubmitting = ref(false);
const submitComment = async () => {
  if (!newCommentText.value.trim() || !post.value) {
    ElMessage.warning('评论内容不能为空！');
    return;
  }
  isSubmitting.value = true;
  try {
    await confessionStore.addComment({
      postId: post.value.id,
      content: newCommentText.value,
    });

    newCommentText.value = '';
  } catch (error) {
    console.error('发布评论失败:', error);
    ElMessage.error('评论失败，请稍后重试');
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {

  const postId = Number(route.params.id);

  if (postId && !isNaN(postId)) {
    confessionStore.fetchConfessionDetail(postId);
  }
});
</script>

<template>
  <div class="post-detail-page">
    <div v-if="isLoadingDetail" class="loading-state">
      正在加载帖子内容...
    </div>

    <div v-else-if="post" class="post-container">
      <header class="post-header">
        <h1 class="post-title">{{ post.title }}</h1>
        <div class="author-info">
          <el-avatar :size="48" :src="post.avatar" />
          <div class="author-details">
            <span class="author-name">{{ post.name }}</span>
            <span class="post-meta">发布于 {{ post.create_at }}</span>
          </div>
        </div>
      </header>

      <main class="post-content">
        <p>{{ post.content }}</p>
        <div v-if="post.photos && post.photos.length > 0" class="post-photos">
          <el-image
            v-for="(photo, index) in post.photos"
            :key="index"
            :src="photo"
            :preview-src-list="post.photos"
            :initial-index="index"
            fit="cover"
          />
        </div>
      </main>

      <footer class="post-footer">
        <span><el-icon><View /></el-icon> {{ post.views }} 次浏览</span>
        <span><el-icon><Pointer /></el-icon> {{ post.likes }} 次点赞</span>
      </footer>
      
      <!-- 评论区  -->
      <div class="comments-section">
        <h2>评论区 ({{ post.comments.length }})</h2>
        <div class.comment-form>
        <el-input
          v-model="newCommentText"
          type="textarea"
          :rows="4"
          placeholder="发表你的看法..."
          maxlength="200"
          show-word-limit
        />
        <el-button 
          type="primary" 
          @click="submitComment" 
          :loading="isSubmitting"
          style="margin-top: 10px; float: right;"
        >
          发布评论
        </el-button>
        </div>
      </div>

      <div class.comment-list>
        <div v-if="post && post.comments.length > 0">
          <div v-for="comment in post.comments" :key="comment.id" class="comment-item">
            <div class="comment-author">{{ comment.username }}</div>
            <div class="comment-content">{{ comment.content }}</div>
            <div class="comment-meta">{{ comment.create_at }}</div>
          </div>
        </div>
        <el-empty v-else description="还没有评论，快来抢占第一个沙发！" />
      </div>
    </div>

    <div v-else class="empty-state">
      <el-empty description="无法找到该帖子，或加载失败。" />
    </div>
  </div>
</template>

<style scoped>
.post-detail-page {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  max-width: 800px; 
  margin: 20px auto; 
  padding: 20px; 
}
.post-header { 
  border-bottom: 1px solid #eee; 
  padding-bottom: 20px; 
  margin-bottom: 20px; 
}
.post-title { 
  font-size: 2.2em; 
  margin-bottom: 20px; 
}
.author-info { 
  display: flex; 
  align-items: center;
  gap: 15px; 
}
.author-details { 
  display: flex; 
  flex-direction: column; 
}
.author-details { 
  display: flex; 
  flex-direction: column; 
}
.author-name { 
  font-weight: bold; 
}
.post-meta { 
  font-size: 0.9em; 
  color: #888; 
}
.post-content p { 
  font-size: 1.1em; 
  line-height: 1.8; 
}
.post-photos { 
  margin-top: 20px; 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); 
  gap: 10px; 
}
.post-footer { 
  display: flex; 
  gap: 20px; 
  color: #888; 
  margin-top: 30px; 
  padding-top: 15px; 
  border-top: 1px solid #eee; 
}
.comments-section { 
  margin-top: 40px; 
}
.loading-state, .empty-state { 
  text-align: center; 
  padding: 50px; 
}

.comments-section { 
  margin-top: 40px; 
  padding-top: 20px;
  border-top: 1px solid #eee; 
}
.comment-form {
  margin-top: 20px;
  margin-bottom: 40px; 
}
.comment-item {
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}
.comment-author {
  font-weight: bold;
  margin-bottom: 5px;
}
.comment-content {
  color: #333;
  margin-bottom: 10px;
}
.comment-meta {
  font-size: 0.8em;
  color: #999;
}

</style>