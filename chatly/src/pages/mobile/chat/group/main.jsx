import { Outlet } from 'react-router';
import { useHttpClient, useDateTime, getUserDB } from 'utils';
import { useMutation } from '@tanstack/react-query';
import { useLocalStorage } from '@mantine/hooks';




export const Group = () => {
    /** 账号对应信息
     * 个人数据库
     */
    const [account] = useLocalStorage({ key: 'savedAccount' });
    const db = getUserDB(account);
    const { getDateTimeStr } = useDateTime();

    /**
     * 发送信息
     */
    const { http } = useHttpClient('/rpc/chat/msg/group/');
    // const { mutateAsync: fnSendMsg, isPending } = useMutation(
    const mutation = useMutation(
        {
            mutationFn: async ({ group_id, msgType, msgText }) => {
                const results = await http.requestBodyJson('group_send', {
                    group_id: group_id,
                    msg_type: msgType,
                    msg_text: msgText
                });
                if (!results) return;
                if (results?.code === 200) {
                    db.table('gmsgs').put({
                        group_id: group_id,
                        type: msgType,
                        content: msgText,
                        timestamp: getDateTimeStr(),
                        sentByMe: true
                    });
                }
                return 'ok';
            },
            onError: (error) => {
                console.error(error);
            },
            onSuccess: (data) => {
                console.log(data);
            },
        }
    );
    // mutation.mutateAsync({})


    return <Outlet context={{ db, mutation }} />

}




