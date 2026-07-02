import React, { useEffect, Suspense } from "react";
import { useNavigate, useOutletContext } from 'react-router';
import { deleteUserDB, currentModal } from 'utils';
import { clearAllImageCache } from "utils";


export const ClearLogs = () => {
    const { uid } = useOutletContext();
    const navigate = useNavigate();
    const clear = async (click) => {
        await clearAllImageCache();
        // if (click) {
        //     await deleteUserDB(uid)
        // }
        await navigate('/mobile/chat/self/')
    }
    const { open } = currentModal();
    useEffect(() => {
        open({
            title: "聊天记录",
            message: "确定清空所有聊天记录?",
            onConfirm: async () => {
                await clear(true)
            },
            onCancel: async () => {
                await clear(false)
            }
        });
    }, [open, navigate]);

    return <Suspense fallback={<div>加载中...</div>} />
}

