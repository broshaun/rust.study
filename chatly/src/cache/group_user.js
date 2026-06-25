import { createHttpClient, currentChat } from 'utils';
import { createQueryCache } from './helper/createQueryCache';
import { Session } from 'utils/identity';

const { http } = createHttpClient('/rpc/chat/msg/group/');
const queryFn = async () => {
    const { id: groupId } = currentChat.getState().get("group")
    console.log('groupId',groupId)
    const results = await http.requestBodyJson("group_user_list", { "group_id": groupId });
    console.log('group_user_list results++', results)
    if (!results) throw new Error("获取失败");
    const { code, data, message } = results;
    if (code !== 200) throw new Error(message);

    return data.map((item) => ({
        id: item.id,
        user_id: item.user_id,
        nickname: item.nickname,
        ask_state: item.ask_state,
        avatar_url: item.avatar_url,
    }))
}

export const agroup_user = createQueryCache({
    sessionId: Session.get(),
    cacheKey: 'group_user_list',
    queryFn: queryFn,
    staleTime: 12 * 60 * 60 * 1000,
});