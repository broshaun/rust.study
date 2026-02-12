import React, { useMemo, useState } from 'react'
import { Outlet, useNavigate } from "react-router-dom";
import { useUser, useWinWidth, useLogin } from 'hooks';
import { MenuMobile } from 'components';
import { ChatBox ,Container} from 'components/base';
import { useLocalStorageState } from 'ahooks';


export function Chat() {
  const navigate = useNavigate();
  const [msgs, setMsgs] = useLocalStorageState('chat-messages', {
    defaultValue: [
      {
        "from": "698d51f3d63d2413753b8bdd",
        "msg": "发送消息。。。",
        "timestamp": "2026-02-12 16:15:22"
      },
      {
        "from": "698d51f3d63d2413753b8bdd",
        "msg": "发送消息。。。",
        "timestamp": "2026-02-12 16:15:22"
      },
      {
        "from": "698d51f3d63d2413753b8bdd",
        "msg": "发送消息。。。",
        "timestamp": "2026-02-12 16:15:22"
      },
    ]
  });



  // const [title, setTitle] = useState('主页')
  // const items2 = [
  //   { key: 'logon', display: true, icon: { name: 'user-circle', label: '登陆' }, onClick: () => { navigate('/user/login/') } },
  //   {
  //     key: 'show',
  //     display: true,
  //     icon: { name: 'clipboard-document-list', label: '展示' },
  //     onClick: () => { navigate('/display/show/'); setTitle('展示栏') }
  //   },
  //   {
  //     key: 'image',
  //     display: true,
  //     icon: { name: 'photo', label: '相册' },
  //     onClick: () => { navigate('/display/image/');; setTitle('个人相册') }
  //   },
  // ];
  // const { winSize } = useWinWidth()




  return <React.Fragment>


    <ChatBox userId="698d51f3d63d2413753b8bdd" nickname="用户">
      <ChatBox.Head>标题</ChatBox.Head>
      <ChatBox.Message>
        {msgs}
      </ChatBox.Message>
      <ChatBox.Send onSend={(newMsg) => { console.log('点击发送'); console.log('msgs', msgs); setMsgs(p => [...p, { from: "698d51f3d63d2413753b8bdd", msg: newMsg, timestamp: "2026-02-12 16:30:32" }]); }} />
    </ChatBox>








    {/* <MenuMobile size={46}>
      <MenuMobile.Head title={title} leftIcon='left-chevron' onClick={() => { navigate('/') }} />
      <MenuMobile.Items position={winSize > 415 ? 'left' : 'bottom'}>{items2}</MenuMobile.Items>
      <MenuMobile.Content>
        <Outlet />
      </MenuMobile.Content>
    </MenuMobile> */}

  </React.Fragment>
}




