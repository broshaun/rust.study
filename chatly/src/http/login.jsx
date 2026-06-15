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