import React, { useState, Suspense } from "react";
import { useNavigate } from 'react-router';
import { Modal } from 'components';
import { deleteUserDB } from 'hooks/db';
import { clearAllImageCache } from "hooks/http";



export const ClearLogs = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(true);



    const clear = async (click) => {
        await clearAllImageCache();
        if (click) {
            deleteUserDB().then(console.log('记录清空'))
            navigate('/chat/self/mylist/');
        } else {
            navigate('/chat/self/mylist/')
        }
        setOpen(false)

    }


    return <Suspense>
        <Modal visible={open}>
            <Modal.Title>聊天记录</Modal.Title>
            <Modal.Message>确定清空所有聊天记录</Modal.Message>
            <Modal.Confirm onClick={() => { clear(true) }}>确定</Modal.Confirm>
            <Modal.Cancel onClick={() => { clear(false) }}>取消</Modal.Cancel>
        </Modal>
    </Suspense>
}

