import { useState, useCallback, useTransition, Suspense } from 'react';
import { Outlet, useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { Row, Image, Col, Container, ImageUpload } from 'components';
import { IconCustomColor } from 'components/icon';
import { useHttpClient } from 'hooks';
import { useRequest } from 'ahooks';



export const Avatar = () => {
    const navigate = useNavigate();
    const { http } = useHttpClient('/imgs');
    const location = useLocation();
    const { http: httpFiles } = useHttpClient('/files/img/')
    const { http: apiLogin } = useHttpClient('/api/chat/login/');
    const { setShow } = useOutletContext();


    const uploadFile = useCallback((file) => {
        if (!file) return;
        httpFiles.uploadFiles(file).then((results) => {
            console.log('results', results)
            setShow(p => !p)
            if (!results?.data) return;
            apiLogin.requestBodyJson('PATCH', { avatar_url: results.data })
        });
    }, [httpFiles, apiLogin]);



    return <Suspense fallback={<div>加载中...</div>}>
        <Row justify='left'>
            <Col span={1} >
                <IconCustomColor name='chevron-left' onClick={() => { setShow(false); navigate('/chat/self/'); }} />
            </Col>
            <Col span={5} />
            <Col span={1} >
                <ImageUpload
                    onConfirm={(file) => { uploadFile(file); }}
                    maxSize={2}
                    btnText="上传头像"
                    previewSize="120px"
                />
            </Col>
        </Row>
        {location.state && <Image src={http.buildUrl(location.state?.avatar_url)} />}
    </Suspense>


}

