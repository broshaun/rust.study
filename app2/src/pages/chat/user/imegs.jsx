import { useState, useCallback } from 'react';
import { Outlet, useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { Row, Image, List, Container, ImageUpload } from 'components';
import { IconCustomColor } from 'components/icon';
import { useHttpClient } from 'hooks';



export const ImageShow = () => {
    const navigate = useNavigate();
    const { http } = useHttpClient('/imgs');
    const { http: httpFiles } = useHttpClient('/files/img/')
    const { setShow } = useOutletContext();


    const uploadFile = useCallback((file) => {
        if (!file) return;
        httpFiles.uploadFiles(file).then((results) => {
            console.log('results', results)
            setShow(p => !p)
            // const { code, data, message } = results;
            // if (code === 200) {
            //     http.requestBodyJson('PUT', { file_name: `/imgs/${data}` }).then((results) => {
            //         console.log(results?.message)
            //     })
            //     setCount(prev => ({ ...prev, total: prev.total + 1, [fileInputId]: 'green' }));
            // } else {
            //     console.log(message)
            //     setCount(prev => ({ ...prev, [fileInputId]: 'red' }));
            // }
        });
    }, [httpFiles]);

    return <div>
        <Row >
            <Row.Item span={1} justify='left' >
                <IconCustomColor name='chevron-left' onClick={() => { setShow(false); navigate('/chat/self/'); }} />
            </Row.Item>
            <Row.Item span={4} />
            <Row.Item span={1} justify='right' >
                <ImageUpload
                    onConfirm={(file) => { uploadFile(file); }}
                    maxSize={2}
                    btnText="上传图片"
                    previewSize="120px"
                />
            </Row.Item>
        </Row>
        <Image src={http.buildUrl('7ffae106f9d5037f61de633b179db2e8.jpg')} />
    </div>


}

