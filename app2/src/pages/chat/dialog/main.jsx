import React, { useEffect, useState, useMemo, useTransition, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useHttpClient } from 'hooks';
import { useRequest, useLocalStorageState } from 'ahooks';
import { Chat, Container, DialogList } from 'components';
import { db, useIndexedDB } from 'hooks/db';


export const Mian = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const [dialog, setDialog] = useState()
    const [isPending, startTransition] = useTransition()
    const { http: httpImgs } = useHttpClient('/imgs');
    const { http: httpMsg } = useHttpClient('/api/chat/msg/private/')
    const { table } = useIndexedDB(db);
    const tbmsg = useMemo(() => table('messages'), [table]);
    const tbdialog = useMemo(() => table('chat_dialog'), [table]);

    const loadDialog = useCallback(() => {
        return tbdialog.find({ dialog: 1 }).then((rows) => {
            setDialog(rows || []);
            return rows;
        });
    }, [tbdialog]);

    useEffect(() => {
        loadDialog();
    }, [loadDialog]);


    useRequest(() => {
        httpMsg.requestParams('GET').then((results) => {
            if (!results) return;
            const { code, data } = results
            if (data && code === 200) {
                tbmsg.put({ ...data, signal: 'receive' })
                tbdialog.replace({ id: data?.uid, signal: 'news', dialog: 1 })
                loadDialog()

            }

        })
        return 'ok'
    }, { pollingInterval: 1000, pollingWhenHidden: false })




    const openMsgWindow = useCallback((select) => {
        console.log('select+++++', select)
        if (!select?.id) return;
        tbdialog.replace({ id: select.id, signal: 'old', dialog: 1 })
        navigate('/chat/dialog/msg/', { state: { uid: select?.id } })
    }, [tbdialog, loadDialog])

    const handleClear = useCallback((item) => {
        console.log('item+++++', item)
        if (!item?.id) return;


        tbmsg.delete({ uid: item.id })
        tbdialog.replace({ id: item.id, signal: 'old', dialog: 0 })
        navigate('/chat/dialog/')
    }, [tbmsg, tbdialog])


    console.log('dialog', dialog)

    return <Chat>
        <Chat.Left size={"20%"}>
            <Container verticalScroll={true} >
                <DialogList
                    dialogsData={dialog}
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





// dialog = [
//     {
//         "id": "6993f464c2d06374dcfb9218",
//         "avatar_url": "ea4086dd1ec9a9baeff9af843dba75a0.jpg",
//         "email": "3818@qq.com",
//         "remark": "好人1号",
//         "nikename": "好人1",
//         "signal": "old",
//         "dialog": 1,
//         "timestamp": 1771584345119
//     },
//     {
//         "id": "6994347df25448dbaa5b5a3d",
//         "avatar_url": null,
//         "email": "1314@qq.com",
//         "remark": null,
//         "nikename": null,
//         "signal": "old",
//         "dialog": 1,
//         "timestamp": 1771584345119
//     }
// ]