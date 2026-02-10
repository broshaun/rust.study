import React, { } from 'react';
import { useNavigate, } from "react-router-dom";
import { Desktop } from 'components';


export const Home2 = () => {
    const navigate = useNavigate();
    const desktopData = [
        // { label: '超管员', iconName: 'user-secret2', onClick: () => { navigate('/super') } },
        { label: '用户认证', iconName: 'user-tie', onClick: () => { navigate('/user') } },
        { label: '交友互动', iconName: 'heartbeat', onClick: () => { navigate('/display') } },
    ];
    return <Desktop desktopData={desktopData}></Desktop>
}
export default Home2;


