import { memo } from "react";
import { ScrollArea, Box } from "@mantine/core";
import { Dialog } from "./Dialog";

export const DialogList = memo(function DialogList({
  dialogs = [],
  onSelect,
  onClear,
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
        {dialogs.map((dialog) => (
          <Dialog
            key={dialog.id}
            data={dialog}
            version={dialog?.timestamp}
            onSelect={onSelect}
            onClear={onClear}
            onAvatarClick={onAvatarClick}
          />
        ))}
      </Box>
    </ScrollArea>
  );
});