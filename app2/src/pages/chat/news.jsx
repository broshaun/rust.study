
import React, { useEffect, useState, useRef, useTransition, useReducer, Suspense } from 'react';
import { SimpleTable, SingleRadio, InputText, Divider, Container } from 'components';
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { useHttpClient, useDateTime } from 'hooks';
import { useRequest, useLocalStorageState } from 'ahooks';
import { MsgList } from 'components/apps';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { isTauri } from "@tauri-apps/api/core";

export const News = () => {
    const navigate = useNavigate();
    const [news, setNews] = useLocalStorageState('chat-news', { defaultValue: [] });
    const [isPending, startTransition] = useTransition()
    const { http } = useHttpClient('/api/chat/friend/')




    function openMsgWindow(select) {
        if (!select?.id)return;
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

        } else {
            window.open(`/#/msg?id=${select?.id}`, "_blank")
        }
    }


    return <Suspense fallback={<div>加载中...</div>}>
        {news &&
            <Container verticalScroll={true} horizontalScroll={true}>
                <MsgList msgsData={news} onSelectMsg={(select) => { openMsgWindow(select) }} />
            </Container>
        }
    </Suspense>
}

