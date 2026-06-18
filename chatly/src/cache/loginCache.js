import { createHttpClient } from 'utils';
import { createQueryCache } from './helper/createQueryCache';


const { http } = createHttpClient('/rpc/chat/login/');
async function loginFn() {
    const res = await http.requestBodyJson('info', {});
    if (!res) throw new Error('获取失败');
    if (res.code !== 200) throw new Error(res.message);
    return res.data ?? {};
}


export const loginCache = createQueryCache({
    key: (userId) => ['login-info', userId],
    queryFn: loginFn,
    staleTime: 12 * 60 * 60 * 1000,
    storage: true,
});