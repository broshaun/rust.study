import { useState, Suspense } from "react";
import { useNavigate, useLocation } from 'react-router';
import { InputText2 } from 'components';
import { useHttpClient2 } from 'hooks/http';
import { XBox, Icon } from 'components/flutter';
import { useMutation } from '@tanstack/react-query';



export const PushDeer = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { http: apiLogin } = useHttpClient2('/rpc/chat/login/');
    const [pushKey, setPushKey] = useState(location.state?.pushKey)

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
        <XBox justify='left' padding={20}>
            <Icon name='chevron-left' onClick={() => { navigate('/chat/self/mylist/'); }} />
        </XBox>
        <XBox justify='center' padding={20}><h3>请输入PushKey</h3></XBox>

        <XBox padding={20}>
            {location.state &&
                <InputText2 showMask minWidth='300' defaultValue={pushKey} onChangeValue={(value) => { setPushKey(value) }} >
                    <InputText2.Left icon='key' />
                    <InputText2.Right label='确定' onClick={() => { update(pushKey); navigate('/chat/self/mylist/'); }} />
                </InputText2>
            }
        </XBox>


    </Suspense>


}

