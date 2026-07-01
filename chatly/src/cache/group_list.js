import { createHttpClient } from 'utils';
import { createQueryCache } from './helper/createQueryCache2';
import { sessionId } from 'utils/identity';


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
    cacheKey: () => [sessionId.get(), 'my_group_list'],
    queryFn: queryFn,
    staleTime: 12 * 60 * 60 * 1000,
});