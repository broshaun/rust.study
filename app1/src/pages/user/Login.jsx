import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";

import { useWinSize, useToken,useStore ,useImage, useHttpClient2} from "hooks";

// import { Button, TextField, Divider, XBox, Avatar,Modal } from "@/components/flutter";

export function Login() {
  const navigate = useNavigate();

  const [account, setAccount] = useStore("savedAccount", "");
  const [avatar, setAvatar] = useStore("myAvatar", "");
  const [password, setPassword] = createSignal("");
  const [open, setOpen] = createSignal(false);
  const [msg, setMsg] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  const { http } = useHttpClient2("/rpc/chat/login/");
  const { avatarSrc } = useImage("/imgs", avatar());
  const { setToken } = useToken();
  const { isMobile } = useWinSize();

  const runLogin = () => {
    const accountValue = account();
    const passwordValue = password();

    if (!accountValue || !passwordValue) {
      setMsg("请输入账号密码 ...");
      setOpen(true);
      return Promise.resolve();
    }

    setLoading(true);

    return http
      .post("POST", { email: accountValue, pass_word: passwordValue })
      .then((results) => {
        if (!results) return;

        const { code, message, data } = results;

        if (code === 200) {
          setToken(results.data?.login_token, results.data?.login_expired);
          setAvatar(data?.user?.avatar_url || "");

          return isMobile()
            ? navigate("/chat/mobile/dialog/")
            : navigate("/chat/dialog/");
        }

        setMsg(message || "登录失败");
        setOpen(true);
      })
      .catch((e) => {
        setMsg(e?.message || "登录失败");
        setOpen(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return ( <div>123</div>
    // <> 123
    //   <Modal visible={open()}>
    //     <Modal.Title>登录提示</Modal.Title>
    //     <Modal.Message>{msg()}</Modal.Message>
    //     <Modal.Confirm onClick={() => setOpen(false)}>确定</Modal.Confirm>
    //   </Modal>

    //   <XBox>
    //     <Avatar src={avatarSrc()} size={60} shape="circle" fit="cover" />
    //   </XBox>

    //   <XBox padding={20}>
    //     <h3>登录界面</h3>
    //   </XBox>

    //   <Divider fade={true} thickness={1} opacity={0.3} />

    //   <XBox padding={5}>
    //     <TextField
    //       label="账号"
    //       maxWidth={250}
    //       hintText="请输入账号"
    //       value={account()}
    //       onChanged={(value) => setAccount(value)}
    //     />
    //   </XBox>

    //   <XBox padding={5}>
    //     <TextField
    //       label="密码"
    //       maxWidth={250}
    //       hintText="请输入密码"
    //       obscureText={true}
    //       value={password()}
    //       onChanged={(value) => setPassword(value)}
    //     />
    //   </XBox>

    //   <XBox padding={10}>
    //     <Button
    //       label={loading() ? "登录中..." : "登录"}
    //       width={250}
    //       disabled={loading()}
    //       onPressed={runLogin}
    //     />
    //   </XBox>
    // </>
  );
}