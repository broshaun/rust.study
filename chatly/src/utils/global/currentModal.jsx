import { create } from "zustand";
export { GlobalModal } from "./components/GlobalModal"


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


