import { useCallback, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ImageUpload } from 'components';
import { IconCustomColor } from 'components/icon';
import { useHttpClient2, useImage } from 'hooks/http';
import { useLocalStorageState } from 'ahooks';
import { Avatar, Container, XBox } from 'components/flutter';



export const Avatar2 = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [avatar, setAvatar] = useLocalStorageState('saveOneself', { defaultValue: location.state?.avatar_url })
    const { http: httpFiles } = useHttpClient2('/files/img/')
    const { http: apiLogin } = useHttpClient2('/rpc/chat/login/')

    const { src, avatarSrc, loading, url, clearAll } = useImage("/imgs", avatar)


    const uploadFile = useCallback((file) => {
        if (!file) return;
        httpFiles.uploadFiles(file).then((results) => {
            if (!results?.data) return;
            apiLogin.post('PATCH', { avatar_url: results.data })
            setAvatar(results.data)
        });
    }, [httpFiles, apiLogin]);

    return <Suspense fallback={<div>加载中...</div>}>
       
        {/* <button onClick={() => { clearAll() }}>清除所有图片缓存</button>  */}

        <XBox padding={20}>
            <XBox.Segment >
                <IconCustomColor name='chevron-left' onClick={() => { navigate('/chat/self/mylist/') }} />
            </XBox.Segment>

            <XBox.Segment span={3} align='right'>
                <ImageUpload
                    onConfirm={(file) => { uploadFile(file) }}
                    maxSize={2}
                    btnText="上传头像"
                    previewSize="120px"
                />
            </XBox.Segment>
        </XBox>
        <Container padding={10}>
            <Avatar src={avatarSrc} variant='square' size={500} fit='cover' />
        </Container>

    </Suspense>


}

