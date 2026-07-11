import { createHttpClient } from 'utils';
import { createQueryCache, createStorageCache } from './helper';
import { userId } from 'utils/identity';
import { getUserDB } from 'utils';



const get_friends = async () => {
    const { http } = createHttpClient('/rpc/chat/friend/');
    const { code, data, message } = await http.requestBodyJson("my_friends", {});
    if (code !== 200) throw new Error(message);
    return data;
}

export const friend_list2 = createStorageCache({
    stored: () => getUserDB(userId.get()).cache,
    cacheKey: 'my_friends',
    queryFn: () => get_friends(),
});