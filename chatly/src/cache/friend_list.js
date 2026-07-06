import { createHttpClient } from 'utils';
import { createQueryCache, createStorageCache } from './helper';
import { userId } from 'utils/identity';
import { getUserDB } from 'utils';



const get_friends = async () => {
    const { http } = createHttpClient('/rpc/chat/friend/');
    const results = await http.requestBodyJson("my_friends", {});
    console.log('results++',results)
    const { code, data, message } = results;
    if (code !== 200) {
        console.error(message)
        return []
    };
    return data || [];
}

// export const friend_list = createQueryCache({
//     scope: () => userId.get(),
//     cacheKey: 'my_friends',
//     queryFn: ()=> get_friends(),
//     staleTime: 1 * 60 * 60 * 1000,
// });


export const friend_list2 = createStorageCache({
    scope: () => userId.get(),
    cacheKey: 'my_friends',
    queryFn: ()=> get_friends(),
    stored: () => getUserDB(userId.get()).cache
});