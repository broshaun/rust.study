import { Outlet, useLocation, useNavigate } from 'react-router';
import { useHttpClient, useImgApiBase, currentAppBar, currentChat } from 'utils';
import { useDateTime, getUserDB } from 'utils';
import { useMutation } from '@tanstack/react-query';
import { useLocalStorage } from '@mantine/hooks';
import { useEffect } from "react"



export const Main = () => {


    const setTitle = currentAppBar((state) => state.setTitle);
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const current = currentChat((s) => s.current);
    useEffect(() => {
        setTitle(current?.displayName)
        setLeftPath('/mobile/chat/message/')
    }, [current])


    const { joinPath: joinPathAvatar } = useImgApiBase('/files/avatar/')

    /** 账号对应信息
     * 个人数据库
     */
    const [account] = useLocalStorage({ key: 'savedAccount' });
    const db = getUserDB(account);
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

                http.requestBodyJson('PUT', { user_id: uid, msg_type: msgType, msg_text: msgText })
                    .then((results) => {
                        if (!results) return;
                        const { code } = results;
                        if (code === 200) {
                            db.table('message').put({
                                uid: uid,
                                type: msgType,
                                content: msgText,
                                timestamp: getDateTimeStr(),
                                sentByMe: true
                            });
                        }
                    });

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


    return <Outlet context={{ fnSendMsg, joinPathAvatar, db }} />

}




