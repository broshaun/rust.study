import { useCallback, Suspense, useMemo, useEffect } from "react";
import { useLocation } from 'react-router';

import { useHttpClient, useImgApiBase } from 'utils';
import { useLocalStorage } from '@mantine/hooks';
import { SafeAvatar, SizedBox } from 'components';
import { Grid, Group, Center } from "@mantine/core";
import { currentAppBar } from "utils";
import { ImageUpload } from "./UI/ImageUpload";

/**
 * Avatar2 - 用户头像设置与大图预览页面
 */
export const Avatar2 = () => {
    const location = useLocation();

    // 持久化存储当前的头像路径
    const [currentUser, setCurrentUser] = useLocalStorage({ key: 'current_user'});

    const { http: httpFiles } = useHttpClient('/files/avatar/');
    const { http: apiLogin } = useHttpClient('/rpc/chat/login/');
    const { joinPath } = useImgApiBase('avatar')

    // 拼接完整的 API 地址
    const avatarSrc = useMemo(() => {
        if (!currentUser?.avatar_url) return "";
        return joinPath(currentUser.avatar_url)
    }, [currentUser?.avatar_url]);

    /**
     * 上传并更新头像
     */
    const uploadFile = useCallback((file) => {
        if (!file) return;
        httpFiles.uploadFiles(file).then((results) => {
            if (!results?.data) return;
            apiLogin.post('PATCH', { avatar_url: results.data });
            setCurrentUser(p=>({
                ...p,
                avatar_url:results.data
            }));
        });
    }, [httpFiles, apiLogin]);


    const setLeftPath = currentAppBar((state) => state.setLeftPath);
    const setTitle = currentAppBar((state) => state.setTitle);
    useEffect(() => {
        setLeftPath('/mobile/chat/self/')
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