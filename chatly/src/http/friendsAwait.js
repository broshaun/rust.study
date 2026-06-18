import { createHttpClient } from 'utils';
import { createQueryCache } from './createQueryCache';


const { http } = createHttpClient('/rpc/chat/friend/');
async function get_await_friends() {
    const res = await http.requestBodyJson("get_await_friends", {}).catch(console.error);
    if (!res) throw new Error('获取失败');
    if (res.code !== 200) throw new Error(res.message);
    return res.data ?? [];
}

export const afriends = createQueryCache({
    key: (userId) => ['get_await_friends', userId],
    queryFn: get_await_friends,
    staleTime: 12 * 60 * 60 * 1000,
});