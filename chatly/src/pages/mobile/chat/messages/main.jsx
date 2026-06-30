import { Outlet, useLoaderData } from 'react-router';
import { createHttpClient, useDateTime, getUserDB } from 'utils';
import { loginCache } from 'cache/loginCache';
import { ObjectId } from "bson";
import { userId } from 'utils/identity';


export const loaderData = async () => {
    const uid = userId.get();
    if (!uid) throw new Response("Unauthorized", { status: 401 });
    const initialCache = await loginCache.fetch();
    const db = getUserDB(uid);
    return { uid, initialCache, db };
}


export const Main = () => {
    /** 账号对应信息
     * 个人数据库
     */
    const { initialCache: currentUser, db, uid } = useLoaderData();
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

    return <Outlet context={{ fnSendMsg, db, uid }} />

}




