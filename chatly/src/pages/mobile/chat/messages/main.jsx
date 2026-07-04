import { Outlet, useLoaderData,useParams } from 'react-router';
import { createHttpClient, useDateTime, getUserDB } from 'utils';
import { loginCache } from 'cache/loginCache';
import { ObjectId } from "bson";
import { userId } from 'utils/identity';


export const loaderData = async ({params}) => {
    const { id: friendId } = params;
    const uid = userId.get();
    await loginCache.fetch();
    const db = getUserDB(uid);
    const msgFriend = await db.table('friends').get(friendId)
    return { db, msgFriend };
}


export const Main = () => {
    /** 账号对应信息
     * 个人数据库
     */
    const { db, msgFriend } = useLoaderData();
    const currentUser = loginCache.get()
    const { getDateTimeStr } = useDateTime();

    /**
     * 发送信息
     */
    const { http } = createHttpClient('/rpc/chat/msg/single2/');
    const fnSendMsg = async ({ msgType, msgText }) => {

        try {
            const results = await http.requestBodyJson('send', {
                user_id: msgFriend.uid,
                msg_type: msgType,
                msg_text: msgText
            });
            if (!results) return;
            // console.log('results++',results)
            if (results?.code === 200) {
                await db.table('message').put({
                    id: new ObjectId().toString(),
                    uid: msgFriend.uid,
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
                    uid: msgFriend.uid,
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

    return <Outlet context={{ fnSendMsg, db, msgFriend }} />

}




