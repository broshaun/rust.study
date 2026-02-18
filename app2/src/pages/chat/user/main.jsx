import { useState, useCallback } from 'react';
import { Outlet, useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { Row, Image, List, Container, ImageUpload } from 'components';
import { IconCustomColor } from 'components/icon';
import { useHttpClient } from 'hooks';



export const Mian = () => {
    const navigate = useNavigate();
    const [show, setShow] = useState(false);

    const items = [
        {
            key: 'avatar',
            display: true,
            icon: { name: 'user-circle', label: '头像' },
            onClick: (key) => { setShow(true); navigate('image/'); }
        },
                {
            key: 'name',
            display: true,
            icon: { name: 'bookmark-square', label: '昵称' },
            onClick: (key) => { setShow(true);navigate('name/') }
        },
        {
            key: 'settings',
            display: true,
            icon: { name: 'cog-6-tooth', label: '设置' },
            onClick: (key) => { console.log('点击了', key) }
        },
    ];



    return <List>
        {!show && <List.Items>{items}</List.Items>}
        {show &&
            <List.Content>
                <Container>
                    <Outlet context={{ setShow }} />
                </Container>
            </List.Content>
        }
    </List>


}

