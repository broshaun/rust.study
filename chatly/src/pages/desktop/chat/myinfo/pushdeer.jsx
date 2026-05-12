import { useState, Suspense, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router';
import { InputText2, useAppBar } from 'components';
import { useHttpClient2 } from 'hooks/http';
import { useMutation } from '@tanstack/react-query';
import { Group } from "@mantine/core";


export const PushDeer = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { http: apiLogin } = useHttpClient2('/rpc/chat/login/');
    const [pushKey, setPushKey] = useState(location.state?.pushKey)

    const setLeftPath = useAppBar((state) => state.setLeftPath);
    const setTitle = useAppBar((state) => state.setTitle);
    useEffect(() => {
        setLeftPath('/chat/self/mylist/')
        setTitle('请输入PushKey');
    }, [])

    const { mutateAsync: update, isPending: loading } = useMutation({
        mutationFn: async (push_key) => {
            if (!push_key) {
                throw new Error('请输入推送码');
            }
            const results = await apiLogin.post('PATCH', { push_key });
            if (!results) {
                throw new Error('请求失败');
            }
            const { code, message } = results;
            if (code !== 200) {
                throw new Error(message || '更新失败');
            }
            return 'ok';
        },
    });

    return <Suspense fallback={<div>加载中...</div>}>
         <Group p={25}>
            {location.state &&
                <InputText2 showMask minWidth='300' defaultValue={pushKey} onChangeValue={(value) => { setPushKey(value) }} >
                    <InputText2.Left icon='key' />
                    <InputText2.Right label='确定' onClick={() => { update(pushKey); navigate('/chat/self/mylist/'); }} />
                </InputText2>
            }
        </Group>
    </Suspense>


}

