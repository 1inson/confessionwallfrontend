<script setup lang="ts">
import { reactive, ref, watch, onMounted } from 'vue';
import { useConfessionStore } from '@/stores/confessionStore';
import { useUserStore } from '@/stores/userStore'; 
import type { ConfessionCreationData, Confession, ConfessionUpdateData } from '@/api/confession';

import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules, UploadProps, UploadUserFile } from 'element-plus';
import { Plus } from '@element-plus/icons-vue'; 

const confessionStore = useConfessionStore();
const userStore = useUserStore(); 

const loadPosts = () => {
  // 只有在确认登录后才加载数据
  if (userStore.isLoggedIn) {
    confessionStore.fetchMyConfessions;
  }
};
watch(() => userStore.isLoggedIn, (isLoggedIn) => {
  if (isLoggedIn) {
    loadPosts();
  }
}, { immediate: true });


const formRef = ref<FormInstance>();
const form = reactive<ConfessionCreationData>({
  title: '',
  content: '',
  photos: [],
  open: true,
  anonymous: false,
  send_time: ' ',

});

//检验
const validatePhotos = (rule: any, value: string[], callback: any) => {
  if (value.length > confessionStore.MAX_PHOTOS) {
    callback(new Error(`最多只能上传 ${confessionStore.MAX_PHOTOS} 张图片`));
  } else {
    callback();
  }
};

const rules = reactive<FormRules>({
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 1, max: 50, message: '标题长度应在 1 到 50 个字符之间', trigger: 'blur' },
  ],
  content: [
    { required: true, message: '请输入表白内容', trigger: 'blur' },
    { min: 1, max: 200, message: '内容长度应在 1 到 200 个字符之间', trigger: 'blur' },
  ],
  send_time: [
    { required: true, message: '请选择发布时间', trigger: 'change' },
  ],
  photos: [
    { validator: validatePhotos, trigger: 'change' },
  ],
});

const handleBeforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (form.photos.length >= confessionStore.MAX_PHOTOS) {
    ElMessage.error(`你已经上传了 ${confessionStore.MAX_PHOTOS} 张图片，无法继续添加！`);
    return false;
  }
  return true;
};

const handleHttpRequest: UploadProps['httpRequest'] = async (options) => {
  try {
    const imageUrl = await userStore.uploadImage(options.file);
    form.photos.push(imageUrl);

    options.onSuccess(imageUrl);
    ElMessage.success('图片上传成功！');
  } catch (error) {
    options.onError(error as any);
    ElMessage.error('图片上传失败，请重试。');
  }
};

//删除图片
const handleRemove: UploadProps['onRemove'] = (removedFile, currentFileList) => {
  form.photos = currentFileList
    .map(file => file.response as string) 
    .filter(url => !!url); 
};


const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate((valid) => {
    if (valid) {

      confessionStore.createConfession(form as ConfessionCreationData).then(success => {
        if (success) {
          formRef.value?.resetFields();
          form.photos = [];
          form.send_time = ' ';
        }
      });
    } else {
      ElMessage.error('表单校验失败，请检查你的输入。');
    }
  });
};


//页数变化
const handlePageChange = (newPage: number) => {

  confessionStore.fetchMyConfessions({ page: newPage , size: 10 });
};

