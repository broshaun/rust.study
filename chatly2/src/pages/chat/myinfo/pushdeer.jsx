import { useState, Suspense } from "react";
import { useNavigate, useLocation } from 'react-router';
import { InputText2 } from 'components';
import { useHttpClient2 } from 'hooks/http';
import { useRequest } from 'ahooks';
import { XBox,Icon } from 'components/flutter';



export const PushDeer = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { http: apiLogin } = useHttpClient2('/rpc/chat/login/');
    const [pushKey, setPushKey] = useState(location.state?.pushKey)


    const { runAsync: update } = useRequest((push_key) => {
        if (!push_key) return '请输入推送码'
        apiLogin.post('PATCH', { push_key: push_key }).then((results) => {
            if (!results) return;
            const { code, message, data } = results
            console.log('message', message)
        })
        return 'ok'
    }, { manual: true })


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

