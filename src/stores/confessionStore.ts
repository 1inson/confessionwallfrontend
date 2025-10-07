import { defineStore } from 'pinia';
import { ElMessage, ElMessageBox } from 'element-plus';
import { createConfessionApi, type Confession, type ConfessionCreationData,
  getMyConfessionsApi, type PaginationParams, getAllConfessionsApi,
  deleteConfessionApi, updateConfessionApi, type ConfessionUpdateData,
  toggleLikeApi, getHotConfessionsApi, 
  getConfessionByIdApi, type ConfessionDetail, 
  postCommentApi, type NewCommentPayload, type NewCommentResponse, type Comment, 
  type NewReplyPayload, postReplyApi, 
 } from '@/api/confession';
import { useUserStore } from '@/stores/userStore';

export const useConfessionStore = defineStore('confession', {
  state: () => ({
    myConfessions: [] as Confession[],
    isLoading: false,
    MAX_PHOTOS: 9 as const,
    totalItems: 0,
    totalPages: 0,
    currentPage: 0, 

    allConfessions: [] as Confession[], 
    allTotalItems: 0,                   
    allTotalPages: 0,                  
    allCurrentPage: 1,                 
    isUpdating: false,

    hotConfessions: [] as Confession[], // 存放热帖列表
    isLoadingHot: false,  

    currentPostDetail: null as ConfessionDetail | null, 
    isLoadingDetail: false,
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

    // 获取我的帖子列表
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

     // 获取社区所有帖子列表
    async fetchAllConfessions(params: PaginationParams) {
      this.isLoading = true;
      try {
        // 调用新增的 API 函数
        const responseData = await getAllConfessionsApi(params);

        // 将返回的数据赋值给新增的 state
        this.allConfessions = responseData.posts;
        this.allTotalItems = responseData.total;
        this.allTotalPages = responseData.pages;
        this.allCurrentPage = responseData.current;

      } catch (error) {
        console.error('获取社区帖子列表失败:', error);
        ElMessage.error('加载社区帖子失败，请稍后重试。');
      } finally {
        this.isLoading = false;
      }
    },

    // 获取热门帖子列表
    async fetchHotConfessions() {

      if (this.hotConfessions.length > 0) return;

      this.isLoadingHot = true;
      try {
        // 排行榜的前5条
        const responseData = await getHotConfessionsApi({ page: 1, size: 5 });
        this.hotConfessions = responseData.posts;
      } catch (error) {
        console.error('获取热度排行榜失败:', error);
      } finally {
        this.isLoadingHot = false;
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
    async toggleLike(post: Confession) {
      if (!post) return; 

      const oldLiked = post.liked;
      const oldLikes = post.likes;

      post.likes += post.liked ? 1 : -1;
      post.liked = !post.liked;

      try {
        await toggleLikeApi(post.id);


      } catch (error) {
        
        console.error('Toggle like failed:', error);
        ElMessage.error('操作失败，请重试');
        
        post.liked = oldLiked;
        post.likes = oldLikes;
      }
    },

    // 获取帖子详情

    async fetchConfessionDetail(id: number) {
      this.isLoadingDetail = true;
      this.currentPostDetail = null;

      try {
        const responseData = await getConfessionByIdApi(id);
        this.currentPostDetail = responseData;

        const postDetail = await getConfessionByIdApi(id);
        if (postDetail.comments && postDetail.comments.length > 0) {
        postDetail.comments = this.buildCommentTree(postDetail.comments);
      }
      
      this.currentPostDetail = postDetail;
      } catch(error){
        console.error(`获取帖子详情 (ID: ${id}) 失败:`, error);
        ElMessage.error('加载帖子失败，请稍后再试');
        this.currentPostDetail = null;
      } finally{
        this.isLoadingDetail = false;
      }
    },

    
    buildCommentTree(comments: Comment[]): Comment[] {
      const commentMap = new Map<number, Comment>();
      const rootComments: Comment[] = [];
    for (const comment of comments) {
      comment.replies = []; 
      commentMap.set(comment.id, comment);
    }

    for (const comment of comments) {
      if (comment.parent_id && commentMap.has(comment.parent_id)) {
        const parent = commentMap.get(comment.parent_id)!;
        parent.replies!.push(comment);
      } else {
        rootComments.push(comment);
      }
    }

    for (const comment of comments) {
        if (comment.replies && comment.replies.length > 1) {
            comment.replies.sort((a, b) => new Date(a.create_at).getTime() - new Date(b.create_at).getTime());
        }
    }

    return rootComments;
  },

    //评论
    async addComment(payload: { postId: number; content: string; parentId?: number; optimisticRootId?: number  }) {
      const userStore = useUserStore();
      const commentPayload: NewCommentPayload = {
        content: payload.content,
        parentId: payload.parentId || 0,
      };
      if (!this.currentPostDetail) {
        console.error('无法添加评论，因为 currentPostDetail 为 null');
        ElMessage.error('无法发表评论，请刷新页面后重试。');
        return; // 提前退出
      }

      //乐观更新
      const tempCommentId = Date.now(); 
      const optimisticComment: Comment = {
        id: tempCommentId, 
        post_id: payload.postId,
        parent_id: commentPayload.parentId || 0,
        root_id: payload.optimisticRootId || 0, 
        content: payload.content,
        username: userStore.profile?.username || '我', 
        create_at: new Date().toISOString(), 
        update_at: new Date().toISOString(),
        replies: [],
      };
      
       if (payload.parentId) {
        //递归寻找父评论并添加回复
        const findAndAddReply = (comments: Comment[]): boolean => {
          for (const comment of comments) {
            if (comment.id === payload.parentId) {
              if (!comment.replies) comment.replies = [];
              comment.replies.unshift(optimisticComment); 
              return true; 
            }
            if (comment.replies && findAndAddReply(comment.replies)) {
              return true;
            }
          }
          return false; 
        };
        findAndAddReply(this.currentPostDetail.comments);

      } else {
        this.currentPostDetail.comments.unshift(optimisticComment);
      }

      try {

        let newCommentData: NewCommentResponse;

        if (payload.parentId) {
          newCommentData = await postReplyApi(payload.parentId, { content: payload.content });
        } else {
          newCommentData = await postCommentApi(payload.postId, { content: payload.content, parentId: 0 });
        }

        const findAndReplace = (comments: Comment[]): boolean => {
          const index = comments.findIndex(c => c.id === tempCommentId);
          if (index !== -1) {
            comments[index] = { ...newCommentData, replies: comments[index]?.replies ?? [] };
            return true;
          }
          for (const comment of comments) {
            if (comment.replies && findAndReplace(comment.replies)) {
              return true;
            }
          }
          return false;
        };
        findAndReplace(this.currentPostDetail.comments);
        ElMessage.success('发布成功！');

      } catch (error) {
        console.error('发布评论/回复失败:', error);
        ElMessage.error('发布失败，请稍后重试');


        const findAndRemove = (comments: Comment[]): boolean => {
          const index = comments.findIndex(c => c.id === tempCommentId);
          if (index !== -1) {
            comments.splice(index, 1); 
            return true;
          }
          // 递归查找子评论
          for (const comment of comments) {
            if (comment.replies && findAndRemove(comment.replies)) {
              return true;
            }
          }
          return false;
        };
        findAndRemove(this.currentPostDetail.comments);
        throw error;
      }
    },


  },
});