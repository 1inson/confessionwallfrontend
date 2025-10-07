<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useConfessionStore } from '@/stores/confessionStore';
import { storeToRefs } from 'pinia';

import type { Comment } from '@/api/confession'; 

import { View, Pointer } from '@element-plus/icons-vue';
import { ElMessage, ElInput, ElButton, ElAvatar, ElImage, ElEmpty } from 'element-plus';

const route = useRoute();
const confessionStore = useConfessionStore();

const { currentPostDetail: post, isLoadingDetail } = storeToRefs(confessionStore);

// 评论
const newCommentText = ref('');
const isSubmitting = ref(false);
// 回复弹窗
const replyDialogVisible = ref(false);
const replyingToComment = ref<Comment | null>(null);
const replyText = ref('');

const rootComments = computed(() => {
  return post.value?.comments?.filter(c => !c.parent_id) || [];
});

const replyDialogTitle = computed(() => {
  return replyingToComment.value ? `回复 @${replyingToComment.value.username}` : '发布回复';
});

// 提交新的根评论 (用于主输入框)
const submitNewComment = async () => {
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
    ElMessage.error('发布失败，请稍后重试');
  } finally {
    isSubmitting.value = false;
  }
};

// 回复弹窗
const openReplyDialog = (comment: Comment) => {
  replyingToComment.value = comment;
  replyDialogVisible.value = true;
};

// 提交回复 (用于弹窗)
const submitReply = async () => {
  if (!replyingToComment.value || !replyText.value.trim() || !post.value) {
    ElMessage.warning('回复内容不能为空！');
    return;
  }
  isSubmitting.value = true;
  const targetComment = replyingToComment.value;
  
  // 关键：计算用于乐观更新的 rootId
  const optimisticRootId = targetComment.root_id === 0 ? targetComment.id : targetComment.root_id;

  try {
    await confessionStore.addComment({
      postId: post.value.id,
      content: replyText.value,
      parentId: targetComment.id,
      optimisticRootId: optimisticRootId,
    });
    replyDialogVisible.value = false; 
  } catch (error) {
    console.error('发布评论失败:', error);
    ElMessage.error('发布失败，请稍后重试');
  } finally {
    isSubmitting.value = false;
  }
};

const resetReplyState = () => {
  replyingToComment.value = null;
  replyText.value = '';
};

// --- 生命周期钩子 ---
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
        <div class="comment-form">
          <el-input
            v-model="newCommentText"
            type="textarea"
            :rows="3"
            placeholder="发表你的看法..."
            maxlength="200"
            show-word-limit
          />
          <el-button 
            type="primary" 
            @click="submitNewComment" 
            :loading="isSubmitting"
            style="margin-top: 10px; float: right;"
          >
            发布评论
          </el-button>
        </div>
      </div>

      <div class="comment-list">
        <div v-if="rootComments.length > 0">
          <div v-for="comment in rootComments" :key="comment.id" class="comment-item">
            <div class="comment-main">
              <span class="comment-author">{{ comment.username }}</span>
              <p class="comment-content">{{ comment.content }}</p>
              <div class="comment-footer">
                <span class="comment-meta">{{ comment.create_at }}</span>
                <button class="reply-btn" @click="openReplyDialog(comment)">回复</button>
              </div>
            </div>

            <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
              <div v-for="reply in comment.replies" :key="reply.id" class="comment-item reply-item">
                 <div class="comment-main">
                    <span class="comment-author">{{ reply.username }}</span>
                    <p class="comment-content">{{ reply.content }}</p>
                    <div class="comment-footer">
                       <span class="comment-meta">{{ reply.create_at }}</span>
                       <button class="reply-btn" @click="openReplyDialog(reply)">回复</button>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
        <el-empty v-else description="还没有评论，快来抢占第一个沙发！" />
      </div>
    </div>

    <div v-else class="empty-state">
      <el-empty description="无法找到该帖子，或加载失败。" />
    </div>

    <!-- 回复弹窗 -->
    <el-dialog
      v-model="replyDialogVisible"
      :title="replyDialogTitle"
      width="500px"
      @close="resetReplyState"
    >
      <textarea
        v-model="replyText"
        class="reply-textarea"
        rows="4"
        placeholder="写下你的回复..."
      ></textarea>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="replyDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitReply" :loading="isSubmitting">
            发布回复
          </el-button>
        </span>
      </template>
    </el-dialog>
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
.post-content p{
  font-size:var(--base-font-size);
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
  font-size:var(--base-font-size);
}
.comment-meta {
  font-size: 0.8em;
  color: #999;
}
.reply-btn {
  background: none;
  border: none;
  color: #8a919f;
  cursor: pointer;
  font-size: 0.9em;
}
.replies-list {
  margin-left: 30px;
  padding-left: 20px;
  border-left: 2px solid #f0f2f5;
}
.reply-item {
  padding-top: 15px;
  border-bottom: none;
}
.reply-textarea {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  font-size: 14px;
  box-sizing: border-box;
}
</style>