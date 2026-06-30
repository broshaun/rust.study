import { createHttpClient } from 'utils';
import { createQueryCache } from './helper/createQueryCache';
import { sessionId } from 'utils/identity';


async function loginFn() {
    const { http } = createHttpClient('/rpc/chat/login/');
    const res = await http.requestBodyJson('info', {});
    if (!res) throw new Error('获取失败');
    if (res.code !== 200) throw new Error(res.message);
    return res.data ?? {};
}

export const loginCache = createQueryCache({
    sessionId: ()=>sessionId.get(),
    cacheKey: 'login-info',
    queryFn: loginFn,
    staleTime: 12 * 60 * 60 * 1000,
});