import { createHttpClient } from 'utils';
import { createQueryCache } from './helper/createQueryCache';
import { userId } from 'utils/identity';


async function get_await_friends() {
    const { http } = createHttpClient('/rpc/chat/friend/');
    const res = await http.requestBodyJson("get_await_friends", {}).catch(console.error);
    if (!res) throw new Error('获取失败');
    if (res.code !== 200) throw new Error(res.message);
    return res.data ?? [];
}

export const friend_await_message = createQueryCache({
    scope: () => userId.get(),
    cacheKey: 'get_await_friends',
    queryFn: () => get_await_friends(),
    staleTime: 12 * 60 * 60 * 1000,
});