import { Outlet } from 'react-router';
import { createHttpClient, useDateTime, getUserDB } from 'utils';
import { useLocalStorage } from '@mantine/hooks';
import { loginCache } from 'cache/loginCache';
import { ObjectId } from "bson";


export const Main = () => {
    /** 账号对应信息
     * 个人数据库
     */

    const [userId] = useLocalStorage({ key: 'current_account' });
    const db = getUserDB(userId);
    const currentUser = loginCache.get();
    const { getDateTimeStr } = useDateTime();

    /**
     * 发送信息
     */
    const { http } = createHttpClient('/rpc/chat/msg/single2/');
    const fnSendMsg = async ({ uid, msgType, msgText }) => {
        try {
            const results = await http.requestBodyJson('send', {
                user_id: uid,
                msg_type: msgType,
                msg_text: msgText
            });
            if (!results) return;
            console.log('发送结果results',results)
            // [Log] 发送结果results – {code: 200, message: "", data: "6a3bea96d237a5e0da31d073"} (index.d1a019fcd9b05e9e.hot-update.js, line 44)
            if (results?.code === 200) {
                db.table('message').put({
                    id: new ObjectId().toString(),
                    uid: uid,
                    nickname: '我自己',
                    type: msgType,
                    content: msgText,
                    timestamp: getDateTimeStr(),
                    sentByMe: true,
                    avatar_url: currentUser?.avatar_url,
                });

            } else if (results?.code === 335) {
                db.table('message').put({
                    id: new ObjectId().toString(),
                    uid: uid,
                    nickname: '我自己',
                    type: msgType,
                    content: results?.message,
                    timestamp: getDateTimeStr(),
                    sentByMe: true,
                    avatar_url: currentUser?.avatar_url,
                });
            }
        } finally {
        }
    }

    return <Outlet context={{ fnSendMsg }} />

}




