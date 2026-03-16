import { useState, Suspense } from 'react';
import {  useNavigate, useLocation } from 'react-router-dom';
import { InputText2 } from 'components';
import { IconCustomColor } from 'components/icon';
import { useHttpClient2 } from 'hooks/http';
import { useRequest } from 'ahooks';
import { XBox } from 'components/flutter';


export const Nikename = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { http: apiLogin } = useHttpClient2('/rpc/chat/login/');
    const [name, setName] = useState()
    const { runAsync: update } = useRequest(
        async (nikename) => {
            try {
                if (!nikename) return '请输入昵称'
                const { code, message, data } = await apiLogin.post('PATCH', { nikename: nikename })
                console.log('message', message)
                return 'ok'
            } catch {
                console.error
            }
        }, { manual: true })



    return <Suspense fallback={<div>加载中...</div>}>
        <br />
        <XBox padding={10}>
            <XBox.Segment span={1} >
                <IconCustomColor name='chevron-left' onClick={() => { navigate('/chat/self/mylist/') }} />
            </XBox.Segment>
            <XBox.Segment span={15} ><h3>修改的昵称：</h3></XBox.Segment>
        </XBox>

        <XBox padding={10}>

            {location.state &&
                <InputText2 defaultValue={location.state?.nikename} onChangeValue={(value) => { setName(value) }}>
                    <InputText2.Left icon='bookmark-square' />
                    <InputText2.Right label='确定' onClick={() => { update(name); navigate('/chat/self/mylist/'); }} />
                </InputText2>
            }

        </XBox>
    </Suspense>


}

