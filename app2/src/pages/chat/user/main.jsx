import { useState, Suspense, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { List, Container } from 'components';
import { useHttpClient } from 'hooks';
import { useRequest } from 'ahooks';


export const Mian = () => {
    const navigate = useNavigate();
    const location = useLocation()


    return <Suspense>
        <Container>
            <Outlet />
        </Container>
    </Suspense >
}

