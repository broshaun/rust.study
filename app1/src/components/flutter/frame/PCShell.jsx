import styles from "./PCShell.module.css";

/**
 * PCShell - PC端沉浸式布局容器
 * 职责：管理 Header、Sidebar (Left) 和 Content 的空间分配。
 */
export const PCShell = (props) => {
  const list = Array.isArray(props.children) ? props.children : [props.children];

  let header = null;
  let content = null;
  let left = null;

  list.forEach((child) => {
    if (child == null || child === false || child === true) return;

    const slot = child?.props?.["data-pcshell-slot"];

    if (slot === "header") {
      header = child;
      return;
    }

    if (slot === "content") {
      content = child;
      return;
    }

    if (slot === "left") {
      left = child;
    }
  });

  const headerHeight = header?.props?.height || 64;
  const sidebarWidth = left?.props?.width || 80;

  return (
    <div class={styles.pcShell}>
      {header && (
        <header
          class={styles.header}
          style={{
            height:
              typeof headerHeight === "number"
                ? `${headerHeight}px`
                : headerHeight,
          }}
        >
          {header}
        </header>
      )}

      <div class={styles.bottomSection}>
        {left && (
          <aside
            class={styles.sidebar}
            style={{
              width:
                typeof sidebarWidth === "number"
                  ? `${sidebarWidth}px`
                  : sidebarWidth,
            }}
          >
            {left}
          </aside>
        )}

        <main class={styles.content}>{content}</main>
      </div>
    </div>
  );
};

PCShell.Header = (props) => (
  <div
    data-pcshell-slot="header"
    height={props.height || 64}
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      "align-items": "center",
      background: "transparent",
      ...(props.style || {}),
    }}
  >
    {props.children}
  </div>
);

PCShell.Content = (props) => (
  <div
    data-pcshell-slot="content"
    style={{
      width: "100%",
      height: "100%",
      ...(props.style || {}),
    }}
  >
    {props.children}
  </div>
);

PCShell.Left = (props) => (
  <div
    data-pcshell-slot="left"
    width={props.width || 80}
    style={{
      width: "100%",
      height: "100%",
      overflow: "auto",
      ...(props.style || {}),
    }}
  >
    {props.children}
  </div>
);

export default PCShell;