import React, { useState } from "react";
import { useRequest } from 'ahooks';
import { useHttpClient2 } from 'hooks/http';
import { Modal, } from 'components';
import { Button, TextField, Divider, XBox } from 'components/flutter';
import { useNavigate } from 'react-router';
import { useLocalStorage } from 'hooks';


export const Agent = () => {
    const navigate = useNavigate();
    const [apiBase, setApiBase] = useLocalStorage('apiBase', '')
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState('');
    
    const { http } = useHttpClient2('/rpc/chat/ping')
    const [isUpdate, setUpdate] = useState(false);

    const { runAsync: ping } = useRequest(() => {
        http.post('GET').then((results) => {
            console.log('results', results)
            const { code, message, data } = results
            setMsg(data)
            return
        }).catch((err) => {
            console.error(err);
            setMsg(err?.message || String(err) || 'Ping error');
            throw err;
        });
        return 'ok'
    }, { manual: true, refreshDeps: [http, apiBase] })





    return <React.Fragment>
        <Modal visible={open}>
            <Modal.Title>测试连接</Modal.Title>
            <Modal.Message>{msg}</Modal.Message>
            <Modal.Confirm onClick={() => setOpen(false)}>确定</Modal.Confirm>
        </Modal>
        <XBox padding={15}>
            <h3>测试连接</h3>
        </XBox>


        <Divider spacing={20} />

        <XBox padding={5}>
            <TextField
                label='代理'
                hintText='输入代理地址'
                value={apiBase}
                onChanged={(value) => { setApiBase(value); setUpdate(true); }}
            />
        </XBox>

        <XBox justify='right' padding={5}>

            {isUpdate ?
                <Button
                    label='修改'
                    onPressed={() => { navigate('/user/settings/setlist/') }}
                />
                :
                <Button
                    label='测试'
                    onPressed={() => { ping(); setOpen(true); }}
                />
            }


        </XBox>

    </React.Fragment>
}