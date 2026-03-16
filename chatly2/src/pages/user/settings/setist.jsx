
import { useNavigate, useLocation } from 'react-router-dom';
import { List, } from 'components';



export const MyList = () => {
    const navigate = useNavigate();
    const location = useLocation()

    return <List>
        <List.Items icon='user-circle' onClick={() => { navigate('/user/settings/agent/') }}>设置代理</List.Items>
    </List>

}

