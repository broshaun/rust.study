import { createHttpClient } from 'utils';
import { createStorageCache, createQueryCache } from './helper';
import { userId } from 'utils/identity';
import { getUserDB } from 'utils';


async function loginFn() {
    console.log('执行成功')
    const db = getUserDB(userId.get())


    const { http } = createHttpClient('/rpc/chat/login/');
    const res = await http.requestBodyJson('info', {});
    if (!res) throw new Error('获取失败');
    if (res.code !== 200) throw new Error(res.message);
    return res.data ?? {};
}

// export const loginCache = createQueryCache({
//     scope: () => userId.get(),
//     cacheKey: 'login-info',
//     queryFn: () => loginFn(),
//     staleTime: Infinity,

// });

export const loginCache2 = createStorageCache({
    scope: () => userId.get(),
    cacheKey: 'login-info2',
    queryFn: () => loginFn(),
    stored: () => getUserDB(userId.get()).cache
});

