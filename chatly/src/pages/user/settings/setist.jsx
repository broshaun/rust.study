import { useState, Suspense, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { List, Container } from 'components';
import { useHttpClient } from 'hooks/http';
import { useRequest } from 'ahooks';


export const MyList = () => {
    const navigate = useNavigate();
    const location = useLocation()

    return <List>
        <List.Items icon='user-circle' onClick={() => { navigate('/user/settings/agent/') }}>设置代理</List.Items>
    </List>

}

