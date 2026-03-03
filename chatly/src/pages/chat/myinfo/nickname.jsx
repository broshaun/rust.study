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
    const { runAsync: update } = useRequest(
        async (nikename) => {
            try {
                if (!nikename) return '请输入昵称'
                const { code, message, data } = await apiLogin.requestBodyJson('PATCH', { nikename: nikename })
                console.log('message', message)
                return 'ok'
            } catch {
                console.error
            }
        }, { manual: true })



    return <Suspense fallback={<div>加载中...</div>}>
        <br />
        <Row>
            <Col span={1} >
                <IconCustomColor name='chevron-left' onClick={() => { navigate('/chat/self/mylist/') }} />
            </Col>
            <Col span={15} ><h3>修改的昵称：</h3></Col>
        </Row>

        <Row>

            {location.state &&
                <InputText2 defaultValue={location.state?.nikename} onChangeValue={(value) => { setName(value) }}>
                    <InputText2.Left icon='bookmark-square' />
                    <InputText2.Right label='确定' onClick={() => { update(name); navigate('/chat/self/mylist/'); }} />
                </InputText2>
            }


        </Row>
    </Suspense>


}

