import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useHttpClient, currentAppBar } from 'utils';
import { getUserDB } from "utils";
import { SafeAvatar } from 'components'; 
import { useMutation } from '@tanstack/react-query';
import { Button, Center, Stack, Group, Title, Divider } from '@mantine/core'; // 仅引入 Divider
import { useLocalStorage } from '@mantine/hooks';
import { InfoTile } from "./UI/InfoTile";

export function Detail() {
  const setTitle = currentAppBar((state) => state.setTitle);
  const setLeftPath = currentAppBar((state) => state.setLeftPath);
  const setRightIcon = currentAppBar((state) => state.setRightIcon);
  const setRightPath = currentAppBar((state) => state.setRightPath);

  useEffect(() => {
    setLeftPath('/mobile/chat/friend/')
    setTitle('好友信息');
    setRightIcon(null)
    setRightPath(null)
  }, [])

  const navigate = useNavigate();
  const location = useLocation();
  const [account] = useLocalStorage({ key: 'current_account' })
  const [friend, setFriend] = useState(location.state?.select);
  const db = getUserDB(account);

  useEffect(() => {
    setFriend(location.state?.select)
  }, [location.state?.select])

  const { http: http2 } = useHttpClient('/rpc/chat/friend/');

  // 删除好友
  const { mutateAsync: delFid } = useMutation({
    mutationFn: async (id) => {
      if (!id) return;
      await http2.requestBodyJson('DELETE', { id });
      const row = await db.table('friends').get(id);
      await Promise.all([
        db.table('message').where('uid').equals(row?.uid).delete(),
        db.table('friends').delete(id),
      ]);
      return 'ok';
    },
  });

  // 更新备注
  const { mutateAsync: updRemark } = useMutation({
    mutationFn: async ({ id, remark }) => {
      if (!id) return;
      await http2.requestBodyJson('PATCH', { id, remark });
      await db.table('friends').update(id, { remark });
      return 'ok';
    },
  });

  function openMsgWindow(friend) {
    if (!friend?.id) return;
    const displayName = friend.remark ?? friend.nikename ?? friend.email ?? friend.id;
    db.table('friends').update(friend.id, { signal: 'old', dialog: 1 });
    navigate('/mobile/chat/message/', {
      state: { uid: friend.uid, avatar_url: friend.avatar_url, displayName },
    });
  }

  return (
    <Stack p={20}>
      <Center>
        <SafeAvatar
          url={friend?.avatar_url}
          size={80}
          radius={8} // 保持你原来的 8px
          cover={true}
          autoUpdate
        />
      </Center>

      <Title order={5}>账户信息</Title>

      {/* 🔥 严格照搬你要求的“两边淡化”设计，厚度 1px，透明度 0.3 */}
      <Divider 
        styles={{
          root: {
            border: 'none',
            height: '1px',
            opacity: 0.3, // 保持你原来的透明度参数
            backgroundImage: 'linear-gradient(to right, transparent, light-dark(rgba(0,0,0,0.8), rgba(255,255,255,0.8)) 50%, transparent)'
          }
        }} 
      />

      <InfoTile icon="IconId" label="名称" value={friend?.nikename} />
      <InfoTile icon="mail" label="邮箱" value={friend?.email} />
      <InfoTile
        icon="IconUserEdit"
        label="备注"
        value={friend?.remark}
        onConfirm={(remark) => {
          setFriend((p) => ({ ...p, remark }));
          updRemark({ id: friend?.id, remark });
        }}
      />

      {/* 保持原样：gap=25, justify=center, 不使用 flex=1 */}
      <Group p={10} gap={25} justify="center" wrap="nowrap">
        <Button
          variant="filled"
          color="indigo"
          radius="md"
          onClick={() => openMsgWindow(friend)}
        >
          发起聊天
        </Button>

        <Button
          variant="filled"
          color="orange"
          radius="md"
          onClick={() => {
            delFid(friend?.id).then(() => { navigate('/mobile/chat/friend/') })
          }}
        >
          删除好友
        </Button>
      </Group>
    </Stack>
  );
}