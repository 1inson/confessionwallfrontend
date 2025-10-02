<template>
  <div class="auth-page">
    <div 
      class="container" 
      id="login-box" 
      :class="{ 'right-panel-active': isRightPanelActive }"
    >
      <!-- 注册 -->
      <div class="form-container sign-up-container">
        <form @submit.prevent="handleRegister">
          <h1>注册</h1>
          <input v-model="registerForm.username" type="text" placeholder="用户名" required />
          <input v-model="registerForm.name" type="text" placeholder="昵称" required />
          <input v-model="registerForm.password" type="password" placeholder="密码" required />
          <button type="submit">注册</button>
          <p v-if="errorMessage && isRightPanelActive" class="error-message-inline">{{ errorMessage }}</p>
        </form>
      </div>

      <!-- 登录 -->
      <div class="form-container sign-in-container">
        <form @submit.prevent="handleLogin">
          <h1>登录</h1>
          <input v-model="loginForm.username" type="text" placeholder="用户名" required />
          <input v-model="loginForm.password" type="password" placeholder="密码" required />
          <a href="#">忘记密码？</a>
          <button type="submit">登录</button>
          <p v-if="errorMessage && !isRightPanelActive" class="error-message-inline">{{ errorMessage }}</p>
        </form>
      </div>

      <!-- 覆盖层容器 -->
      <div class="overlay-container">
        <div class="overlay">
          <!-- 在注册界面时显示 -->
          <div class="overlay-panel overlay-left">
            <h1>已有账号？</h1>
            <p>请使用您的账号进行登录</p>
            <button class="ghost" id="signIn" @click="isRightPanelActive = false">登录</button>
          </div>
          <!-- 在登录界面时显示 -->
          <div class="overlay-panel overlay-right">
            <h1>没有账号?</h1>
            <p>立即注册加入我们，和我们一起开始旅程吧</p>
            <button class="ghost" id="signUp" @click="isRightPanelActive = true">注册</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';
import axios from 'axios';

const isRightPanelActive = ref(false);
const userStore = useUserStore();
const router = useRouter();

// 注册
const registerForm = ref({
  username: '',
  password: '',
  name: '',
  usertype: 1, 
});

const errorMessage = ref('');

const handleRegister = async () => {
  // 清空之前的错误信息
  errorMessage.value = '';

  const result = await userStore.register(registerForm.value);

  if (result === true) {
    alert('注册成功！');
    // 跳转到个人中心页
    router.push({ name: 'profile' }); 
  } else {
    if (axios.isAxiosError(result)) {
      if (result.response) {
        // 请求成功到达后端，是后端返回的业务逻辑错误
        const errorCode = result.response.data.code;
        const errorMsg = result.response.data.msg || '未知后端错误'; // 获取更详细的错误信息

        switch (errorCode) {
            case 2003:
                errorMessage.value = `参数错误: ${errorMsg}`;
                break;
            case 2309:
                errorMessage.value = `用户类型错误: ${errorMsg}`;
                break;
            case 2310:
                errorMessage.value = `该用户名已被注册: ${errorMsg}`;
                break;
            default:
                errorMessage.value = `注册失败: ${errorMsg}`;
        }
      } else {
        errorMessage.value = '网络连接错误或服务器无响应。';
      }
    } 
    else if (result instanceof Error) {
        errorMessage.value = result.message;
    } 
    else {
        errorMessage.value = '发生了一个未知错误，请联系管理员。';
    }
  }
};

// 登录
const loginForm = ref({
  username: '',
  password: ''
});

const handleLogin = async () => {
  errorMessage.value = '';
  const result = await userStore.login(loginForm.value);

  if (result === true) {
    alert('登录成功！');
    // 登录成功后，通常跳转到个人中心或首页
    router.push({ name: 'profile' }); 
  } else {
    if (axios.isAxiosError(result)) {
      if (result.response) {
        const errorCode = result.response.data.code;
        const errorMsg = result.response.data.msg || '未知错误';

        switch (errorCode) {
            case 2003: // INVALID_PARAMETERS
                errorMessage.value = `参数错误: ${errorMsg}`;
                break;
            case 2401: // LOGIN_ERROR
                errorMessage.value = `账号或密码错误: ${errorMsg}`;
                break;
            default:
                errorMessage.value = `登录失败: ${errorMsg}`;
        }
      } else {
        errorMessage.value = '网络连接错误。';
      }
    } else if (result instanceof Error) {
        errorMessage.value = result.message;
    } else {
        errorMessage.value = '发生未知错误。';
    }
  }
};
</script>

