import { useCallback, Suspense, useMemo, useEffect } from "react";
import { useLocation } from 'react-router';
import { ImageUpload, useAppBar } from 'components';
import { useHttpClient2, useImgApiBase } from 'hooks/http';
import { useLocalStorage } from '@mantine/hooks';
import { SafeAvatar, SizedBox } from 'components/flutter';
import { Grid, Group, Center } from "@mantine/core";


/**
 * Avatar2 - 用户头像设置与大图预览页面
 */
export const Avatar2 = () => {
    const location = useLocation();

    // 持久化存储当前的头像路径
    const [avatar, setAvatar] = useLocalStorage({ key: 'myAvatar', defaultValue: location.state?.avatar_url });
    const { http: httpFiles } = useHttpClient2('/files/avatar/');
    const { http: apiLogin } = useHttpClient2('/rpc/chat/login/');
    const { joinPath } = useImgApiBase('avatar')

    // 拼接完整的 API 地址
    const avatarSrc = useMemo(() => {
        if (!avatar) return "";
        return joinPath(avatar)
    }, [avatar]);

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


    const setLeftPath = useAppBar((state) => state.setLeftPath);
    const setTitle = useAppBar((state) => state.setTitle);
    useEffect(() => {
        setLeftPath('/chat/self/mylist/')
        setTitle('上传头像');
    }, [])

    return (
        <Suspense fallback={<div>加载中...</div>}>
            <Grid p={25}>
                <Grid.Col span={8} />
                <Grid.Col span={4}>
                    <ImageUpload
                        onConfirm={(file) => uploadFile(file)}
                        maxSize={2}
                        btnText="更换头像"
                        previewSize="120px"
                    />
                </Grid.Col>
            </Grid>


            <SizedBox height={10} />
            <Center>
                <SafeAvatar
                    url={avatarSrc}
                    size={320}
                    radius={12}
                    autoUpdate
                />
            </Center>
            <Group p={20} justify="center">
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', opacity: 0.6 }}>
                    点击上方按钮上传新头像，支持 JPG/PNG 格式
                </span>
            </Group>
        </Suspense>
    );
};

export default Avatar2;