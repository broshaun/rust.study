import { useCallback, Suspense, useMemo } from "react";
import { useNavigate, useLocation } from 'react-router';
import { ImageUpload } from 'components';
import { useHttpClient2, useApiBase } from 'hooks/http';
import { useLocalStorageState } from 'ahooks';
import { Avatar, Container, XBox, Icon } from 'components/flutter';

export const Avatar2 = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const { apiBase } = useApiBase();

    const [avatar, setAvatar] = useLocalStorageState('myAvatar', { defaultValue: location.state?.avatar_url });

    const { http: httpFiles } = useHttpClient2('/files/img/');
    const { http: apiLogin } = useHttpClient2('/rpc/chat/login/');

    const avatarSrc = useMemo(() => {
        if (!avatar) return "";
        return `${String(apiBase || "").replace(/\/+$/, "")}/imgs/${String(avatar).replace(/^\/+/, "")}`;
    }, [apiBase, avatar]);

    const uploadFile = useCallback((file) => {
        if (!file) return;

        httpFiles.uploadFiles(file).then((results) => {

            if (!results?.data) return;

            apiLogin.post('PATCH', { avatar_url: results.data });

            setAvatar(results.data);

        });

    }, [httpFiles, apiLogin, setAvatar]);

    return (
        <Suspense fallback={<div>加载中...</div>}>

            <XBox padding={20}>

                <XBox.Segment>
                    <Icon
                        name='chevron-left'
                        onClick={() => navigate('/chat/self/mylist/')}
                    />
                </XBox.Segment>

                <XBox.Segment span={3} align='right'>
                    <ImageUpload
                        onConfirm={(file) => uploadFile(file)}
                        maxSize={2}
                        btnText="上传头像"
                        previewSize="120px"
                    />
                </XBox.Segment>

            </XBox>

            <Container padding={10}>
                <Avatar
                    src={avatarSrc}
                    variant='square'
                    size={500}
                    fit='cover'
                />
            </Container>

        </Suspense>
    );
};