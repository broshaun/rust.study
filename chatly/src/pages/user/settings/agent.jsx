import { useState } from 'react';
import { useLocalStorageState, useRequest } from 'ahooks';

import { useHttpClient } from 'hooks/http';
import { useNavigate } from 'react-router-dom';
import { Modal, } from 'components';
import { Button, TextField, Row, SizedBox, Center, Divider, Right } from 'components/flutter';


export const Agent = () => {
    const navigate = useNavigate()
    const [apiBase, setApiBase] = useLocalStorageState('apiBase', { defaultValue: '' })
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState('');
    const { http } = useHttpClient('/api/chat/ping')



    const { runAsync: ping } = useRequest(() => {
        http.requestParams('GET').then((results) => {
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

    const [isUpdate, setIsUpdate] = useState(false)



    return <Center>
        <Modal visible={open}>
            <Modal.Title>测试连接</Modal.Title>
            <Modal.Message>{msg}</Modal.Message>
            <Modal.Confirm onClick={() => setOpen(false)}>确定</Modal.Confirm>
        </Modal>
        <h3>测试连接</h3>
        <SizedBox height={10} />
        <Divider indent={40} endIndent={40} color="#eeeeee" />
        <SizedBox height={20} />
        <Row>
            <TextField
                label='代理'
                hintText='输入代理地址'
                value={apiBase}
                onChanged={(value) => { setApiBase(value); }}
            />
        </Row>
        <SizedBox height={20} />
        <Row>
            <Right>
                <Button
                    label='测试'
                    onPressed={() => { ping(); setOpen(true); }}
                />
            </Right>
        </Row>
        <SizedBox height={150} />
    </Center>
}