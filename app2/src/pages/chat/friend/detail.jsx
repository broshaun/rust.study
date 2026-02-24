import React, { useState, useEffect, Suspense, useMemo } from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import { useHttpClient } from 'hooks';
import { UserChat } from 'components/chat';
import { Container } from 'components';
import { useRequest } from 'ahooks';
import { db } from 'hooks/db';
import { useWinWidth } from 'hooks';


export function Detail() {
    const navigate = useNavigate();
    const location = useLocation();
    const select = location.state?.select;
    const [friend, setFriend] = useState();
    const { http: httpImgs } = useHttpClient('/imgs');
    const { http: http2 } = useHttpClient('/api/chat/friend/')
    const { isMobile } = useWinWidth()


    useEffect(() => {
        setFriend(select);
    }, [select]);

    // 删除好友
    const { runAsync: delFid } = useRequest((id) => {
        http2.requestBodyJson('DELETE', { id }).then((results) => {
            if (!results) return;
            db.table('friends').get(id).then((row) => {
                db.table('message').where('uid').equals(row?.uid).delete()
                db.table('friends').delete(id)
            })
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
        db.table('friends').update(select?.id, { 'signal': 'old', 'dialog': 1 })
        if (isMobile) {
            navigate('/chat/mobile/msg/', { state: { 'uid': select?.uid, 'avatar_url': select?.avatar_url } })
        } else {
            navigate('/chat/dialog/msg/', { state: { 'uid': select?.uid, 'avatar_url': select?.avatar_url } })
        }
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
                            isMobile ? navigate('/chat/mobile/friend/') : navigate('/chat/friend/');
                        }}
                    />

                    {/* <UserChat.Button
                        lable="发起视频"
                        color="#67c23a"
                        onClick={(v) => startVideo(v)}
                    /> */}
                </UserChat>
            }
        </Container>

    </Suspense>
}


