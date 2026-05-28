import { Outlet } from 'react-router';
import { useHttpClient, useDateTime, getUserDB } from 'utils';
import { useMutation } from '@tanstack/react-query';
import { useLocalStorage } from '@mantine/hooks';


export const Group = () => {
    /** 账号对应信息
     * 个人数据库
     */
    const [avatar] = useLocalStorage({ key: 'myAvatar' })
    const [account] = useLocalStorage({ key: 'savedAccount' });
    const db = getUserDB(account);
    const dt = useDateTime();

    /**
     * 发送信息
     */
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
                    nikename: '我自己',
                    type: msgType,
                    content: msgText,
                    timestamp: dt.getDateTimeStr(),
                    sentByMe: true,
                    avatar_url: avatar,
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
    // mutation.mutateAsync({})
    // mutation.isPending
    // mutation.isSuccess
    // mutation.isError

    return <Outlet context={{ db, mutation }} />

}




