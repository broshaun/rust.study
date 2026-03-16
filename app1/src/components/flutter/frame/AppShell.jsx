import styles from "./AppShell.module.css";

/**
 * AppShell - 全平台沉浸式布局骨架
 * 职责：
 * 1. 只负责 Header / Content / Footer 的结构布局
 * 2. 处理 safe-area
 * 3. 不负责具体内容的对齐方式
 */
export const AppShell = (props) => {
  const list = Array.isArray(props.children) ? props.children : [props.children];

  let header = null;
  let footer = null;
  const contentList = [];

  list.forEach((child) => {
    if (child == null || child === false || child === true) return;

    const slot = child?.props?.["data-appshell-slot"];

    if (slot === "header") {
      header = child;
      return;
    }

    if (slot === "footer") {
      footer = child;
      return;
    }

    if (slot === "content") {
      contentList.push(child);
      return;
    }

    contentList.push(child);
  });

  const content = contentList.length <= 1 ? contentList[0] : contentList;

  return (
    <div class={styles.appShell}>
      {header && (
        <header
          class={styles.header}
          style={{ "--h": `${header?.props?.height || 56}px` }}
          data-tauri-drag-region
        >
          {header}
        </header>
      )}

      <main class={styles.content}>{content}</main>

      {footer && (
        <footer
          class={styles.footer}
          style={{ "--f": `${footer?.props?.height || 64}px` }}
        >
          {footer}
        </footer>
      )}
    </div>
  );
};

AppShell.Header = (props) => (
  <div class={styles.innerSlot} data-appshell-slot="header" height={props.height}>
    {props.children}
  </div>
);

AppShell.Content = (props) => (
  <div data-appshell-slot="content">
    {props.children}
  </div>
);

AppShell.Footer = (props) => (
  <div class={styles.footerInner} data-appshell-slot="footer" height={props.height}>
    {props.children}
  </div>
);

export const Scaffold = AppShell;
Scaffold.Header = AppShell.Header;
Scaffold.Footer = AppShell.Footer;
Scaffold.Content = AppShell.Content;

export default AppShell;