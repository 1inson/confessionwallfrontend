import { defineStore } from 'pinia';
import { ElMessage, ElMessageBox } from 'element-plus';
import { createConfessionApi, type Confession, type ConfessionCreationData,
  getMyConfessionsApi, type PaginationParams,
  deleteConfessionApi, updateConfessionApi, type ConfessionUpdateData,
  toggleLikeApi, 
 } from '@/api/confession';

export const useConfessionStore = defineStore('confession', {
  state: () => ({
    myConfessions: [] as Confession[],
    isLoading: false,
    MAX_PHOTOS: 9 as const,
    totalItems: 0,
    totalPages: 0,
    currentPage: 0, //api上为0(??)
    isUpdating: false,
  }),
  actions: {
    async createConfession(confessionData: ConfessionCreationData) {
      if (this.isLoading) return; // 防止重复点击
      this.isLoading = true;

      try {

        const newConfession = await createConfessionApi(confessionData);

        this.myConfessions.unshift(newConfession);// 新创建的帖子插入到头部

        ElMessage.success('发布成功！');

        return true; 

      } catch (error) {

        console.error('创建帖子失败:', error);
        ElMessage.error('发布失败，请检查内容后重试。');
        return false; 

      } finally {
        this.isLoading = false;
      }
    },

    async fetchMyConfessions(params: PaginationParams){
       this.isLoading = true;
      try {
        const responseData = await getMyConfessionsApi(params);

        this.myConfessions = responseData.posts;
        this.totalItems = responseData.total;
        this.totalPages = responseData.pages;
        this.currentPage = responseData.current;

      } catch (error) {
        console.error('获取帖子列表失败:', error);
        ElMessage.error('加载帖子失败，请稍后重试。');
      } finally {
        this.isLoading = false; // 结束加载
      }
    },

    // 删除帖子
    async deleteConfession(id: number) {
      try {
        await deleteConfessionApi(id);

        this.myConfessions = this.myConfessions.filter(post => post.id !== id);

        this.totalItems--;

        ElMessage.success('删除成功！');
        return true;

      } catch (error: any) {
        console.error('删除帖子失败:', error);

        const errorMessage = error?.response?.data?.msg || '删除失败，请重试';
        ElMessage.error(errorMessage);
        return false; 
      }
    },

    // 更新帖子
    async updateConfession(id: number, data: ConfessionUpdateData) {
      this.isUpdating = true;
      try {
        const updatedPost = await updateConfessionApi(id, data);

        const index = this.myConfessions.findIndex(post => post.id === id);

        if (index !== -1) {
          this.myConfessions[index] = updatedPost;
        }

        ElMessage.success('更新成功！');
        return true;

      } catch (error: any) {
        console.error('更新帖子失败:', error);
        const errorMessage = error?.response?.data?.msg || '更新失败，请重试';
        ElMessage.error(errorMessage);
        return false;
      } finally {
        this.isUpdating = false;
      }
    },

    // 点赞
    async toggleLike(id: number) {
      const post = this.myConfessions.find(p => p.id === id);
      if (!post) return; 

      const oldLiked = post.liked;
      const oldLikes = post.likes;

      post.liked = !post.liked;
      post.likes += post.liked ? 1 : -1;

      try {
        const updatedPost = await toggleLikeApi(id);

        const index = this.myConfessions.findIndex(p => p.id === id);
        if (index !== -1) {
          this.myConfessions[index] = updatedPost;
        }
        console.log('Like status synced with server.');

      } catch (error) {
        
        console.error('Toggle like failed:', error);
        ElMessage.error('操作失败，请重试');
        
        post.liked = oldLiked;
        post.likes = oldLikes;
      }
    },

  },
});