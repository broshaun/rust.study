import { Outlet } from 'react-router';
import { useHttpClient, useDateTime, getUserDB } from 'utils';
import { useMutation } from '@tanstack/react-query';
import { useLocalStorage } from '@mantine/hooks';
import { loginCache } from 'http/loginCache';



export const Main = () => {
    /** 账号对应信息
     * 个人数据库
     */
    
    const [userId] = useLocalStorage({ key: 'current_account' });
    const db = getUserDB(userId);
    const currentUser = loginCache.get(userId);
    const { getDateTimeStr } = useDateTime();

    /**
     * 发送信息
     */
    const { http } = useHttpClient('/rpc/chat/msg/single/');
    const { mutateAsync: fnSendMsg, isPending } = useMutation(
        {
            mutationFn: async ({ uid, msgType, msgText }) => {
                console.log('msgType:', msgType);
                console.log('发送文本...', uid, msgText);
                const results = await http.requestBodyJson('PUT', {
                    user_id: uid,
                    msg_type: msgType,
                    msg_text: msgText
                });
                if (!results) return;
                if (results?.code === 200) {
                    db.table('message').put({
                        uid: uid,
                        nickname: '我自己',
                        type: msgType,
                        content: msgText,
                        timestamp: getDateTimeStr(),
                        sentByMe: true,
                        avatar_url: currentUser?.avatar_url,
                    });
                    
                }else if(results?.code === 335){
                    db.table('message').put({
                        uid: uid,
                        nickname: '我自己',
                        type: msgType,
                        content: results?.message,
                        timestamp: getDateTimeStr(),
                        sentByMe: true,
                        avatar_url: currentUser?.avatar_url,
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

    return <Outlet context={{ fnSendMsg, db, isPending }} />

}




