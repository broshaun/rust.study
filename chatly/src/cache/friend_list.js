import { createHttpClient } from 'utils';
import { createQueryCache } from './helper/createQueryCache2';
import { userId } from 'utils/identity';



const get_friends = async () => {
    const { http } = createHttpClient('/rpc/chat/friend/');
    const results = await http.requestBodyJson("my_friends", {});
    const { code, data, message } = results;
    if (code !== 200) {
        console.error(message)
        return []
    };
    return data || [];
}

export const friend_list = createQueryCache({
    scope: () => userId.get(),
    cacheKey: 'my_friends',
    queryFn: ()=> get_friends(),
    staleTime: 1 * 60 * 60 * 1000,
});