import { useMemo, useState } from 'react';
import { useLocalStorageState, useRequest } from 'ahooks';
import { InputText2, Container, Modal, Button, Row, IconCustomColor, Col } from 'components';
import { useHttpClient } from 'hooks/http';
import { useNavigate } from 'react-router-dom';


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



    return <Container alignItems='center'>
        <Modal visible={open}>
            <Modal.Title>测试连接</Modal.Title>
            <Modal.Message>{msg}</Modal.Message>
            <Modal.Confirm onClick={() => setOpen(false)}>确定</Modal.Confirm>
        </Modal>
        <br />
        <Row>
            <Col span={1} >
                <IconCustomColor name='chevron-left' onClick={() => { navigate('/user/settings/setlist/') }} />
            </Col>
            <Col span={5} />
        </Row>
        <Row gap={20} align="center" justify="center">
            <InputText2 defaultValue={apiBase} onChangeValue={(value) => { setApiBase(value); setIsUpdate(true); }}>
                <InputText2.Left label='地址' />
            </InputText2>
            {isUpdate
                ? <Button position="center" size={{ width: '25%', height: '42px' }} onClick={() => { navigate('/user/settings/setlist/') }}>确定</Button>
                : <Button position="center" size={{ width: '25%', height: '42px' }} onClick={() => { ping(); setOpen(true); }}>ping</Button>
            }
        </Row>
    </Container>
}