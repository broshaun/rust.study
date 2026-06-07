import { memo, useEffect, useState, useMemo } from "react";
import { liveQuery } from "dexie";
import { FriendList } from "./FriendList";

export const FriendListContainer = memo(function FriendListContainer({
  db,
  friends = [],
  onItemClick,
  onAvatarClick,
}) {
  const [friendMap, setFriendMap] = useState(() => new Map());

  // 单订阅整个 friends 表
  useEffect(() => {
    if (!db) return;

    const sub = liveQuery(() => db.table("friends").toArray())
      .subscribe({
        next: rows => setFriendMap(new Map(rows.map(item => [item.id, item]))),
      });

    return () => sub.unsubscribe();
  }, [db]);

  // 合并外部接口字段 + 本地字段
  const mergedFriends = useMemo(() => {
    return friends.map(friend => ({
      ...friend,                  // 外部接口数据
      ...friendMap.get(friend.id), // 本地 Dexie 字段
    }));
  }, [friends, friendMap]);

  return (
    <FriendList
      friends={mergedFriends}
      onItemClick={onItemClick}
      onAvatarClick={onAvatarClick}
    />
  );
});