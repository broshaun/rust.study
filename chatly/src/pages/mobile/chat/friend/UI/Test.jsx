import { memo, useEffect, useState } from "react";
import { ScrollArea, Box } from "@mantine/core";
import { liveQuery } from "dexie";
import { Friend } from "./Friend";

export const FriendList = memo(function FriendList({
  db,
  friends = [],
  onItemClick,
  onAvatarClick,
}) {
  const [friendMap, setFriendMap] = useState(() => new Map());

  useEffect(() => {
    if (!db) return;

    const sub = liveQuery(() =>
      db.table("friends").toArray()
    ).subscribe({
      next: (rows) => {
        setFriendMap(
          new Map(rows.map((item) => [item.id, item]))
        );
      },
    });

    return () => sub.unsubscribe();
  }, [db]);

  return (
    <ScrollArea
      w="100%"
      scrollbars="y"
      type="never"
      style={{ overflowX: "hidden" }}
    >
      <Box px={12}>
        {friends.map((friend) => {
          const local = friendMap.get(friend.id);

          return (
            <Friend
              key={friend.id}
              data={{
                ...friend,
                ...local,
              }}
              onSelect={onItemClick}
              onAvatarClick={onAvatarClick}
            />
          );
        })}
      </Box>
    </ScrollArea>
  );
});