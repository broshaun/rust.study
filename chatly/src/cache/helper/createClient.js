import { QueryClient } from '@tanstack/query-core';

// 全局唯一的 QueryClient 实例，两个文件共用
export const queryClient = new QueryClient();