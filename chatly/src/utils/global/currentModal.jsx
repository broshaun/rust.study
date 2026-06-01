import { create } from "zustand";
import { Modal as MantineModal, Button, Group, Text, Title } from "@mantine/core";

export const currentModal = create((set) => ({
  visible: false,
  title: "",
  message: "",
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