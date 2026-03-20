import { useCallback, Suspense, useMemo } from "react";
import { useNavigate, useLocation } from 'react-router';
import { ImageUpload } from 'components';
import { useHttpClient2 } from 'hooks/http';
import { useLocalStorage } from '@mantine/hooks';
import { Container, XBox, Icon, SafeAvatar } from 'components/flutter'; // ✅ 引入 SafeAvatar

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

            // 1. 同步到服务器
            apiLogin.post('PATCH', { avatar_url: results.data });

            // 2. 更新本地状态（触发 SafeAvatar 重新加载并缓存新图）
            setAvatar(results.data);
        });
    }, [httpFiles, apiLogin, setAvatar]);

    return (
        <Suspense fallback={<div>加载中...</div>}>
            {/* 顶部导航与上传按钮 */}
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
                        btnText="更换头像"
                        previewSize="120px"
                    />
                </XBox.Segment>
            </XBox>

            {/* 头像大图预览区 */}
            <Container padding={10}>
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <SafeAvatar
                        url={avatarSrc}
                        size={320}
                        radius={12}
                    />
                </div>
            </Container>

            {/* 提示文字 */}
            <XBox padding={20} align="center">
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', opacity: 0.6 }}>
                    点击上方按钮上传新头像，支持 JPG/PNG 格式
                </span>
            </XBox>
        </Suspense>
    );
};

export default Avatar2;