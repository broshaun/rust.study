import {  Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { List } from 'components';
import { useHttpClient2 } from 'hooks/http';
import { useRequest } from 'ahooks';


export const MyList = () => {
    const navigate = useNavigate();
    const { http: apiLogin } = useHttpClient2('/rpc/chat/login/');
    const { data: apiInfo } = useRequest(async () => {
        try {
            const { code, message, data } = await apiLogin.post('GET')
            if (code === 200) {
                return data;
            } else {
                return;
            }
        } catch {
            console.error
        }
    }, { refreshDeps: [] })


    return <Suspense>
        <List>
            <List.Items icon='user-circle' onClick={() => { navigate('/chat/self/image/', { 'state': apiInfo }); }}>头像</List.Items>
            <List.Items icon='email' onClick={() => { }}>{apiInfo?.email}</List.Items>
            <List.Items icon='bookmark-square' onClick={() => { navigate('/chat/self/name/', { 'state': apiInfo }); }}>昵称：{apiInfo?.nikename} </List.Items>
            <List.Items icon='rss' onClick={() => { navigate('/chat/self/pushdeer/', { 'state': apiInfo }); }}>设置手机提醒</List.Items>
            <List.Items icon='arrow-left' onClick={() => { navigate('/chat/self/lgout/') }}>退出登录</List.Items>
        </List>
    </Suspense>
}

