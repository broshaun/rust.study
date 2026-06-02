import { create } from "zustand";


export { GlobalModal } from "./components/GlobalModal";
const initialState = {
  visible: false,
  title: "",
  message: "",
  confirmText: "确定",
  cancelText: "取消",
  onConfirm: null,
  onCancel: null,
};
export const currentModal = create((set) => ({
  ...initialState,
  open: (options = {}) =>
    set({
      ...initialState,
      ...options,
      visible: true,
      confirmText: options.confirmText || "确定",
      cancelText: options.cancelText || "取消",
    }),
  close: () => set(initialState),
}));


// 组件里使用
// const { open } = currentModal();
// open({
//   title: "退出群聊",
//   message: "确定退出该群聊吗？",
//   onConfirm() {
//     console.log("确认退出");
//   },
// });
// return <GlobalModal />