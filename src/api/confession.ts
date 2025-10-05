import service from './request'; 

//创建帖子
export interface ConfessionCreationData {
  send_time: string; //预定时间
  title: string;
  content: string;
  photos: string[]; // 图片 URL 数组
  open: boolean;
  anonymous: boolean;
}
export function createConfessionApi(data: ConfessionCreationData): Promise<Confession> {
  return service.post('/confessions', data);
}

export interface Confession {
  poster_name: string;
  create_at: string;
  update_at: string;
  id: number;
  title: string;
  content: string;
  photos: string[];
  views: number;
  likes: number;
  name: string; 
  avatar: string;
  liked: boolean;
  open: boolean;
  anonymous: boolean;
}

//获取我的帖子列表
export interface PaginationParams {
  page: number; 
  size: number; 
}
export interface PaginatedConfessionsResponse {
  posts: Confession[];
  total: number;
  pages: number;
  current: number;
}
interface ApiResponse<T> {
  msg: string;
  code: number;
  data: T;
}

export function getMyConfessionsApi(params: PaginationParams): Promise<ApiResponse<PaginatedConfessionsResponse>> {
  return service.post('/confessions/my',  params );
}

//删除帖子
export function deleteConfessionApi(id: number): Promise<void> {
  return service.delete(`/confessions/${id}`);
}

//更新自己的帖子
export interface ConfessionUpdateData {
  title: string;
  content: string;
  photos: string[];
  open: boolean;
}
export function updateConfessionApi(id: number, data: ConfessionUpdateData): Promise<Confession> {
  return service.put(`/confessions/${id}`, data);
}

//点赞
export function toggleLikeApi(id: number): Promise<Confession> {
  return service.post(`/confessions/${id}/like`);
}