import React, { useState, useEffect, Suspense, useTransition } from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import { useHttpClient } from 'hooks';
import { ChatTransitionPage, UserChat } from 'components/chat';
import { Container } from 'components';
import { useRequest, useLocalStorageState } from 'ahooks';




export function Detail() {
    const navigate = useNavigate();
    const location = useLocation();
    const [apiData, setApiData] = useState();
    const [isPending, startTransition] = useTransition()
    const [dialog, setDialog] = useLocalStorageState('chat-dialog', { defaultValue: {} });
    const { http: httpImgs } = useHttpClient('/imgs');
    const { http: http2 } = useHttpClient('/api/chat/friend/')



    useEffect(() => {
        if (!location.state?.select) return;
        setApiData(location.state.select)

    }, [location.state])



    const { runAsync: delFid } = useRequest((id) => {
        http2.requestBodyJson('DELETE', { id }).then((results) => {
            if (!results) return;
            console.log('results', results)
        })
    }, { manual: true })



    const { runAsync: updRemark } = useRequest((id, remark) => {
        http2.requestBodyJson('PATCH', { id, remark }).then((results) => {
            if (!results) return;
            console.log('results', results)
        })
    }, { manual: true })

    function openMsgWindow(select) {
        setDialog(p => ({ ...p, [select.friend_id]: select }))
        navigate('/chat/dialog/msg/', { state: { select } })
    }


    return <Suspense fallback={<div>加载中...</div>}>
        <Container alignItems='center'>
            <br />
            {apiData &&

                <UserChat friendData={apiData}>
                    <UserChat.Avatar avatarUrl={httpImgs.buildUrl(apiData?.avatar_url)} />
                    <UserChat.Text lable='名称' >{apiData?.nikename}</UserChat.Text>
                    <UserChat.Text lable='邮箱' >{apiData?.email}</UserChat.Text>
                    <UserChat.Text lable='备注' onConfirm={(remark) => { setApiData(p => ({ ...p, remark })); updRemark(apiData?.id, remark); }}>{apiData?.remark}
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


