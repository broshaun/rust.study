import React, { useState, useEffect, Suspense } from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import { useWinSize, useHttpClient } from 'hooks';
import { db } from 'hooks/db';
import { useRequest } from 'ahooks';
import { Container, Avatar, Row, Border, Button, Center, Divider, Column, SizedBox, Padding, Heading, Card, Right, Left } from 'components/flutter';
import { InfoTile } from './InfoTile';


export function Detail() {
    const navigate = useNavigate();
    const location = useLocation();
    const friend = location.state?.select;
    const { http: httpImgs } = useHttpClient('/imgs');
    const { http: http2 } = useHttpClient('/api/chat/friend/')
    const { isMobile } = useWinSize()


    console.log('friend', friend)

    // 删除好友
    const { runAsync: delFid } = useRequest((id) => {
        console.log('id', id)
        // http2.requestBodyJson('DELETE', { id }).then((results) => {
        //     if (!results) return;
        //     db.table('friends').get(id).then((row) => {
        //         db.table('message').where('uid').equals(row?.uid).delete()
        //         db.table('friends').delete(id)
        //     })
        // })
    }, { manual: true })


    // 好友备注
    const { runAsync: updRemark } = useRequest((id, remark) => {
        http2.requestBodyJson('PATCH', { id, remark }).then((results) => {
            if (!results) return;
            console.log('results', results)
        })
    }, { manual: true })

    // 打开聊天
    function openMsgWindow(friend) {
        db.table('friends').update(friend?.id, { 'signal': 'old', 'dialog': 1 })
        if (isMobile) {
            navigate('/message/', { state: { 'uid': friend?.uid, 'avatar_url': friend?.avatar_url } })
        } else {
            navigate('/chat/dialog/msg/', { state: { 'uid': friend?.uid, 'avatar_url': friend?.avatar_url } })
        }
    }

    return <Suspense fallback={<div>加载中...</div>}>
        <SizedBox height={100} />

        <Center>
            <Avatar size={75} />
        </Center>

        <Divider fade={true} />
        <Padding value={20}>
            <Column>
                <Heading level={4}>账户信息</Heading>
                <SizedBox height={10} />
                <InfoTile icon="user" label="名称" value={friend?.nikename} />
                <InfoTile icon="email" label="邮箱" value={friend?.email} />
                <InfoTile icon="edit" label="备注" value={friend?.remark} isLast={true} />
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


