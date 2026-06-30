import { createHttpClient } from 'utils';
import { createQueryCache } from './helper/createQueryCache';
import { sessionId } from 'utils/identity';



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
    cacheKey: () => [sessionId.get(),'my_friends'],
    queryFn: get_friends,
    staleTime: 1 * 60 * 60 * 1000,
});