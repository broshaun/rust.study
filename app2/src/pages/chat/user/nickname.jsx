import { useState, useCallback, useTransition, Suspense } from 'react';
import { Outlet, useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { Row, Image, List, Container, InputText2 } from 'components';
import { IconCustomColor } from 'components/icon';
import { useHttpClient } from 'hooks';
import { useRequest } from 'ahooks';



export const Nikename = () => {
    const navigate = useNavigate();
    const { http: apiLogin } = useHttpClient('/api/chat/login/');
    const { setShow } = useOutletContext();
    const [apiData, setApiData] = useState();
    const [isPending, startTransition] = useTransition()
    const [name, setName] = useState()


    useRequest(() => {
        apiLogin.requestParams('GET').then((results) => {
            if (!results) return;
            const { code, message, data } = results
            code === 200 && startTransition(() => {
                setApiData(data)
            })
        })
    }, { refreshDeps: [] })



    const { runAsync: update } = useRequest((nikename) => {
        if (!nikename) return '请输入昵称'
        apiLogin.requestBodyJson('PATCH', { nikename: nikename }).then((results) => {
            if (!results) return;
            const { code, message, data } = results
            console.log('message', message)

        })
        return 'ok'
    }, { manual: true })

   

    return <Suspense fallback={<div>加载中...</div>}>
        <Row >
            <Row.Item span={1} justify='left' >
                <IconCustomColor name='chevron-left' onClick={() => { setShow(false); navigate('/chat/self/'); }} />
            </Row.Item>
            <Row.Item span={4} />
            <Row.Item span={1} justify='right' >

            </Row.Item>
        </Row>
        <Row>
            <Row.Item>
                {apiData &&
                    <InputText2 defaultValue={apiData?.nikename} onChangeValue={(value) => { setName(value) }}>
                        <InputText2.Left label='昵称' />
                        <InputText2.Right icon='check-online' onClick={() => { update(name) }} />
                    </InputText2>
                }

            </Row.Item>
        </Row>

    </Suspense>


}

