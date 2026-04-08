import { Outlet, useLocation, useNavigate } from 'react-router';
import { useHttpClient2, useImgApiBase } from 'hooks/http';
import { useDateTime, useWinSize } from 'hooks';
import { useMutation } from '@tanstack/react-query';
import { useUserDB } from 'hooks/db';
import { useLocalStorage } from '@mantine/hooks';


export const Main = () => {
    const location = useLocation();

    /** 账号对应信息
     * 个人数据库
     */
    const [account] = useLocalStorage({ key: 'savedAccount' });
    const { db } = useUserDB(account);

    /** 个人头像
     * 
     */
    const [myAvatar] = useLocalStorage({ key: 'myAvatar' });
    const sendAvatarSrc = useMemo(() => {
        if (!myAvatar) return "";
        return joinPathAvatar(myAvatar)
    }, [myAvatar]);


    const { uid } = location.state || {};
    const { getDateTimeStr } = useDateTime();


    /**
     * 发送信息
     */
    const { http } = useHttpClient2('/rpc/chat/msg/single/');
    const { mutateAsync: fnSendMsg, isPending: loading } = useMutation(
        {
            mutationFn: async ({ uid, msgText }) => {
                http.requestBodyJson('PUT', { user_id: uid, msg: msgText })
                    .then((results) => {
                        if (!results) return;
                        const { code } = results;
                        if (code === 200) {
                            db.table('message').put({
                                uid: uid,
                                msg: msgText,
                                timestamp: getDateTimeStr(),
                                signal: 'send'
                            });
                        }
                    });
                return 'ok';
            },
        }
    );

    /**
     * 上传图片服务
     * 上传缓存30天图片
     */
    const { http: httpImg30 } = useHttpClient2('/files/img30/');
    const { mutateAsync: uploadImg30, isPending: img30loading } = useMutation(
        {
            mutationFn: async ({ file }) => {
                const { code, data } = await httpImg30.uploadFiles(file);
                if (code === 200 && data) {
                    return data;
                }
                return;
            },
        }
    );

    const { joinPath: joinPathImg30 } = useImgApiBase('/img30/')
    const { joinPath: joinPathAvatar } = useImgApiBase('/avatar/')

    return <Outlet context={{ fnSendMsg, loading, uploadImg30, joinPathImg30, joinPathAvatar, db }} />

}




