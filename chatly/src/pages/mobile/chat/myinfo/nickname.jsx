import { Suspense, useEffect } from "react";
import { useNavigate } from 'react-router';
import { useHttpClient, currentAppBar } from 'utils';
import { useMutation } from '@tanstack/react-query';
import { NicknameEditPage } from "./ui/NicknameEditPage";
import { loginCache } from "http/loginCache";
import { useLocalStorage } from '@mantine/hooks';

export const Nickname = () => {
    const [userId] = useLocalStorage({ key: 'current_account' });
    const navigate = useNavigate();
    const User = loginCache.useCache(userId)
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setTitle = currentAppBar((state) => state.setTitle);
    useEffect(() => {
        setLeftPath('/mobile/chat/self/')
        setTitle('修改昵称');
    }, [])

    const { http: apiLogin } = useHttpClient('/rpc/chat/login/');
    const { mutateAsync: nameEdit } = useMutation({
        mutationFn: async (nickname) => {
            if (!nickname) {
                throw new Error('请输入昵称');
            }
            const res = await apiLogin.post('update', { nickname });
            console.log('res',res)
            if (!res) {
                throw new Error('请求失败');
            }
            const { code, message } = res;
            if (code !== 200) {
                throw new Error(message || '更新失败');
            }
            return 'ok';
        },
        onSuccess: () => {
            loginCache.refresh(userId)
            navigate('/mobile/chat/self/')
        }
    });

    return <Suspense fallback={<div>加载中...</div>}>
        <NicknameEditPage value={User?.nickname} onClick={(text) => { nameEdit(text) }} />
    </Suspense>


}

