import { createHttpClient } from 'utils';
import { createQueryCache } from './helper';
import { userId } from 'utils/identity';


async function get_await_friends() {
    const { http } = createHttpClient('/rpc/chat/friend/');
    const { code, data, message } = await http.requestBodyJson("get_await_friends", {});
    if (code !== 200) throw new Error(message);
    return data;
}

export const friend_await_message = createQueryCache({
    scope: () => userId.get(),
    cacheKey: 'get_await_friends',
    queryFn: () => get_await_friends(),
    staleTime: 12 * 60 * 60 * 1000,
});