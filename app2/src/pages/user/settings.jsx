
import { InputText2 } from 'components';
import { useLocalStorageState } from 'ahooks';


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
            icon: { name: 'user', label: '个人中心' },
            // 无自定义onClick，使用默认打印逻辑
        },
        {
            key: 'settings',
            display: true,
            icon: { name: 'cog-6-tooth', label: '设置' },
        },

    ];


    return <InputText2 defaultValue={apiBase} onChangeValue={(value) => { setApiBase(`http://${value}`) }}>
        <InputText2.Left label={'服务地址'}></InputText2.Left>
    </InputText2>


}