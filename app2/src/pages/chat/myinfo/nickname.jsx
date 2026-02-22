import { useState, useCallback, useTransition, Suspense } from 'react';
import { Outlet, useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { Row, Col, InputText2 } from 'components';
import { IconCustomColor } from 'components/icon';
import { useHttpClient } from 'hooks';
import { useRequest } from 'ahooks';



export const Nikename = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { http: apiLogin } = useHttpClient('/api/chat/login/');
    const [name, setName] = useState()



    const { runAsync: update } = useRequest((nikename) => {
        setOk(p => !p)
        if (!nikename) return '请输入昵称'
        apiLogin.requestBodyJson('PATCH', { nikename: nikename }).then((results) => {
            if (!results) return;
            const { code, message, data } = results
            console.log('message', message)
        })
        return 'ok'
    }, { manual: true })

    const [ok, setOk] = useState(false)

    return <Suspense fallback={<div>加载中...</div>}>
        <br />
        <Row justify='center' ><h3>请输入要修改的昵称：</h3></Row>
        <Row>
            <Col span='1'>
                <IconCustomColor name='chevron-left' onClick={() => { navigate('/chat/self/mylist/'); }} />
            </Col>
            <Col span='3'>
                {location.state &&
                    <InputText2 defaultValue={location.state?.nikename} onChangeValue={(value) => { setName(value) }}>
                        <InputText2.Left label='昵称' />
                        <InputText2.Right label={ok ? '' : '确定'} icon={ok ? 'check-online' : ''} onClick={() => { update(name); navigate('/chat/self/mylist/'); }} />
                    </InputText2>
                }
            </Col>
            <Col span='1' />
        </Row>
    </Suspense>


}

