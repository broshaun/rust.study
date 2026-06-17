import { useHttpClient } from 'utils';
import { useLocalStorage } from "@mantine/hooks";
import { useQuery } from '@tanstack/react-query';


export const useLoginUserInfo = () => {
    const { http: apiLogin } = useHttpClient('/rpc/chat/login/');
    const [userId] = useLocalStorage({ key: 'current_account' })
    const { data, isPending, error, refetch } = useQuery(
        {
            queryKey: ['login-info', userId],
            queryFn: async () => {
                const res = await apiLogin.requestBodyJson('info', {});
                if (!res) {
                    throw new Error(res?.message || '获取失败');
                }
                if (res.code === 200) {
                    return res.data;
                } else {
                    return {}
                }
            },
            enabled: !!userId,
            staleTime: 12 * 60 * 60 * 1000,
            refetchOnWindowFocus: false,
        });

    return { data, isPending, error, refetch };
};


// 1. fetchQuery

// 请求数据并写入缓存。
// 2. prefetchQuery

// 预加载缓存，不返回数据。
// 3. getQueryData

// 读取缓存。

// 6. invalidateQueries

// 标记缓存过期。


// 首先封装函数 
// async () => {
//                 const res = await apiLogin.requestBodyJson('info', {});
//                 if (!res) {
//                     throw new Error(res?.message || '获取失败');
//                 }
//                 if (res.code === 200) {
//                     return res.data;
//                 } else {
//                     return {}
//                 }
//             },
//             然后使用可以对外使用fetchQuery加载函数并缓存
// 对外 getQueryData
// 对外 invalidateQueries
// 对外在监听缓存