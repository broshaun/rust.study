import { Suspense, useEffect,useState } from "react";
import { useNavigate } from 'react-router';
import { createHttpClient, currentAppBar } from 'utils';
import { NicknameEditPage } from "./ui/NicknameEditPage";
import { loginCache } from "cache/loginCache";


export const Nickname = () => {
    const navigate = useNavigate();

    const [User, setUser] = useState(null)
    useEffect(() => {
        let isMounted = true;
        loginCache.fetch().catch(() => { });
        const unsubscribe = loginCache.subscribe((next) => {
            if (!isMounted) return;
            const isObject = next?.data && typeof next.data === 'object';
            const newData = isObject ? next.data : {};
            setUser(newData);
        });
        return () => {
            isMounted = false;
            unsubscribe?.();
        }
    }, []);

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
        await loginCache.refresh()
        await navigate('/mobile/chat/self/')
    }
    return <Suspense fallback={<div>加载中...</div>}>
        <NicknameEditPage value={User?.nickname} onClick={(text) => { nameEdit(text) }} />
    </Suspense>


}

