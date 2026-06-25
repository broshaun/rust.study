import { createHttpClient } from 'utils';
import { createQueryCache } from './helper/createQueryCache';
import { Session } from 'utils/identity';

const { http } = createHttpClient('/rpc/chat/msg/group/');
const queryFn = async () => {
    const results = await http.requestBodyJson("my_group_list", {});

    console.log('results12313213213',results)
    if (!results) throw new Error("获取失败");
    const { code, data, message } = results;
    if (code !== 200) {
        return []
    }
    return data || [];
}

export const my_groups = createQueryCache({
    sessionId: Session.get(),
    cacheKey: 'my_group_list',
    queryFn: queryFn,
    staleTime: 0,
});