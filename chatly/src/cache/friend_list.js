import { createHttpClient } from 'utils';
import { createQueryCache, createStorageCache } from './helper';
import { userId } from 'utils/identity';
import { getUserDB } from 'utils';



const get_friends = async () => {
    const { http } = createHttpClient('/rpc/chat/friend/');
    const results = await http.requestBodyJson("my_friends", {});
    // console.log('my_friends results++', results)
    const { code, data, message } = results;
    if (code !== 200) {
        console.error(message)
        return []
    };
    return data || [];
}

export const friend_list2 = createStorageCache({
    stored: () => getUserDB(userId.get()).cache,
    cacheKey: 'my_friends',
    queryFn: () => get_friends(),
});