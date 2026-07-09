import { Suspense, useEffect } from "react";
import { useNavigate } from 'react-router';
import { createHttpClient, currentAppBar, currentModal } from 'utils';
import { ChangePasswordForm } from './ui/ChangePasswordForm';
import { useRequest } from "ahooks";



export const Password = () => {
    const navigate = useNavigate();
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setTitle = currentAppBar((state) => state.setTitle);
    useEffect(() => {
        setLeftPath('/mobile/chat/self/')
        setTitle('修改密码');
    }, [])

    const { open, close } = currentModal();
    const { http: apiLogin } = createHttpClient('/rpc/chat/login/');
    const { loading, run } = useRequest(
        async (password) => {
            if (!password) throw new Error('请输入密码');
            const { code, data, message } = await apiLogin.post('update', { 'pass_word': password });
            console.log('data')
            if (code !== 200) throw new Error(message);
            return data
        }, {
        manual: true,
        onSuccess: async () => {
            open({
                title: "修改密码",
                message: "密码修改成功",
                onConfirm: close()
            });
        },
        onFinally: async () => {
            navigate('/mobile/chat/self/')
        }
    })


    return <Suspense fallback={<div>加载中...</div>}>
        <ChangePasswordForm loading={loading} onConfirm={(password) => { run(password) }} />
    </Suspense>


}