<style scoped>

.auth-page {
  font-family: 'Montserrat',sans-serif;
  background-image: linear-gradient(120deg,#3498db,#8e44ad); /* 主题色 */
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
}

.error-message-inline {
    color: #e74c3c;
    font-weight: bold;
    margin-top: 15px;
}

* {
    box-sizing: border-box;
}
h1 {
    font-weight: bold;
    margin: 0;
}
p {
    font-size: 14px;
    line-height: 20px;
    letter-spacing: .5px;
    margin: 20px 0 30px;
}
a {
    color: #333;
    font-size: 14px;
    text-decoration: none;
    margin: 15px 0;
}
.container {
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 14px 28px rgba(0, 0, 0, .25), 0 10px 10px rgba(0, 0, 0, .22);
    position: relative;
    overflow: hidden;
    width: 768px;
    max-width: 100%;
    min-height: 480px;   
}
.form-container {
    position: absolute;
    top: 0;
    height: 100%;
    transition: all .6s ease-in-out;
}
.form-container form {
    background: #fff;
    display: flex;
    flex-direction: column;
    padding: 0 50px;
    height: 100%;
    justify-content: center;
    align-items: center;
    text-align: center;
}

.form-container input {
	background-color: #eee;
	border: none;
	padding: 12px 15px;
	margin: 8px 0;
	width: 100%;
}
button {
    border-radius: 20px;
    border: 1px solid #ff4b2b;
    background: #ff4b2b;
    color: #fff;
    font-size: 12px;
    font-weight: bold;
    padding: 12px 45px;
    letter-spacing: 1px;
    text-transform: uppercase;
    transition: transform 80ms ease-in;
    cursor: pointer;
}
button:active {
    transform: scale(.95);
}
button:focus {
    outline: none;
}
button.ghost {
    background: transparent;
    border-color: #fff;
}
.form-container button {
    background: linear-gradient(120deg, #3498db, #8e44ad); /* 主题色 */
    border: none;
    background-size: 200%;
    color: #fff;
    transition: .5s;
}
.form-container button:hover {
    background-position: right;
}
.sign-in-container {
    left: 0;
    width: 50%;
    z-index: 2;
}
.sign-up-container {
    left: 0;
    width: 50%;
    opacity: 0;
    z-index: 1;
}
.overlay-container {
    position:absolute;
    top: 0;
    left: 50%;
    width: 50%;
    height: 100%;
    overflow: hidden;
    transition: transform .6s ease-in-out;
    z-index: 100;
}
.overlay {
    background-image: linear-gradient(120deg,#3498db,#8e44ad); /* 主题色 */
    color: #fff;
    position: relative;
    left: -100%;
    height: 100%;
    width: 200%;
    transform: translateX(0);
    transition: transform .6s ease-in-out;
}
.overlay-panel {
    position: absolute;
    top: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0 40px;
    height: 100%;
    width: 50%;
    text-align: center;
    transform: translateX(0);
    transition: transform .6s ease-in-out;
}
.overlay-right {
    right: 0;
    transform: translateX(0);
}
.overlay-left {
    transform: translateX(-20%);
}

/* ---- Vue 控制的动画效果 ---- */
.container.right-panel-active .sign-in-container {
    transform: translateX(100%);
}
.container.right-panel-active .overlay-container {
    transform: translateX(-100%);
}
.container.right-panel-active .sign-up-container {
    transform: translateX(100%);
    opacity: 1;
    z-index: 5;
    animation: show .6s;
}
@keyframes show {
	0%, 49.99% {
		opacity: 0;
		z-index: 1;
	}
	
	50%, 100% {
		opacity: 1;
		z-index: 5;
	}
}
.container.right-panel-active .overlay {
    transform: translateX(50%);
}
.container.right-panel-active .overlay-left {
    transform: translateX(0);
}
.container.right-panel-active .overlay-right {
    transform: translateX(20%);
}
</style>