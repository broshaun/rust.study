import { create } from "zustand";
// export { GlobalModal } from "./UI/GlobalModal";
import { Modal, Button, Group, Text, Title } from "@mantine/core";


export const currentModal = create((set) => ({
  visible: false,
  title: "标题",
  message: "提示消息",
  confirmText: "确定",
  cancelText: "取消",
  onConfirm: null,
  onCancel: null,

  openModal: (options = {}) =>
    set({
      visible: true,
      title: options.title || "",
      message: options.message || "",
      confirmText: options.confirmText || "确定",
      cancelText: options.cancelText || "取消",
      onConfirm: options.onConfirm || null,
      onCancel: options.onCancel || null,
    }),

  closeModal: () =>
    set({
      visible: false,
      title: "",
      message: "",
      confirmText: "确定",
      cancelText: "取消",
      onConfirm: null,
      onCancel: null,
    }),
}));



export function GlobalModal() {
  const modal = currentModal();

  const close = (callback) => {
    callback?.();
    modal.closeModal();
  };

  return (
    <Modal
      opened={modal.visible}
      onClose={() => close(modal.onCancel)}
      centered
      withCloseButton={false}
      size={320}
      radius="md"
      padding={0}
      overlayProps={{ backgroundOpacity: 0.35, blur: 14 }}
    >
      {modal.title && (
        <Title order={5} ta="center" fw={600} fz={16} py={8} bg="gray.0" style={{ borderBottom: "1px solid #e5e7eb" }}>
          {modal.title}
        </Title>
      )}

      {modal.message && (
        <Text fz={13} c="dimmed" ta="center" lh={1.4} px={16} py={12}>
          {modal.message}
        </Text>
      )}

      <Group justify="center" gap="md" px="md" pb="md">
        <Button variant="default" size="xs" w={100} h={32} onClick={() => close(modal.onCancel)}>
          {modal.cancelText}
        </Button>

        <Button variant="default" size="xs" w={100} h={32} onClick={() => close(modal.onConfirm)}>
          {modal.confirmText}
        </Button>
      </Group>
    </Modal>
  );
}