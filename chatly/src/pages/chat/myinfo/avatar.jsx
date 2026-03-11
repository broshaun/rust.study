import { useCallback, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Row, Image, Col, Container, ImageUpload } from 'components';
import { IconCustomColor } from 'components/icon';
import { useHttpClient2, useImage } from 'hooks/http';
import { useLocalStorageState } from 'ahooks';




export const Avatar = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [avatar, setAvatar] = useLocalStorageState('saveOneself', { defaultValue: location.state?.avatar_url } )
    const { http: httpFiles } = useHttpClient2('/files/img/')
    const { http: apiLogin } = useHttpClient2('/rpc/chat/login/')
    const { src, loading } = useImage("/imgs", avatar)

    const uploadFile = useCallback((file) => {
        if (!file) return;
        httpFiles.uploadFiles(file).then((results) => {
            if (!results?.data) return;
            apiLogin.post('PATCH', { avatar_url: results.data })
            setAvatar(results.data)
        });
    }, [httpFiles, apiLogin]);

    return <Suspense fallback={<div>加载中...</div>}>
        <Row justify='left'>
            <Col span={1} >
                <IconCustomColor name='chevron-left' onClick={() => { navigate('/chat/self/mylist/') }} />
            </Col>
            <Col span={4} />
            <Col width={200} >
                <ImageUpload
                    onConfirm={(file) => { uploadFile(file) }}
                    maxSize={2}
                    btnText="上传头像"
                    previewSize="120px"
                />
            </Col>
        </Row>
        {!loading &&
            <Container>
                <Image src={src} />
            </Container>
        }
    </Suspense>


}

