import React, { useEffect, useState, useRef, useTransition, useReducer, Suspense } from 'react';
import { SimpleTable, SingleRadio, InputText, Divider, Container } from 'components';
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { useHttpClient, useNewWindow } from 'hooks';
import { useRequest } from 'ahooks';
import { FriendList } from 'components/apps';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { isTauri } from "@tauri-apps/api/core";

export const List = () => {
    const navigate = useNavigate();
    const [apiData, setApiData] = useState([]);
    const [isPending, startTransition] = useTransition()
    const { http } = useHttpClient('/api/chat/friend/')

    const { openWindow } = useNewWindow();


    const { loading } = useRequest(() => {
        http.requestBodyJson('POST', { "skip": 0, "limit": 10 }).then((results) => {
            console.log('results', results)
            if (!results) return;
            const { code, message, data } = results
            code === 200 && startTransition(() => {
                setApiData(data)
            })
        })

    }, { refreshDeps: [], })



    function openMsgWindow(select) {
        console.log("打开新的窗口", select?.id);

        if (isTauri()) {
            const win = new WebviewWindow(`msg-${select?.id}`, {
                url: `/#/msg?id=${select?.id}`,   // 注意不要多一个 /
                width: 701,               // 固定宽度
                height: 668,              // 固定高度
                resizable: false,         // ❗ 禁止调整大小（核心）
                maximizable: false,       // 禁止最大化
                minimizable: true,        // 可选：允许最小化
                center: true,             // 居中打开
                title: `与${select?.remark}的聊天`,
            });

            win.once("tauri://created", () => {
                console.log("窗口创建成功");
            });

            win.once("tauri://error", (e) => {
                console.error("窗口创建失败:", e);
            });
        } else {
            window.open(`/#/msg?id=${select?.id}`, "_blank")
        }



    }

    return <Suspense fallback={<div>加载中...</div>}>
        {apiData &&
            <Container verticalScroll={true} horizontalScroll={true}>
                <FriendList friendsData={apiData?.detail} onSelectFriend={(select) => { openMsgWindow(select) }} />
            </Container>
        }
    </Suspense>
}