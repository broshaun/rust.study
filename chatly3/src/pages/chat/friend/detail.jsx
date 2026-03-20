import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { useWinSize } from 'hooks';
import { useHttpClient2, useApiBase } from 'hooks/http';
import { db } from 'hooks/db';
import { useRequest } from 'ahooks';
import { Avatar, Divider, Heading, YBox, XBox } from 'components/flutter';
import { InfoTile } from 'components/chat';
import { Button } from '@mantine/core';

export function Detail() {
  const navigate = useNavigate();
  const location = useLocation();

  const select = location.state?.select;
  const [friend, setFriend] = useState();
  const { apiBase } = useApiBase();

  useEffect(() => {
    setFriend(select);
  }, [select]);

  const { http: http2 } = useHttpClient2('/rpc/chat/friend/');
  const { isMobile } = useWinSize();

  const avatarSrc = useMemo(() => {
    if (!friend?.avatar_url) return "";
    return `${String(apiBase || "").replace(/\/+$/, "")}/imgs/${String(friend.avatar_url).replace(/^\/+/, "")}`;
  }, [apiBase, friend?.avatar_url]);

  const { runAsync: delFid } = useRequest(
    async (id) => {
      const results = await http2.requestBodyJson('DELETE', { id });
      if (!results) return;
      const row = await db.table('friends').get(id);
      return await Promise.all([
        db.table('message').where('uid').equals(row?.uid).delete(),
        db.table('friends').delete(id),
      ]);
    },
    { manual: true }
  );

  const { runAsync: updRemark } = useRequest(
    async (id, remark) => {
      const results = await http2.requestBodyJson('PATCH', { id, remark });
      if (!results) return;
      return await db.table('friends').update(id, { remark });
    },
    { manual: true }
  );

  function openMsgWindow(friend) {
    if (!friend?.id) return;

    const displayName =
      friend.remark ?? friend.nikename ?? friend.email ?? friend.id;

    db.table('friends').update(friend.id, { signal: 'old', dialog: 1 });

    if (isMobile) {
      navigate('/message/', {
        state: {
          uid: friend.uid,
          avatar_url: friend.avatar_url,
          displayName,
        },
      });
    } else {
      navigate('/chat/dialog/msg/', {
        state: {
          uid: friend.uid,
          avatar_url: friend.avatar_url,
          displayName,
        },
      });
    }
  }

  return (
    <Suspense fallback={<div>加载中...</div>}>
      <YBox padding={20}>
        <YBox.Segment padding={20} align="center">
          <Avatar
            size={75}
            src={avatarSrc}
            fit="cover"
            variant="square"
            roundedRadius={0}
          />
        </YBox.Segment>

        <YBox.Segment padding={20} align="left">
          <Heading level={4}>账户信息</Heading>
        </YBox.Segment>

        <Divider />

        <YBox.Segment padding={20} align="left" width={500}>
          <InfoTile icon="user" label="名称" value={friend?.nikename} />
          <InfoTile icon="email" label="邮箱" value={friend?.email} />
          <InfoTile
            icon="edit"
            label="备注"
            value={friend?.remark}
            onConfirm={(remark) => {
              setFriend((p) => ({ ...p, remark }));
              updRemark(friend?.id, remark);
            }}
          />
        </YBox.Segment>

        <YBox.Segment align="center">
          <XBox padding={20} gap={50}>
            {/* <Button
              label="发起聊天"
              onPressed={() => openMsgWindow(friend)}
              style={{
                background: 'var(--accent-color)',
                color: '#fff',
                border: 'none',
              }}
            /> */}
            <Button>发起聊天</Button>


            <Button
              label="删除好友"
              onPressed={() => {
                delFid(friend?.id).then(() => {
                  navigate(isMobile ? '/chat/mobile/friend/' : '/chat/friend/');
                });
              }}
              style={{
                color: '#fff',
                background: '#ff4d4f',
                border: 'none',
              }}
            />
          </XBox>
        </YBox.Segment>
      </YBox>
    </Suspense>
  );
}