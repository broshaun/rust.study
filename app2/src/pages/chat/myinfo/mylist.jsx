import { useState, Suspense, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { List, Container } from 'components';
import { useHttpClient } from 'hooks/http';
import { useRequest } from 'ahooks';


export const MyList = () => {
    const navigate = useNavigate();
    const location = useLocation()
    const { http: apiLogin } = useHttpClient('/api/chat/login/');
    const [apiInfo, setApiInfo] = useState();

    useRequest(() => {
        apiLogin.requestParams('GET').then((results) => {
            if (!results) return;
            const { code, message, data } = results
            code === 200 && setApiInfo(data)
        })
    }, { refreshDeps: [location.pathname] })


    return <Suspense>
        {apiInfo &&
            <List>
                <List.Items icon='user-circle' onClick={() => { navigate('/chat/self/image/', { 'state': apiInfo }); }}>头像</List.Items>
                <List.Items icon='email' onClick={() => { }}>{apiInfo?.email}</List.Items>
                <List.Items icon='bookmark-square' onClick={() => { navigate('/chat/self/name/', { 'state': apiInfo }); }}>昵称：{apiInfo?.nikename} </List.Items>
                <List.Items icon='bookmark-square' onClick={() => { navigate('/chat/self/pushdeer/', { 'state': apiInfo }); }}>设置手机提醒</List.Items>
                <List.Items icon='arrow-left' onClick={() => { navigate('/chat/self/lgout/', { 'state': apiInfo }); }}>退出登录</List.Items>
            </List>
        }
    </Suspense>
}

