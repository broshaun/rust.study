import { useState, useCallback, Suspense, useTransition } from 'react';
import { Outlet, useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { Row, Image, List, Container, Modal } from 'components';
import { IconCustomColor } from 'components/icon';
import { useHttpClient } from 'hooks';
import { useRequest } from 'ahooks';


export const Mian = () => {
    const navigate = useNavigate();
    const location = useLocation()
    const [show, setShow] = useState(false);
    const [isPending, startTransition] = useTransition()
    const { http: apiLogin } = useHttpClient('/api/chat/login/');
    const [apiData, setApiData] = useState();

    useRequest(() => {
        apiLogin.requestParams('GET').then((results) => {
            if (!results) return;
            const { code, message, data } = results
            code === 200 && startTransition(() => {
                setApiData(data)
            })
        })
    }, { refreshDeps: [location.pathname] })

    // console.log('apiData', apiData)

    return <Suspense>
        {!show &&
            < List >
                <List.Items icon='user-circle' onClick={() => { setShow(true); navigate('image/', { state: apiData }); }}>头像</List.Items>
                <List.Items icon='email' onClick={() => { }}>{apiData?.email}</List.Items>
                <List.Items icon='bookmark-square' onClick={() => { setShow(true); navigate('name/', { state: apiData }); }}>昵称：{apiData?.nikename} </List.Items>
                <List.Items icon='arrow-left' onClick={() => { setShow(true); navigate('lgout/', { state: apiData }); }}>退出登录</List.Items>
            </List>
        }
        {show &&
            <Container>
                <Outlet context={{ setShow }} />
            </Container>
        }
    </Suspense >
}

