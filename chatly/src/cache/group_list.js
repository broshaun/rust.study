import { createHttpClient } from 'utils';
import { createQueryCache, createStorageCache } from './helper';
import { userId } from 'utils/identity';
import { getUserDB } from 'utils';


const queryFn = async () => {
    const { http } = createHttpClient('/rpc/chat/group/');
    const { code, data, message } = await http.requestBodyJson("my_group_list", {});
    if (code !== 200) throw new Error(message);
    return data;
}

export const group_list2 = createStorageCache({
    stored: () => getUserDB(userId.get()).cache,
    cacheKey: 'my_group_list',
    queryFn: () => queryFn(),
    
});