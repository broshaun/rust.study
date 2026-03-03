import { useState, Suspense, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { List, Container } from 'components';
import { useHttpClient } from 'hooks/http';
import { useRequest } from 'ahooks';


export const MyList = () => {
    const navigate = useNavigate();
    const location = useLocation()

    return <Suspense>
        
        <List>
            <List.Items icon='user-circle' onClick={() => { navigate('/user/settings/agent/') }}>设置代理</List.Items>
            {/* <List.Items icon='email' onClick={() => { }}>{apiInfo?.email}</List.Items>
                <List.Items icon='bookmark-square' onClick={() => { navigate('/chat/self/name/', { 'state': apiInfo }); }}>昵称：{apiInfo?.nikename} </List.Items>
                <List.Items icon='arrow-left' onClick={() => { navigate('/chat/self/lgout/', { 'state': apiInfo }); }}>退出登录</List.Items> */}
        </List>

    </Suspense>
}

