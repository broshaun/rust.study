import { createHttpClient } from 'utils';
import { createQueryCache } from './helper/createQueryCache';
import { sessionId } from 'utils/identity';

const { http } = createHttpClient('/rpc/chat/msg/group/');
const queryFn = async () => {
    const results = await http.requestBodyJson("my_group_list", {});


    if (!results) throw new Error("获取失败");
    const { code, data, message } = results;
    if (code !== 200) {
        return []
    }
    return data || [];
}

export const my_groups = createQueryCache({
    sessionId: () => sessionId.get(),
    cacheKey: 'my_group_list',
    queryFn: queryFn,
    staleTime: 12 * 60 * 60 * 1000,
});