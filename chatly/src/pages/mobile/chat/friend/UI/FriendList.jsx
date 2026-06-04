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
          <Friend
            key={friend.id}
            data={friend}
            onSelect={onItemClick}
            onAvatarClick={onAvatarClick}
          />
        ))}
      </Box>
    </ScrollArea>
  );
});