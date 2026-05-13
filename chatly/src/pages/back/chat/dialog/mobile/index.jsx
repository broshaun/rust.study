import { Outlet } from 'react-router';
import { Item } from './item';


export const Mobile = () => {
    return <Outlet />
}

Mobile.Item = Item;