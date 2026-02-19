import { useLocalStorageState } from 'ahooks';
import { InputText2, Container } from 'components';



export const Settings = () => {
    const [apiBase, setApiBase] = useLocalStorageState('apiBase', { 'defaultValue': '' })
    const items = [
        // {
        //     key: 'home',
        //     display: true,
        //     icon: { name: 'home', label: '主页' }, // 支持color配置
        //     onClick: (key) => console.log('自定义点击：选中了', key) // 自定义回调
        // },
        {
            key: 'user',
            display: true,
            icon: { name: 'user-circle', label: '头像' },
            // 无自定义onClick，使用默认打印逻辑
        },
        {
            key: 'settings',
            display: true,
            icon: { name: 'cog-6-tooth', label: '设置' },
        },

    ];


    return <Container alignItems='center'>
        <br/>
        <InputText2 defaultValue={apiBase} onChangeValue={(value) => { setApiBase(value) }}>
            <InputText2.Left label={'服务地址'}></InputText2.Left>
        </InputText2>
    </Container>
}