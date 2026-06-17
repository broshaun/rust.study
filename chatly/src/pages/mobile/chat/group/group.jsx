import { Outlet } from 'react-router';
import { useHttpClient, useDateTime, getUserDB, GlobalModal } from 'utils';
import { useMutation } from '@tanstack/react-query';
import { useLocalStorage } from '@mantine/hooks';
import { loginCache } from 'http/loginCache';


export const Group = () => {
    const [userId] = useLocalStorage({ key: 'current_account' });
    const db = getUserDB(userId);
    const dt = useDateTime();
    const currentUser = loginCache.get(userId)

    const { http } = useHttpClient('/rpc/chat/msg/group/');
    const mutation = useMutation({
        mutationFn: async ({ group_id, msgType, msgText }) => {
            const results = await http.requestBodyJson('group_send', {
                group_id: group_id,
                msg_type: msgType,
                msg_text: msgText
            });
            if (results?.code === 200) {
                db.table('gmsgs').put({
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
        },
        onError: (error) => {
            console.error(error);
        },
        onSuccess: (data) => {
            console.log(data);
        },
    });


    return <div>
        <GlobalModal />
        <Outlet context={{ db, mutation }} />
    </div>


}




