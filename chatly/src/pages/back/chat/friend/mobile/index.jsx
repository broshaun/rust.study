import { Outlet } from 'react-router';
import { Item } from './item';
import { Detail } from './detail';
import { Find } from './find';

export const Mobile = () => {
    return <Outlet />
}

 Mobile.Item = Item;
 Mobile.Detail = Detail;
 Mobile.Find = Find;




