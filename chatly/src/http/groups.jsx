import { createHttpClient } from 'utils';
import { createQueryCache } from './createQueryCache';


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

export const agroups = createQueryCache({
    key: (userId) => ['my_group_list', userId],
    queryFn: queryFn,
    staleTime: 12 * 60 * 60 * 1000,
});