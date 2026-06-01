export function GlobalModal() {
  const {
    visible,
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    closeModal,
  } = currentModal();

  const handleCancel = () => {
    if (onCancel) onCancel();
    closeModal();
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    closeModal();
  };

  return (
    <MantineModal
      opened={visible}
      onClose={handleCancel}
      centered
      withCloseButton={false}
      size={320}
      radius="md"
      padding={0}
      overlayProps={{
        backgroundOpacity: 0.35,
        blur: 14,
      }}
    >
      {title && (
        <Title
          order={5}
          ta="center"
          fw={600}
          fz={16}
          py={8}
          bg="gray.0"
          style={{ borderBottom: "1px solid #e5e7eb" }}
        >
          {title}
        </Title>
      )}

      {message && (
        <Text fz={13} c="dimmed" ta="center" lh={1.4} px={16} py={12}>
          {message}
        </Text>
      )}

      <Group justify="center" gap="md" px="md" pb="md">
        <Button variant="default" size="xs" w={100} h={32} onClick={handleCancel}>
          {cancelText}
        </Button>

        <Button variant="default" size="xs" w={100} h={32} onClick={handleConfirm}>
          {confirmText}
        </Button>
      </Group>
    </MantineModal>
  );
}