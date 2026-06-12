import { Suspense, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router';
import { useHttpClient, currentAppBar } from 'utils';
import { useMutation } from '@tanstack/react-query';
import { PushdeerEditPage } from "./ui/PushdeerEditPahe";


export const PushDeer = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { http: apiLogin } = useHttpClient('/rpc/chat/login/');

    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setTitle = currentAppBar((state) => state.setTitle);
    useEffect(() => {
        setLeftPath('/mobile/chat/self/')
        setTitle('请输入PushKey');
    }, [])

    const { mutateAsync: pushKeyEdit, isPending } = useMutation({
        mutationFn: async (push_key) => {
            if (!push_key) {
                throw new Error('请输入推送码');
            }
            const results = await apiLogin.post('update', { push_key });
            if (!results) {
                throw new Error('请求失败');
            }
            const { code, message } = results;
            if (code !== 200) {
                throw new Error(message || '更新失败');
            }
            return 'ok';
        },
        onSuccess: () => {
            navigate('/mobile/chat/self/')
        }
    });

    return <Suspense fallback={<div>加载中...</div>}>
        <PushdeerEditPage value={location.state?.pushKey} onClick={(key) => { pushKeyEdit(key) }} />
    </Suspense>


}

