import { createHttpClient } from 'utils';
import { createQueryCache } from './createQueryCache';


const get_friends = async () => {
    const { http } = createHttpClient('/rpc/chat/friend/');
    const results = await http.requestBodyJson("my_friends", {});
    if (!results) throw new Error("获取失败");
    const { code, data, message } = results;
    if (code !== 200) {
        console.error(message)
        return []
    };
    return data || [];
}

export const afriends = createQueryCache({
    key: (userId) => ['my_friends', userId],
    queryFn: get_friends,
    staleTime: 12 * 60 * 60 * 1000,
});