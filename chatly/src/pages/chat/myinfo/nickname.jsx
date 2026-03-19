import { useState, Suspense } from "react";
import { useNavigate, useLocation } from 'react-router';
import { InputText2 } from 'components';
import { useHttpClient2 } from 'hooks/http';
import { XBox, Icon } from 'components/flutter';
import { useMutation } from '@tanstack/react-query';


export const Nikename = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { http: apiLogin } = useHttpClient2('/rpc/chat/login/');
    const [name, setName] = useState()



    const { mutateAsync: update, isPending: loading } = useMutation({
        mutationFn: async (nikename) => {
            if (!nikename) {
                throw new Error('请输入昵称');
            }
            const res = await apiLogin.post('PATCH', { nikename });
            if (!res) {
                throw new Error('请求失败');
            }
            const { code, message } = res;
            if (code !== 200) {
                throw new Error(message || '更新失败');
            }
            return 'ok';
        },
    });


    return <Suspense fallback={<div>加载中...</div>}>
        <br />
        <XBox padding={10}>
            <XBox.Segment span={1} >
                <Icon name='chevron-left' onClick={() => { navigate('/chat/self/mylist/') }} />
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

