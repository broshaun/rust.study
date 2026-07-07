import { createHttpClient } from 'utils';
import { createQueryCache, createStorageCache } from './helper';
import { userId } from 'utils/identity';
import { getUserDB } from 'utils';


const queryFn = async () => {
    const { http } = createHttpClient('/rpc/chat/group/');
    const results = await http.requestBodyJson("my_group_list", {});
    if (!results) throw new Error("获取失败");
    const { code, data, message } = results;
    if (code !== 200) {
        return []
    }
    return data || [];
}

export const group_list = createQueryCache({
    scope: () => userId.get(),
    cacheKey: 'my_group_list',
    queryFn: () => queryFn(),
    staleTime: 12 * 60 * 60 * 1000,
});


export const group_list2 = createStorageCache({
    stored: () => getUserDB(userId.get()).cache,
    cacheKey: 'my_group_list',
    queryFn: () => queryFn(),
    
});