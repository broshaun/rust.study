import { Outlet } from 'react-router';
import { createHttpClient, useDateTime, getUserDB, useReady } from 'utils';
import { loginCache } from 'cache/loginCache';
import { ObjectId } from "bson";
import { userId } from 'utils/identity';
import { useMemo } from 'react';


export const Main = () => {
    /** 账号对应信息
     * 个人数据库
     */


    const { ready, data: readyData } = useReady(() => {
        const uid = userId.get();
        const usr = loginCache.get();
        if (uid && usr) {
            return { uid, usr };
        }
        return null;
    }, []);


    const db = useMemo(() => {
        if (!ready) return;
        return getUserDB(readyData?.uid);
    }, [ready])


    const { getDateTimeStr } = useDateTime();

    /**
     * 发送信息
     */
    const { http } = createHttpClient('/rpc/chat/msg/single2/');
    const fnSendMsg = async ({ uid, msgType, msgText }) => {
        if (!ready)return;
        const currentUser = readyData?.usr

        try {
            const results = await http.requestBodyJson('send', {
                user_id: uid,
                msg_type: msgType,
                msg_text: msgText
            });
            if (!results) return;
            if (results?.code === 200) {
                await db.table('message').put({
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
                await db.table('message').put({
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




