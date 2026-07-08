import { currentAppBar, createHttpClient, currentModal } from 'utils';
import { useParams, useLoaderData } from 'react-router';
import { useEffect } from "react";
import { useRequest } from "ahooks";
import { NotificationSender } from './ui/NotificationSender';
import { userId } from 'utils/identity';
import { loginCache2 } from 'cache/loginCache';
import { getUserDB } from 'utils';
import { friend_list2 } from 'cache/friend_list';


export const loaderOffline = async () => {
    const uid = userId.get();
    const currentUser = await loginCache2.fetch();
    const db = getUserDB(uid);
    const friends = await friend_list2.get()
    return { db, friends, currentUser };
}

export function Offline() {
    const { id: friendId } = useParams()
    const { db, friends, currentUser } = useLoaderData();
    const { open, close } = currentModal();
    const { http } = createHttpClient('/rpc/chat/msg/single2/');
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setRightIcon = currentAppBar((state) => state.setRightIcon);

    useEffect(() => {
        setLeftPath(`/mobile/chat/message/${friendId}`)
        setRightIcon(null)
    }, [])


    const msgFriend = friends.find(item => item.id === friendId);
    async function sendText(uid, text) {
        const { code, message, data } = await http.requestBodyJson('offline', { 'user_id': uid, 'msg_text': text })
        if (code !== 200) throw new Error(message)
        return data
    }

    const { run, loading } = useRequest(
        async (text) => await sendText(msgFriend.uid, text), {
        manual: true,
        onError: async (error) => {
            open({
                title: "离线消息",
                message: error?.message || String(error),
                onConfirm: () => close(),
                onCancel: null
            })
        },
        onSuccess: async (data) => {
            console.log('发送成功', data)
        }
    })


    return <div>
        <NotificationSender
            loading={loading}
            onSend={(value) => run(value?.message)}
        />
    </div>
}