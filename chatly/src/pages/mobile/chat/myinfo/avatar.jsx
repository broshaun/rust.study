import { useCallback, Suspense, useEffect, useState } from "react";
import { createHttpClient, } from 'utils';
import { SafeAvatar } from 'components';
import { Grid, Group, Center } from "@mantine/core";
import { currentAppBar } from "utils";
import { ImageUpload } from "./ui/ImageUpload";
import { loginCache } from "cache/loginCache";
import { useLocalStorage } from '@mantine/hooks';

/**
 * 上传并更新头像
 */
export const Avatar2 = () => {
    const [userId] = useLocalStorage({ key: 'current_account' });

    const [currentUser, setUser] = useState({})
    useEffect(() => {
        if (!userId) return;
        let isMounted = true;
        loginCache.fetch(userId).catch(() => { });
        const unsubscribe = loginCache.subscribe((next) => {
            if (!isMounted) return;
            const isObject = next?.data && typeof next.data === 'object';
            const newData = isObject ? next.data : {};
            setUser(newData);
        });
        return () => {
            isMounted = false;
            unsubscribe?.();
        }
    }, [userId]);

    const { http: httpFiles } = createHttpClient('/files/avatar/');
    const { http: apiLogin } = createHttpClient('/rpc/chat/login/');

    const uploadFile = useCallback(async (file) => {
        if (!file) return;
        const results = await httpFiles.uploadFiles(file);
        if (!results?.data) return;
        await apiLogin.post('update', { avatar_url: results.data });
        await loginCache.refresh()
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


            <Center mt={10}>
                <SafeAvatar
                    url={currentUser?.avatar_url}
                    size={320}
                    radius={12}
                    version={currentUser?.updated_at}
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