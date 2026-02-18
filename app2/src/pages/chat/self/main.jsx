import { useState } from 'react';
import { Outlet, useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { TextList, Image, List, Container } from 'components';
import { useHttpClient } from 'hooks';



export const Mian = () => {
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const { http } = useHttpClient('/imgs');
    const items = [
        {
            key: 'avatar',
            display: true,
            icon: { name: 'user-circle', label: '头像' },
            onClick: (key) => { setShow(true); }
        },
        {
            key: 'settings',
            display: true,
            icon: { name: 'cog-6-tooth', label: '设置' },
            onClick: (key) => { console.log('点击了', key) }
        },
    ];

    console.log(http.buildUrl('7ffae106f9d5037f61de633b179db2e8.jpg'))


    return <List>
        {!show && <List.Items>{items}</List.Items>}
        {show &&
            <List.Content>
                <Container>
                    {/* <img src={http.buildUrl('7ffae106f9d5037f61de633b179db2e8.jpg')} /> */}
                    <Image src={http.buildUrl('7ffae106f9d5037f61de633b179db2e8.jpg')} />
                </Container>
            </List.Content>
        }
    </List>


}

