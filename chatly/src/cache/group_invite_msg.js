import { createHttpClient } from 'utils';
import { createQueryCache } from './helper/createQueryCache';
import { userId } from 'utils/identity';



async function get_await_group() {
    const { http } = createHttpClient('/rpc/chat/group/');
    const results = await http.requestBodyJson('group_admin_invite_msg', {})
    if (results.code !== 200) throw new Error(results.message);
    return results.data;
}

export const group_invite_msg = createQueryCache({
    scope: () => userId.get(),
    cacheKey: 'group_invite_msg',
    queryFn: () => get_await_group(),
    staleTime: 12 * 60 * 60 * 1000,
});