import React, { Suspense, useState,useEffect } from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import { useWinSize } from 'hooks';
import { useHttpClient2 } from 'hooks/http';
import { db } from 'hooks/db';
import { useRequest } from 'ahooks';
import { Avatar, Row, Button, Center, Divider, Column, SizedBox, Padding, Heading, Right, Left } from 'components/flutter';
import { InfoTile } from 'components/chat';


export function Detail() {
    const navigate = useNavigate();
    const location = useLocation();

    const select = location.state?.select;
    const [friend, setFriend] = useState();

    useEffect(() => {
        setFriend(select);
    }, [select]);


    const { endpoint } = useHttpClient2('/imgs');
    const { http: http2 } = useHttpClient2('/rpc/chat/friend/')
    const { isMobile } = useWinSize()


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
            console.log('results++', results)
        })
    }, { manual: true })

    // 打开聊天
    function openMsgWindow(friend) {
        if (!friend?.id) return;
        const displayName = friend.remark ?? friend.nikename ?? friend.email ?? friend.id;
        db.table('friends').update(friend?.id, { 'signal': 'old', 'dialog': 1 })
        if (isMobile) {
            navigate('/message/', { state: { 'uid': friend?.uid, 'avatar_url': friend?.avatar_url, displayName } })
        } else {
            navigate('/chat/dialog/msg/', { state: { 'uid': friend?.uid, 'avatar_url': friend?.avatar_url, displayName } })
        }
    }


    console.log(`++++++ ${endpoint}/${friend?.avatar_url}`)

    return <Suspense fallback={<div>加载中...</div>}>
        <SizedBox height={100} />

        <Center>
            <Avatar size={75} src={`${endpoint}/${friend?.avatar_url}`} fit="cover" />
        </Center>

        <Divider fade={true} />
        <Padding value={20}>
            <Column>
                <Heading level={4}>账户信息</Heading>
                <SizedBox height={10} />
                <InfoTile icon="user" label="名称" value={friend?.nikename} />
                <InfoTile icon="email" label="邮箱" value={friend?.email} />
                <InfoTile icon="edit" label="备注" value={friend?.remark} onConfirm={(remark) => { setFriend(p => ({ ...p, remark })); updRemark(friend?.id, remark); }} />
                <Divider />
                <SizedBox height={10} />
                <Row>
                    <Row.Col>
                        <Left>
                            <Button
                                label="发起聊天"
                                onPressed={() => openMsgWindow(friend)}
                                style={{
                                    background: 'var(--accent-color)',
                                    color: '#fff',
                                    border: 'none'
                                }}
                            />
                        </Left>
                    </Row.Col>

                    <Row.Col>
                        <Right>
                            <Button
                                label="删除好友"
                                onPressed={() => {
                                    delFid(friend?.id);
                                    isMobile ? navigate('/chat/mobile/friend/') : navigate('/chat/friend/');
                                }}
                                style={{
                                    color: '#fff',
                                    background: '#ff4d4f',
                                    border: 'none'
                                }}
                            />
                        </Right>
                    </Row.Col>

                </Row>
            </Column>

        </Padding>










    </Suspense>
}


