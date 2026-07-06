import { Suspense, useEffect } from "react";
import { useNavigate, useOutletContext } from 'react-router';
import { createHttpClient, currentAppBar } from 'utils';
import { NicknameEditPage } from "./ui/NicknameEditPage";
import { loginCache2 } from "cache/loginCache";


export const Nickname = () => {
    const { currentUser: User } = useOutletContext();

    const navigate = useNavigate();
    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setTitle = currentAppBar((state) => state.setTitle);
    useEffect(() => {
        setLeftPath('/mobile/chat/self/')
        setTitle('修改昵称');
    }, [])

    const { http: apiLogin } = createHttpClient('/rpc/chat/login/');

    const nameEdit = async (nickname) => {
        if (!nickname) {
            throw new Error('请输入昵称');
        }
        const res = await apiLogin.post('update', { nickname });
        if (!res) {
            throw new Error('请求失败');
        }
        const { code, message } = res;
        if (code !== 200) {
            throw new Error(message || '更新失败');
        }
        await loginCache2.refresh()
        await navigate('/mobile/chat/self/')
    }
    return <Suspense fallback={<div>加载中...</div>}>
        <NicknameEditPage value={User?.nickname} onClick={(text) => { nameEdit(text) }} />
    </Suspense>


}

