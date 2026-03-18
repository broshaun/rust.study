import { Suspense } from "react";
import { useNavigate } from 'react-router';
import { List } from 'components';
import { useHttpClient2 } from 'hooks/http';
import { YBox } from 'components/flutter';
import { useQuery } from '@tanstack/react-query';



export const MyList = () => {
    const navigate = useNavigate();
    const { http: apiLogin } = useHttpClient2('/rpc/chat/login/');

    const { data: apiInfo = {}, isPending: loading, error } = useQuery(
        {
            queryKey: ['api-info'],
            queryFn: async () => {
                const res = await apiLogin.requestBodyJson('GET');
                if (!res || res.code !== 200) {
                    throw new Error(res?.message || '获取失败');
                }
                return res.data;
            },
        });


    return <Suspense>

        <YBox verticalScroll={true}>
            <List>
                <List.Items icon='user-circle' onClick={() => { navigate('/chat/self/image/', { 'state': apiInfo }); }}>头像</List.Items>
                <List.Items icon='email' onClick={() => { }}>{apiInfo?.email}</List.Items>
                <List.Items icon='bookmark-square' onClick={() => { navigate('/chat/self/name/', { 'state': apiInfo }); }}>昵称：{apiInfo?.nikename} </List.Items>
                <List.Items icon='rss' onClick={() => { navigate('/chat/self/pushdeer/', { 'state': apiInfo }); }}>设置手机提醒</List.Items>
                <List.Items icon='trash' onClick={() => { navigate('/chat/self/clear/') }}>清空聊天记录</List.Items>
                <List.Items icon='arrow-left' onClick={() => { navigate('/chat/self/lgout/') }}>退出当前登录</List.Items>
            </List>
        </YBox>

    </Suspense>
}

