import React, { } from '.store/react@18.3.1/node_modules/react';
import { useNavigate, } from "react-router-dom";
import { Desktop } from 'components';


export const Home2 = () => {
    const navigate = useNavigate();
    const desktopData = [
        { label: '用户认证', iconName: 'user-tie', onClick: () => { navigate('/user') } },
        { label: '即时聊天', iconName: 'chat-bubble-left-right', onClick: () => { navigate('/chat') } },
    ];
    return <Desktop desktopData={desktopData}></Desktop>
}
export default Home2;




