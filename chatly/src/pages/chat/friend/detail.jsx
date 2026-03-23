import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useWinSize } from 'hooks';
import { useHttpClient2 } from 'hooks/http';
import { useUserDB} from 'hooks/db';
import { SafeAvatar, Divider, Heading} from 'components/flutter';
import { InfoTile } from 'components/chat';
import { useMutation } from '@tanstack/react-query';
import { Button, Center,Stack,Group,Title } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';



/**
 * 好友详情页面
 */
export function Detail() {
  const navigate = useNavigate();
  const location = useLocation();

  const [account] = useLocalStorage({ key: 'savedAccount' })
  const [friend, setFriend] = useState(location.state?.select);

  const { db, userId, isReady } = useUserDB(account);

  useEffect(() => {
    setFriend(location.state?.select)
  }, [location.state?.select])


  // console.log('friend', friend)

  const { http: http2 } = useHttpClient2('/rpc/chat/friend/');
  const { isMobile } = useWinSize();

  // const avatarSrc = useMemo(() => {
  //   return friend?.avatar_url || "";
  // }, [friend?.avatar_url]);


  // 删除好友逻辑
  const { mutateAsync: delFid } = useMutation({
    mutationFn: async (id) => {
      if (!id) return;
      const results = await http2.requestBodyJson('DELETE', { id });
      if (!results) return;
      const row = await db.table('friends').get(id);

      await Promise.all([
        db.table('message').where('uid').equals(row?.uid).delete(),
        db.table('friends').delete(id),
      ]);
      return 'ok';
    },
  });

  // 更新备注逻辑
  const { mutateAsync: updRemark } = useMutation({
    mutationFn: async ({ id, remark }) => {
      if (!id) return;
      const results = await http2.requestBodyJson('PATCH', { id, remark });
      if (!results) return;
      await db.table('friends').update(id, { remark });
      return 'ok';
    },
  });

  // 发起聊天跳转
  function openMsgWindow(friend) {
    if (!friend?.id) return;
    const displayName = friend.remark ?? friend.nikename ?? friend.email ?? friend.id;
    db.table('friends').update(friend.id, { signal: 'old', dialog: 1 });

    const targetPath = isMobile ? '/message/' : '/chat/dialog/msg/';
    navigate(targetPath, {
      state: {
        uid: friend.uid,
        avatar_url: friend.avatar_url,
        displayName,
      },
    });
  }

  return (

      <Stack p={20}>

        <Center>
          <SafeAvatar
            url={friend?.avatar_url}
            size={80}           // 稍微加大尺寸，显得大气
            radius={8}          // 建议给一点圆角（如8px），比纯直角更有现代感
            cover={true}        // 核心：保持比例裁剪，不变形
            autoUpdate
          />
        </Center>

        <Title order={5}>账户信息</Title>

        <Divider fade />

        {/* 信息展示区 */}
        <InfoTile icon="user" label="名称" value={friend?.nikename} />
        <InfoTile icon="email" label="邮箱" value={friend?.email} />
        <InfoTile
          icon="edit"
          label="备注"
          value={friend?.remark}
          onConfirm={(remark) => {
            setFriend((p) => ({ ...p, remark }));
            updRemark({ id: friend?.id, remark });
          }}
        />

        <Group p={10} gap={40} justify="center">
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
              delFid(friend?.id).then(() => { navigate(isMobile ? '/chat/mobile/friend/' : '/chat/friend/'); })
            }}
          >
            删除好友
          </Button>

        </Group>

      </Stack>

  );
}