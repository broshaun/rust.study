import React, { useState } from "react";
import { useHttpClient } from 'utils';
import { Modal } from 'components';
import { useNavigate } from 'react-router';
import { useLocalStorage } from '@mantine/hooks';
import { useMutation } from '@tanstack/react-query';
import { Button, Divider, Box, Group } from "@mantine/core";
import { TextField } from "./UI/TextField";

export const Agent = () => {
    const navigate = useNavigate();
    const [apiBase, setApiBase] = useLocalStorage({ key: 'apiBase' });
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState('');

    const { http } = useHttpClient('/rpc/chat/ping');
    const [isUpdate, setUpdate] = useState(false);

    const { mutateAsync: ping } = useMutation({
        mutationFn: async () => {
            const results = await http.requestBodyJson("GET");
            if (!results) throw new Error("Ping失败");
            const { code, message } = results;
            if (code !== 200) throw new Error(message);
            return results;
        },
        onSuccess: (results) => {
            const { data } = results;
            setMsg(data);
        },
        onError: (error) => {
            setMsg(error?.message || String(error) || 'Ping error');
        },
    });

    return (
        <React.Fragment>
            {/* 提示框 */}
            <Modal visible={open} onClose={() => setOpen(false)}>
                <Modal.Title>测试连接</Modal.Title>
                <Modal.Message>{msg}</Modal.Message>
                <Modal.Confirm onClick={() => setOpen(false)}>确定</Modal.Confirm>
            </Modal>

            {/* 标题区：使用 Box 替代 XBox，p={15} 对应 padding={15} */}
            <Box p={15}>
                <h3 style={{ margin: 0 }}>测试连接</h3>
            </Box>

            {/* 渐变淡化分割线：使用 mb 和 mt 替代原来的 spacing={20} 的上下间距 */}
            <Divider 
                mt={20}
                mb={20}
                styles={{
                    root: {
                        border: 'none',
                        height: '1px',
                        backgroundImage: 'linear-gradient(to right, transparent, light-dark(rgba(0,0,0,0.12), rgba(255,255,255,0.15)) 50%, transparent)'
                    }
                }} 
            />

            {/* 输入框区：使用 Box 替代 XBox */}
            <Box p={5}>
                <TextField
                    maxWidth={500}
                    label='代理'
                    hintText='输入代理地址'
                    value={apiBase}
                    onChanged={(value) => { setApiBase(value); setUpdate(true); }}
                />
            </Box>

            {/* 按钮操作区：使用 Group 替代 XBox 容器，利用 justify="flex-end" 实现靠右对齐 */}
            <Group justify="flex-end" p={5}>
                {isUpdate ? (
                    <Button onClick={() => { navigate('/user/settings/setlist/') }}>修改</Button>
                ) : (
                    <Button onClick={() => { ping(); setOpen(true); }}>测试</Button>
                )}
            </Group>
        </React.Fragment>
    );
};