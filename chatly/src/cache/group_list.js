import { createHttpClient } from 'utils';
import { createQueryCache } from './helper';
import { userId } from 'utils/identity';


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