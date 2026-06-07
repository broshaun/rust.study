import { memo } from "react";
import { ScrollArea, Box } from "@mantine/core";
import { Friend } from "./Friend";

export const FriendList = memo(function FriendList({
  friends = [],
  onItemClick,
  onAvatarClick,
}) {
  return (
    <ScrollArea
      w="100%"
      scrollbars="y"
      type="never"
      style={{ overflowX: "hidden" }}
    >
      <Box px={12}>
        {friends.map((friend) => (


          // 在这个位置订阅Dexie对应id行数据

          <Friend
            key={friend.id}
            data={friend}
            version={friend?.timestamp}
            onSelect={onItemClick}
            onAvatarClick={onAvatarClick}
          />
        ))}
      </Box>
    </ScrollArea>
  );
});


// useEffect(() => {
//   if (!db || !friend.id) return;

//   const sub = liveQuery(
//     () => db.table("friends").get(friend.id)
//   ).subscribe({
//     next: row => {
//       setLocal(row);
//     },
//   });

//   return () => sub.unsubscribe();
// }, [db, friend.id]);