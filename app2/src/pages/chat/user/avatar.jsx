import { useState, useCallback, useTransition, Suspense, useEffect } from 'react';
import { Outlet, useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { Row, Image, Col, Container, ImageUpload } from 'components';
import { IconCustomColor } from 'components/icon';
import { useHttpClient } from 'hooks';
import { useRequest } from 'ahooks';
import { convertFileSrc } from "@tauri-apps/api/core";



export const Avatar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [avatar, setAvatar] = useState(location.state?.avatar_url)
    const { http } = useHttpClient('/imgs');
    const { http: httpFiles } = useHttpClient('/files/img/')
    const { http: apiLogin } = useHttpClient('/api/chat/login/');


    const uploadFile = useCallback((file) => {
        if (!file) return;
        httpFiles.uploadFiles(file).then((results) => {
            if (!results?.data) return;
            apiLogin.requestBodyJson('PATCH', { avatar_url: results.data })
            setAvatar(results.data)
        });
    }, [httpFiles, apiLogin]);



    const [localSrc, setLocalSrc] = useState("");
    useEffect(() => {
        if (!avatar) return;

        httpFiles
            .downFiles(avatar)
            .then((path) => {
                console.log("下载的文件路径:", path);
                setLocalSrc(convertFileSrc(path)); // ✅ 直接用本地文件展示
            })
            .catch((e) => {
                console.error("downFiles failed:", e);
            });
    }, [avatar, httpFiles]);

    return <Suspense fallback={<div>加载中...</div>}>
        <Row justify='left'>
            <Col span={1} >
                <IconCustomColor name='chevron-left' onClick={() => { navigate('/chat/self/mylist/'); }} />
            </Col>
            <Col span={4} />
            <Col width={200} >
                <ImageUpload
                    onConfirm={(file) => { uploadFile(file); }}
                    maxSize={2}
                    btnText="上传头像"
                    previewSize="120px"
                />
            </Col>
        </Row>
        {avatar && <Image src={localSrc || http.buildUrl(avatar)} />}

    </Suspense>


}



// const { http } = useHttpClient('/files/img/')
// http.downFiles(file).then((path)=>{
//     console.log('下载的文件地址')
// })