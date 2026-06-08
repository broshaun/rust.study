import { memo } from "react";
import { ScrollArea, Box } from "@mantine/core";
import { Friend } from "./Friend";

export const FriendList = memo(function FriendList({
  friends = [],
  onItemClick,
  onAvatarClick,
}) {


  console.log('friends',friends)

  return (
    <ScrollArea
      w="100%"
      scrollbars="y"
      type="never"
      style={{ overflowX: "hidden" }}
    >
      <Box px={12}>
        {friends.map((friend) => (
          <Friend
            key={friend.id}
            data={friend}
            version={friend?.updated_at}
            onSelect={onItemClick}
            onAvatarClick={onAvatarClick}
          />
        ))}
      </Box>
    </ScrollArea>
  );
});

