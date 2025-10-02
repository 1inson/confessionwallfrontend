import service from './request'

// 注册接口
export interface RegisterData {
  username: string;
  password: string;
  name: string;
  usertype: number;
  avatar?: string; // avatar 是可选的
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