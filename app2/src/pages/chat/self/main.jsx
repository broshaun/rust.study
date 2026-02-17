import { TextList } from 'components';


export const Mian = () => {
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


    return   <TextList size={46}>
        <TextList.Items>{items}</TextList.Items>
        
    </TextList>



}

