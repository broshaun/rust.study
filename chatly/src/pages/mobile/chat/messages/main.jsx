import { Outlet, useLoaderData, useParams } from 'react-router';
import { createHttpClient, useDateTime, getUserDB, GlobalModal } from 'utils';
import { loginCache2 } from 'cache/loginCache';
import { ObjectId } from "bson";
import { userId } from 'utils/identity';
import { friend_list2 } from 'cache/friend_list';


export const loaderData = async () => {
    const uid = userId.get();
    const currentUser = await loginCache2.fetch();
    const db = getUserDB(uid);
    const friends = await friend_list2.getAsync()
    return { db, friends, currentUser };
}


export const Main = () => {
    /** 账号对应信息
     * 个人数据库
     */
    const { db, friends, currentUser } = useLoaderData();
    const { id: friendId } = useParams();
    // console.log('currentUser++',currentUser)

    const msgFriend = friends.find(item => item.id === friendId);
    // console.log('msgFriend++',msgFriend)



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

    return <div>
        <GlobalModal />
        <Outlet context={{ fnSendMsg, db, msgFriend }} />
    </div>
    

}




