import { createHttpClient } from 'utils';
import { createQueryCache } from './createQueryCache';


async function loginFn() {
    const { http } = createHttpClient('/rpc/chat/login/');
    const res = await http.requestBodyJson('info', {});
    if (!res) throw new Error('获取失败');
    if (res.code !== 200) throw new Error(res.message);
    return res.data ?? {};
}


export const loginCache = createQueryCache({
    key: (userId) => ['login-info', userId],
    queryFn: loginFn,
    staleTime: 12 * 60 * 60 * 1000,
});