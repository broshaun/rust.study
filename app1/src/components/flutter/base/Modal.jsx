import { createEffect, onCleanup, children as resolveChildren, Show } from "solid-js";
import styles from "./Modal.module.css";

function Modal(props) {
  createEffect(() => {
    if (!props.visible) {
      document.body.style.overflow = "";
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    onCleanup(() => {
      document.body.style.overflow = originalOverflow;
    });
  });

  const resolved = resolveChildren(() => props.children);

  const splitChildren = () => {
    const list = resolved.toArray ? resolved.toArray() : [resolved()];
    const contentItems = [];
    const actionItems = [];

    list.forEach((child) => {
      if (child == null || child === false || child === true) return;

      if (
        typeof child === "object" &&
        child !== null &&
        child.props &&
        (child.props["data-modal-role"] === "confirm" ||
          child.props["data-modal-role"] === "cancel")
      ) {
        actionItems.push(child);
      } else {
        contentItems.push(child);
      }
    });

    return { contentItems, actionItems };
  };

  return (
    <Show when={props.visible}>
      <div class={styles.overlay}>
        <div class={styles.box} onClick={(e) => e.stopPropagation()}>
          <div class={styles.contentWrapper}>{splitChildren().contentItems}</div>

          <Show when={splitChildren().actionItems.length > 0}>
            <div class={styles.actions}>{splitChildren().actionItems}</div>
          </Show>
        </div>
      </div>
    </Show>
  );
}

/* 子组件 */
Modal.Title = (props) => <div class={styles.title}>{props.children}</div>;

Modal.Message = (props) => <div class={styles.message}>{props.children}</div>;

Modal.Actions = () => null; // 留着兼容，不影响

Modal.Confirm = (props) => (
  <button
    data-modal-role="confirm"
    class={[styles.confirmBtn, props.className || ""].join(" ").trim()}
    onClick={props.onClick}
    {...props}
  >
    {props.children || "确定"}
  </button>
);

Modal.Cancel = (props) => (
  <button
    data-modal-role="cancel"
    class={[styles.cancelBtn, props.className || ""].join(" ").trim()}
    onClick={props.onClick}
    {...props}
  >
    {props.children || "取消"}
  </button>
);

export default Modal;