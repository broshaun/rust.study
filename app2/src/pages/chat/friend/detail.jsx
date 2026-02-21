import React, { useState, useEffect, Suspense, useTransition } from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import { useHttpClient } from 'hooks';
import { UserChat } from 'components/chat';
import { Container } from 'components';
import { useRequest, useLocalStorageState } from 'ahooks';
import { db, useIndexedDB } from 'hooks/db';



export function Detail() {
    const navigate = useNavigate();
    const location = useLocation();
    const [friend, setFriend] = useState(location.state?.select);
    const [isPending, startTransition] = useTransition()
    const { http: httpImgs } = useHttpClient('/imgs');
    const { http: http2 } = useHttpClient('/api/chat/friend/')

    const { table } = useIndexedDB(db);
    const tbdialog = table('chat_dialog');

    // 删除好友
    const { runAsync: delFid } = useRequest((id) => {
        http2.requestBodyJson('DELETE', { id }).then((results) => {
            if (!results) return;
            console.log('results', results)
        })
    }, { manual: true })


    // 好友备注
    const { runAsync: updRemark } = useRequest((id, remark) => {
        http2.requestBodyJson('PATCH', { id, remark }).then((results) => {
            if (!results) return;
            console.log('results', results)
        })
    }, { manual: true })

    // 打开聊天
    function openMsgWindow(select) {
        tbdialog.replace({ 'uid': select?.user_id, 'signal': 'old', 'dialog': 1 })
        navigate('/chat/dialog/msg/', { state: { uid: select?.user_id } })
    }


    return <Suspense fallback={<div>加载中...</div>}>
        <Container alignItems='center'>
            <br />
            {friend &&

                <UserChat friendData={friend}>
                    <UserChat.Avatar avatarUrl={httpImgs.buildUrl(friend?.avatar_url)} />
                    <UserChat.Text lable='名称' >{friend?.nikename}</UserChat.Text>
                    <UserChat.Text lable='邮箱' >{friend?.email}</UserChat.Text>
                    <UserChat.Text lable='备注' onConfirm={(remark) => { setFriend(p => ({ ...p, remark })); updRemark(friend?.id, remark); }}>{friend?.remark}
                    </UserChat.Text>
                    <UserChat.Button
                        lable="发起聊天"
                        color="#409eff"
                        onClick={(p) => openMsgWindow(p)}
                    />

                    <UserChat.Button
                        lable="删除好友"
                        color="#ff4d4f"
                        onClick={(v) => {
                            delFid(v?.id);
                            navigate('/chat/friend/');
                        }}
                    />

                    <UserChat.Button
                        lable="发起视频"
                        color="#67c23a"
                        onClick={(v) => startVideo(v)}
                    />
                </UserChat>
            }
        </Container>

    </Suspense>
}


