import { createHttpClient } from 'utils';
import { createQueryCache } from './helper';
import { userId } from 'utils/identity';



async function get_await_group() {
    const { http } = createHttpClient('/rpc/chat/group/');
    const { code, data, message } = await http.requestBodyJson('group_admin_invite_msg', {})
    if (code !== 200) throw new Error(message);
    return data;
}

export const group_invite_msg = createQueryCache({
    scope: () => userId.get(),
    cacheKey: 'group_invite_msg',
    queryFn: () => get_await_group(),
    staleTime: 12 * 60 * 60 * 1000,
});