//删除帖子
const handleDelete = async (id: number) => {
  try {

    await ElMessageBox.confirm(
      '你确定要删除这篇表白吗？这个操作无法撤销。',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    await confessionStore.deleteConfession(id);

  } catch (action) {
    if (action === 'cancel') {
      ElMessage.info('已取消删除');
    }
  }
};

//编辑帖子
const isDialogVisible = ref(false); // 控制编辑对话框的显示
const editingPost = ref<ConfessionUpdateData | null>(null);
const editingPostId = ref<number | null>(null);
const editFileList = ref<UploadUserFile[]>([]);

const handleEdit = (post: Confession) => {
  console.log('Editing post:', post); 

  editingPostId.value = post.id;
  editingPost.value = {
    title: post.title,
    content: post.content,
    photos: [...post.photos],
    open: post.open,
  };
    // 编辑时，图片列表需要将原来的图片列表复制过来
    editFileList.value = post.photos.map((url, index) => ({
    name: `photo_${index + 1}.jpg`, 
    url: url, 
    uid: Date.now() + index, 
    status: 'success', 
    response: url, 
  }));

  isDialogVisible.value = true;
};



//修改更新提交
const handleUpdateSubmit = async () => {
  if (!editingPost.value || !editingPostId.value) return;

    //从文件对象数组中提取出 URL 字符串数组
  const finalPhotoUrls = editFileList.value.map(file => file.response as string);

  const submissionData: ConfessionUpdateData = {
    ...editingPost.value,
    photos: finalPhotoUrls,
  };
  
  const success = await confessionStore.updateConfession(editingPostId.value, submissionData);

  if (success) {
    isDialogVisible.value = false;
  }
};
</script>


<template>
  <div class="my-posts-page">
    <h2>发布新的表白</h2>
    <el-card class="creation-card">
      <el-form :model="form" ref="formRef" :rules="rules" label-position="top">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="给你的表白起个标题吧" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows=5
            placeholder="在这里写下你的心里话..."
            />
        </el-form-item>
          <!--发布时间选择器 -->
        <el-form-item label="发布时间" prop="send_time">
            <el-date-picker
              v-model="form.send_time"
              type="datetime"
              placeholder="选择一个时间发布"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%;"
        />
  </el-form-item>


        <!-- 图片上传 -->
        <el-form-item 
      :label="`图片 (可选, ${form.photos.length}/${confessionStore.MAX_PHOTOS})`" 
      prop="photos"
    >
      <el-upload
        action="#"
        list-type="picture-card"
        :multiple="true"
        :http-request="handleHttpRequest"
        :before-upload="handleBeforeUpload"
        :on-remove="handleRemove"
      >
      <el-icon v-if="form.photos.length < confessionStore.MAX_PHOTOS">
          <Plus />
      </el-icon>
        </el-upload>
      </el-form-item>

        <el-form-item label="选项">
          <el-checkbox v-model="form.open" label="公开可见" />
          <el-checkbox v-model="form.anonymous" label="匿名发布" />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            @click="handleSubmit"
            :loading="confessionStore.isLoading"
          >
            {{ confessionStore.isLoading ? '发布中...' : '立即发布' }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-divider />

    <h2>我发布的帖子</h2>
        <div v-if="confessionStore.isLoading" class="loading-state">
      <p>正在加载帖子...</p>
    </div>

    <div v-else-if="confessionStore.myConfessions.length > 0" class="posts-list">
      <el-card v-for="post in confessionStore.myConfessions" :key="post.id" class="post-card">
        <template #header>
          <div class="card-header">
            <span>{{ post.title }}</span>

            <!--删除按钮-->
            <el-button 
              class="button" 
              type="danger" 
              plain 
              size="small"
              @click="handleDelete(post.id)"
            >
              删除
            </el-button>
            <!--编辑按钮-->
            <el-button 
                class="button" 
                type="primary" 
                plain size="small"
                @click="handleEdit(post)"
              >
                编辑
              </el-button>

          </div>
        </template>
        <p class="post-content">{{ post.content }}</p>
      </el-card>
    </div>

    <div v-else class="empty-state">
      <p>你还没有发布任何帖子，快去上面发布第一条吧！</p>
    </div>


    <!-- 编辑对话框 -->
    <el-dialog v-model="isDialogVisible" title="编辑表白" width="50%">
      <el-form v-if="editingPost" :model="editingPost" label-position="top">
        <el-form-item label="标题">
          <el-input v-model="editingPost.title" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="editingPost.content" type="textarea" :rows="5" />
        </el-form-item>

        <!-- 图片上传 -->
        <el-form-item :label="`图片 (${editFileList.length}/${confessionStore.MAX_PHOTOS})`">
          <el-upload
             v-model:file-list="editFileList"
             action="#"
             list-type="picture-card"
             :multiple="true"
             :http-request="handleHttpRequest"
             :before-upload="handleBeforeUpload"
              >
        <el-icon v-if="editFileList.length < confessionStore.MAX_PHOTOS"><Plus /></el-icon>
         </el-upload>
       </el-form-item>

        <el-form-item label="选项">
          <el-checkbox v-model="editingPost.open" label="公开可见" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="isDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleUpdateSubmit"
            :loading="confessionStore.isUpdating"
          >
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>

 

    <div class="pagination-container" v-if="confessionStore.totalItems > 0">
      <el-pagination
        background
        layout="total, prev, pager, next"
        :total="confessionStore.totalItems"
        :page-size="10"
        :current-page="confessionStore.currentPage + 1"
        @current-change="handlePageChange"
      />
    </div>

  </div>
</template>

<style scoped>
.my-posts-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto; 

}

.my-posts-page h2 {
  margin-bottom: 20px;
}

.creation-card{
  background-color: var(--primary-color);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-card {
  margin-bottom: 20px;
}

.post-content {
  white-space: pre-wrap; /* 保留换行和空格 */
  word-break: break-word; /* 防止长单词溢出 */
}
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}
.loading-state, .empty-state {
  text-align: center;
  padding: 40px;
  color: #909399;
}
</style>