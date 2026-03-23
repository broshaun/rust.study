import { useCallback, Suspense, useMemo } from "react";
import { useNavigate, useLocation } from 'react-router';
import { ImageUpload } from 'components';
import { useHttpClient2 } from 'hooks/http';
import { useLocalStorage } from '@mantine/hooks';
import { Icon, SafeAvatar, SizedBox } from 'components/flutter';
import { Grid, Group } from "@mantine/core";


/**
 * Avatar2 - 用户头像设置与大图预览页面
 */
export const Avatar2 = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // 持久化存储当前的头像路径
    const [avatar, setAvatar] = useLocalStorage({
        key: 'myAvatar',
        defaultValue: location.state?.avatar_url
    });

    const { http: httpFiles } = useHttpClient2('/files/img/');
    const { http: apiLogin } = useHttpClient2('/rpc/chat/login/');
    const { endpoint } = useHttpClient2('/imgs/')

    // 拼接完整的 API 地址
    const avatarSrc = useMemo(() => {
        if (!avatar) return "";
        return endpoint.join(avatar)
    }, [endpoint, avatar]);


    /**
     * 上传并更新头像
     */
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


            <Grid p={10}>
                <Grid.Col span={4} >
                    <Icon
                        name='chevron-left'
                        onClick={() => navigate('/chat/self/mylist/')}
                    />
                </Grid.Col>
                <Grid.Col span={4} />
                <Grid.Col span={4}>
                    <ImageUpload
                        onConfirm={(file) => uploadFile(file)}
                        maxSize={2}
                        btnText="更换头像"
                        previewSize="120px"
                    />
                </Grid.Col>
            </Grid>


            <SizedBox height={50}/>
            <div style={{ padding: 10, display: 'flex', justifyContent: 'center' }}>
                <SafeAvatar
                    url={avatarSrc}
                    size={320}
                    radius={12}
                />
            </div>

            <Group p={20} justify="center">
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', opacity: 0.6 }}>
                    点击上方按钮上传新头像，支持 JPG/PNG 格式
                </span>
            </Group>
        </Suspense>
    );
};

export default Avatar2;