import React, { useState } from "react"
import { useMutation } from '@tanstack/react-query'
import { Modal } from "components";
import { useHttpClient2 } from 'hooks/http';
import { Button, TextField, Divider, XBox } from 'components/flutter';


export function Register() {
    const [account, setAccount] = useState('')
    const [password, setPassword] = useState("")
    const { http } = useHttpClient2('/rpc/chat/register/')
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState('');


    const { mutateAsync: runLogin } = useMutation(
        {
            mutationFn: async ({ account, password }) => {
                if (!account || !password) throw new Error("请输入账号密码 ...");
                const results = await http.requestBodyJson("PUT", { email: account, pass_word: password });
                if (!results) throw new Error("注册失败");
                const { code, message } = results;
                if (code === 200) {
                    setMsg(message)
                    setOpen(true)
                    setAccount('')
                    setPassword('')
                } else {
                    setMsg(message)
                    setOpen(true)
                    setAccount('')
                    setPassword('')
                }
                return results;
            },
            onError: (error) => {
                setMsg(error?.message || "注册失败");
                setOpen(true);
            }
        }
    );




    return <React.Fragment>
        <Modal visible={open}>
            <Modal.Title>注册提示</Modal.Title>
            <Modal.Message>{msg}</Modal.Message>
            <Modal.Confirm onClick={() => setOpen(false)}>确定</Modal.Confirm>
        </Modal>


        <XBox padding={20}>
            <h3>注册账号</h3>
        </XBox>

        <Divider fade={true} thickness={1} opacity={0.3} />

        <XBox padding={5}>
            <TextField
                label="账号"
                maxWidth={250}
                hintText="请输入账号"
                value={account}
                onChanged={(value) => setAccount(value)}
            />

        </XBox>

        <XBox padding={5}>
            <TextField
                label="密码"
                maxWidth={250}
                hintText="请输入密码"
                obscureText={true}
                value={password}
                onChanged={(value) => setPassword(value)}
            />
        </XBox>

        <XBox padding={10}>
            <Button label='注册' width={250}
                onPressed={() => { runLogin({account, password}) }}
            />
        </XBox>

    </React.Fragment >
}



