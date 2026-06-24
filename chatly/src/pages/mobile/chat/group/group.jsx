import { Outlet } from 'react-router';
import { createHttpClient, useDateTime, getUserDB, GlobalModal } from 'utils';
import { useLocalStorage } from '@mantine/hooks';
import { loginCache } from 'cache/loginCache';


export const Group = () => {
    const [userId] = useLocalStorage({ key: 'current_account' });
    const db = getUserDB(userId);
    const dt = useDateTime();
    const currentUser = loginCache.get(userId)
    const { http } = createHttpClient('/rpc/chat/msg/group2/');
    const msgSend = async ({ group_id, msgType, msgText }) => {
        const results = await http.requestBodyJson('send', {
            group_id: group_id,
            msg_type: msgType,
            msg_text: msgText
        });

        // console.log('group_id, msgType, msgText ',group_id, msgType, msgText )
        // console.log('results',results)
        if (results?.code === 200) {
            

            await db.table('gmsgs').put({
                id: results?.data,
                group_id: group_id,
                nickname: '我自己',
                type: msgType,
                content: msgText,
                timestamp: dt.getDateTimeStr(),
                sentByMe: true,
                avatar_url: currentUser?.avatar_url,
            });
        };
        return results?.message
    }

    return <div>
        <GlobalModal />
        <Outlet context={{ msgSend }} />
    </div>


}




