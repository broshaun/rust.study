import { createHttpClient } from 'utils';
import { createQueryCache } from './helper/createQueryCache';
import { sessionId } from 'utils/identity';


const { http } = createHttpClient('/rpc/chat/friend/');
const get_friends = async () => {
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
    sessionId: ()=>sessionId.get(),
    cacheKey: 'my_friends',
    queryFn: get_friends,
    staleTime: 12 * 60 * 60 * 1000,
});