import { useState } from 'react';
import { useLocalStorageState, useRequest } from 'ahooks';
// import { useHttpClient } from 'hooks/http';
import { useHttpClient2 } from 'hooks/http';
import { Modal, } from 'components';
import { Button, TextField, Row, SizedBox, Center, Divider, Left } from 'components/flutter';
import { useNavigate } from 'react-router-dom';


export const Agent = () => {
     const navigate = useNavigate();
    const [apiBase, setApiBase] = useLocalStorageState('apiBase', { defaultValue: '' })
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState('');
    // const { http } = useHttpClient('/api/chat/ping')
    const { http } = useHttpClient2('/rpc/chat/ping')
    const [isUpdate,setUpdate] = useState(false);

    const { runAsync: ping } = useRequest(() => {
        // http.requestParams('GET').then((results) => {
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





    return <Center>
        <Modal visible={open}>
            <Modal.Title>测试连接</Modal.Title>
            <Modal.Message>{msg}</Modal.Message>
            <Modal.Confirm onClick={() => setOpen(false)}>确定</Modal.Confirm>
        </Modal>
        <h3>测试连接</h3>
        <SizedBox height={10} />
        <Divider/>
        <SizedBox height={20} />
        <Row>
            <TextField
                label='代理'
                hintText='输入代理地址'
                value={apiBase}
                onChanged={(value) => { setApiBase(value);setUpdate(true); }}
            />
        </Row>  
        <SizedBox height={20} />
        <Row>
            <Left>
                {isUpdate?
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
            
            </Left>
        </Row>
        <SizedBox height={150} />
    </Center>
}