// AppBar.jsx
import React from "react";
import styles from "./AppBar.module.css";

export const AppBar = ({
  title,
  leading,
  actions,
  style,
  className = "",
  height = 56,
}) => {
  return (
    <nav
      className={[styles.appBar, className].filter(Boolean).join(" ")}
      style={{
        "--ab-h": typeof height === "number" ? `${height}px` : height,
        ...style,
      }}
    >
      <div className={styles.leadingSection}>{leading}</div>

      <div className={styles.titleWrapper}>
        <h1 className={styles.titleText} title={typeof title === "string" ? title : undefined}>
          {title}
        </h1>
      </div>

      <div className={styles.actionsSection}>{actions}</div>
    </nav>
  );
};

export default AppBar;