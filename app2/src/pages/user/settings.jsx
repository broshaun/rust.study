import { useState } from 'react';
import { useLocalStorageState, useRequest } from 'ahooks';
import { InputText2, Container, Modal, Button, Row } from 'components';
import { useHttpClient } from 'hooks';
import { useNavigate } from 'react-router-dom';


export const Settings = () => {
    const navigate = useNavigate()
    const [apiBase, setApiBase] = useLocalStorageState('apiBase', { defaultValue: '' })
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState('');

    const { http } = useHttpClient('/api/chat/ping')
    const { data, runAsync: ping } = useRequest(() => {
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
    }, { manual: true })

    const [isUpdate, setIsUpdate] = useState(false)



    return <Container alignItems='center'>
        <Modal visible={open}>
            <Modal.Title>测试连接</Modal.Title>
            <Modal.Message>{msg}</Modal.Message>
            <Modal.Confirm onClick={() => setOpen(false)}>确定</Modal.Confirm>
        </Modal>
        <br />
        <InputText2 defaultValue={apiBase} onChangeValue={(value) => { setApiBase(value);setIsUpdate(true); }}>
            <InputText2.Left label='地址'></InputText2.Left>
        </InputText2>
        <Row gap={60} align="center" justify="center">
            {isUpdate
                ? <Button position="center" size={{ width: '25%', height: '42px' }} onClick={() => { navigate('/user/') }}>确定</Button>
                : <Button position="center" size={{ width: '25%', height: '42px' }} onClick={() => { ping(); setOpen(true); }}>ping</Button>

            }
        </Row>
    </Container>
}