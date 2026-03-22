import React from "react";
import styles from "./AppBar.module.css";

export const AppBar = ({
  title,
  leading,
  actions,
  style,
  className = "",
  height = 56,

  withBorder = false,
  withShadow = false,
  transparent = false,

  background,
  titleAlign = "center", // center | left
  px = 16,

  as = "nav",
  ...rest
}) => {
  const Component = as;

  const rootClassName = [
    styles.appBar,
    withBorder ? styles.withBorder : "",
    withShadow ? styles.withShadow : "",
    transparent ? styles.transparent : "",
    titleAlign === "left" ? styles.leftTitle : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component
      className={rootClassName}
      style={{
        "--ab-h": typeof height === "number" ? `${height}px` : height,
        "--ab-px": typeof px === "number" ? `${px}px` : px,
        ...(background ? { "--ab-bg": background } : {}),
        ...style,
      }}
      {...rest}
    >
      <div className={styles.leadingSection}>
        {leading}
      </div>

      <div className={styles.titleWrapper}>
        {typeof title === "string" ? (
          <h1 className={styles.titleText} title={title}>
            {title}
          </h1>
        ) : (
          <div className={styles.titleNode}>
            {title}
          </div>
        )}
      </div>

      <div className={styles.actionsSection}>
        {actions}
      </div>
    </Component>
  );
};

export default AppBar;