import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useHttpClient } from 'hooks';
import { Chat, Container, DialogList } from 'components';
import { db, useIndexedDB } from 'hooks/db';


export const Mian = () => {
    const navigate = useNavigate()
    const [dialog, setDialog] = useState([])
    const { http: httpImgs } = useHttpClient('/imgs');
    const { table } = useIndexedDB(db)
    const tbdialog = useMemo(() => table('chat_dialog'), [table])
    const tbmsg = useMemo(() => table('messages'), [table])
    const loadDialog = useCallback(() => {
        tbdialog.find({ 'dialog': 1 }).then((rows) => setDialog(rows || []))
    }, [tbdialog])

    useEffect(() => loadDialog(), [loadDialog]);

    // 打开聊天
    const openMsgWindow = useCallback((select) => {
        if (!select?.id) return;
        tbdialog.replace({ 'id': select.id, 'uid': select.uid, 'signal': 'old', 'dialog': 1 }).then(() => navigate('/chat/dialog/msg/', { state: { 'uid': select?.uid } }))
    }, [tbdialog])

    // 关闭聊天
    const handleClear = useCallback((item) => {
        if (item?.uid) {
            tbmsg.delete({ 'uid': item.uid })
        }
        if (item?.id) {
            tbdialog.replace({ 'id': item.id, 'signal': 'old', 'dialog': 0 }).then(loadDialog)
        }
        navigate('/chat/dialog/')
    }, [tbmsg, tbdialog])


    return <Chat>
        <Chat.Left size={"30%"}>
            <Container verticalScroll={true} >
                <DialogList
                    dialogData={dialog}
                    onSelectDialog={(select) => { openMsgWindow(select) }}
                    onClear={(p) => handleClear(p)}
                    buildAvatarUrl={(name) => httpImgs.buildUrl(name)}
                />
            </Container>
        </Chat.Left>
        <Chat.Right size={"70%"}>
            <Outlet context={{}} />
        </Chat.Right>
    </Chat>



}




