import { useState, Suspense, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router';
import { InputText2, currentAppBar } from 'components';
import { useHttpClient } from 'utils';
import { useMutation } from '@tanstack/react-query';
import { Group } from "@mantine/core";


export const Nikename = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { http: apiLogin } = useHttpClient('/rpc/chat/login/');
    const [name, setName] = useState()

    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setTitle = currentAppBar((state) => state.setTitle);
    useEffect(() => {
        setLeftPath('/chat/self/mylist/')
        setTitle('修改昵称');
    }, [])


    const { mutateAsync: update, isPending: loading } = useMutation({
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
    });


    return <Suspense fallback={<div>加载中...</div>}>
        <Group p={25}>
            {location.state &&
                <InputText2 defaultValue={location.state?.nikename} onChangeValue={(value) => { setName(value) }}>
                    <InputText2.Left icon='bookmark-square' />
                    <InputText2.Right label='确定' onClick={() => { update(name); navigate('/chat/self/mylist/'); }} />
                </InputText2>
            }
        </Group>
    </Suspense>


}

