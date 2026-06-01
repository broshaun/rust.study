import React, { Children, isValidElement } from "react";
import { Modal as MantineModal, Button, Group, Text, Title } from "@mantine/core";

export function Modal({ visible, children, onClose }) {
  const { contentItems, actionItems } = Children.toArray(children).reduce(
    (acc, child) => {
      if (isValidElement(child)) {
        if (child.type === Modal.Confirm || child.type === Modal.Cancel) {
          acc.actionItems.push(child);
        } else {
          acc.contentItems.push(child);
        }
      }
      return acc;
    },
    { contentItems: [], actionItems: [] }
  );

  return (
    <MantineModal
      opened={visible}
      onClose={onClose || (() => {})}
      centered
      withCloseButton={false}
      size={320}
      radius="md"
      overlayProps={{
        backgroundOpacity: 0.35,
        blur: 14,
      }}
      padding={0}
    >
      <div>{contentItems}</div>

      {actionItems.length > 0 && (
        <Group justify="center" gap="md" px="md" pb="md">
          {actionItems}
        </Group>
      )}
    </MantineModal>
  );
}

Modal.Title = ({ children }) => (
  <Title
    order={5}
    ta="center"
    fw={600}
    fz={16}
    py={8}
    bg="gray.0"
    style={{ borderBottom: "1px solid #e5e7eb" }}
  >
    {children}
  </Title>
);

Modal.Message = ({ children }) => (
  <Text fz={13} c="dimmed" ta="center" lh={1.4} px={16} py={12}>
    {children}
  </Text>
);

Modal.Actions = () => null;

Modal.Confirm = ({ children, onClick, ...rest }) => (
  <Button
    variant="default"
    size="xs"
    w={100}
    h={32}
    radius="sm"
    onClick={onClick}
    {...rest}
  >
    {children || "确定"}
  </Button>
);

Modal.Cancel = ({ children, onClick, ...rest }) => (
  <Button
    variant="default"
    size="xs"
    w={100}
    h={32}
    radius="sm"
    onClick={onClick}
    {...rest}
  >
    {children || "取消"}
  </Button>
);