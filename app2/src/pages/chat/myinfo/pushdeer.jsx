import { useState, useCallback, useTransition, Suspense } from 'react';
import { Outlet, useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { Row, Col, InputText2 } from 'components';
import { IconCustomColor } from 'components/icon';
import { useHttpClient } from 'hooks';
import { useRequest } from 'ahooks';



export const PushDeer = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { http: apiLogin } = useHttpClient('/api/chat/login/');
    const [pushKey, setPushKey] = useState()



    const { runAsync: update } = useRequest((push_key) => {
        setOk(p => !p)
        if (!push_key) return '请输入推送码'
        apiLogin.requestBodyJson('PATCH', { push_key: push_key }).then((results) => {
            if (!results) return;
            const { code, message, data } = results
            console.log('message', message)
        })
        return 'ok'
    }, { manual: true })

    const [ok, setOk] = useState(false)

    return <Suspense fallback={<div>加载中...</div>}>
        <br />
        <Row justify='flex-start'>
            <IconCustomColor name='chevron-left' onClick={() => { navigate('/chat/self/mylist/'); }} />
        </Row>
         <br />
        <Row justify='center' ><h3>请输入PushKey：</h3></Row>
        <br/>
        <Row>
            {location.state &&
                <InputText2 minWidth='600' defaultValue={location.state?.pushKey} onChangeValue={(value) => { setPushKey(value) }} >
                    <InputText2.Right label='确定' onClick={() => { update(pushKey); navigate('/chat/self/mylist/'); }} />
                </InputText2>
            }
        </Row>


    </Suspense>


}

