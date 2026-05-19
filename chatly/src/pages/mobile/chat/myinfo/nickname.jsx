import { Suspense, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router';
import { useHttpClient, currentAppBar } from 'utils';
import { useMutation } from '@tanstack/react-query';
import { NicknameEditPage } from "./UI/NicknameEditPage";


export const Nikename = () => {
    const navigate = useNavigate();
    const location = useLocation();


    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setTitle = currentAppBar((state) => state.setTitle);
    useEffect(() => {
        setLeftPath('/mobile/chat/self/')
        setTitle('修改昵称');
    }, [])

    const { http: apiLogin } = useHttpClient('/rpc/chat/login/');
    const { mutateAsync: nameEdit, isPending: loading } = useMutation({
        mutationFn: async (nikename) => {
            if (!nikename) {
                throw new Error('请输入昵称');
            }
            const res = await apiLogin.post('PATCH', { nikename });
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
            navigate('/mobile/chat/self/')
        }
    });


    return <Suspense fallback={<div>加载中...</div>}>
        <NicknameEditPage value={location.state?.nikename} onClick={(text) => { nameEdit(text) }} />
    </Suspense>


}

