import { createHttpClient } from 'utils';
import { createStorageCache, createQueryCache } from './helper';
import { userId } from 'utils/identity';
import { getUserDB } from 'utils';
import { create } from 'zustand'



async function loginFn() {
    const { http } = createHttpClient('/rpc/chat/login/');
    const res = await http.requestBodyJson('info', {});
    if (!res) throw new Error('获取失败');
    if (res.code !== 200) throw new Error(res.message);
    return res.data ?? {};
}


export const loginCache2 = createStorageCache({
    cacheKey: 'login-info2',
    queryFn: () => loginFn(),
    stored: () => getUserDB(userId.get()).cache
});



// export const useLoginCache = create((set, get) => {
//     const loginCache2 = createStorageCache({
//         cacheKey: 'login-info2',
//         queryFn: () => loginFn(),
//         stored: () => getUserDB(userId.get()).cache,
//     });
//     return {
//         loading: false,
//         ready: false,
//         error: null,
//         loginCache2: loginCache2,
//         initCache: async () => {
//             const state = get();
//             if (state.ready || state.loading) return;
//             try {
//                 set({ loading: true, error: null })
//                 await state.loginCache2.fetch();
//                 set({ ready: true })
//             } catch (err) {
//                 set({ error: err })
//                 throw err
//             } finally {
//                 set({ loading: false })
//             }
//         },
//         refreshCache: () => get().loginCache2.refresh(),
//         clearCache: () => get().loginCache2.clear(),
//         getCache: () => get().loginCache2.get(),
//     }
// })
