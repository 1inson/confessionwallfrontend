import service from './request'

//token 刷新接口
export interface RefreshAuthTokens {
  'access-token': string;
  'refresh-token': string;
}
export function refreshTokenApi(refreshToken: string): Promise<RefreshAuthTokens> {
  return service.post('/users/refresh-token', {
    'refresh-token': refreshToken,
  });
}

// 注册接口
export interface RegisterData {
  username: string;
  password: string;
  name: string;
  usertype: number;
  avatar: string; // avatar 是必须的
}

export interface AuthTokens {
  'access-token': string;
  'refresh-token': string;
}

export function registerApi(data: RegisterData): Promise<AuthTokens>  {
  return service.post('/users/register', data)
}

// 登录接口
export interface LoginData {
  username: string;
  password: string;
}

export function loginApi(data: LoginData): Promise<AuthTokens> {
  return service.post('/users/login', data);
}

//查看用户信息
export interface UserProfile {
  user_id: string;
  username: string;
  name: string;
  usertype: number;
  avatar: string;
}

export function getProfileApi(): Promise<UserProfile> {
  return service.get('/users/me');
}

//修改用户信息
export function updateProfileApi(data: UpdateProfileData): Promise<UserProfile> {
  return service.put('/users/me', data); 
}

export interface UpdateProfileData {
  username: string;
  name: string;
  avatar: string;
}
//头像上传成功后返回的接口 
export interface ImageUploadResponse {
  file_url: string;
}
export function uploadImageApi(formData: FormData): Promise<ImageUploadResponse> {
  return service.post('/image/upload', formData);
}