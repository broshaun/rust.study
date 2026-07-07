import { Suspense, useEffect } from "react";
import { useOutletContext } from 'react-router';
import { createHttpClient, currentAppBar, currentModal } from 'utils';
import { PushdeerEditPage } from "./ui/PushdeerEditPahe";
import { useRequest } from "ahooks";
import { loginCache2 } from "cache/loginCache";


export const PushDeer = () => {
    const { currentUser: apiInfo } = useOutletContext();
    const { open, close } = currentModal();
    const { http: apiLogin } = createHttpClient('/rpc/chat/login/');

    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setTitle = currentAppBar((state) => state.setTitle);
    useEffect(() => {
        setLeftPath('/mobile/chat/self/')
        setTitle('请输入PushKey');
    }, [])

    const pushKeyEdit = async (push_key) => {
        if (!push_key) throw new Error('请输入推送码');
        const reg = /^PDU[A-Za-z0-9]+$/;
        if (!reg.test(push_key)) {
            throw new Error('推送码格式错误');
        }
        const results = await apiLogin.post('update', { push_key });
        const { code, message } = results;
        if (code !== 200) throw new Error(message);
    }

    const { runAsync } = useRequest((key) => pushKeyEdit(key),
        {
            manual: true,
            onError: async (error) => {
                open({
                    title: "推送码",
                    message: error?.message || String(error),
                    onConfirm: close,
                    onCancel: null
                });
            },
            onSuccess: async () => {
                open({
                    title: "推送码",
                    message: 'pushkey设置成功',
                    onConfirm: close,
                    onCancel: null
                });
                await loginCache2.refresh()
            }
        }
    )


    return <Suspense fallback={<div>加载中...</div>}>
        <PushdeerEditPage value={apiInfo?.pushKey} onClick={(key) => { runAsync(key) }} />
    </Suspense>


}

