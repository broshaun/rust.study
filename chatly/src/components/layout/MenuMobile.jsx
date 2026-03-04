import React, { useMemo } from "react";
import styles from "./MenuMobile.module.css";
import { IconCustomColor } from "components/icon";

const RATIO = {
  leftIcon: 0.39,
  titleFont: 0.37,
  menuIcon: 0.45,
  menuLabel: 0.26,
  menuItemGap: 0.08,
  menuWidth: 1.78,
  menuItemHeight: 1.4,
};

// ✅ 只在 iOS（含 iPadOS）启用 safe-area，PC 强制 0
function isIOS() {
  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const maxTouchPoints = navigator.maxTouchPoints || 0;
  const iOSDevice = /iPhone|iPad|iPod/i.test(ua);
  const iPadOS = platform === "MacIntel" && maxTouchPoints > 1;
  return iOSDevice || iPadOS;
}

/**
 * Head
 * - ✅ show: 可显式控制是否显示
 * - ✅ 默认：title 有值才显示；title 为空不占位
 */
const Head = ({ title, leftIcon, onClick, size = 46, show }) => {
  const shouldShow = typeof show === "boolean" ? show : Boolean(title);

  // ✅ 不显示就直接 return null：完全不占高度
  if (!shouldShow) return null;

  const iconSize = Math.round(size * RATIO.leftIcon);
  const fontSize = Math.round(size * RATIO.titleFont);

  return (
    <div className={styles.head}>
      {leftIcon ? (
        <button type="button" className={styles.headLeft} onClick={onClick} aria-label="Back">
          <IconCustomColor name={leftIcon} size={iconSize} />
        </button>
      ) : (
        <div className={styles.headSide} />
      )}

      <div className={styles.headTitle} style={{ fontSize }} title={title}>
        {title}
      </div>

      <div className={styles.headSide} />
    </div>
  );
};

const Content = ({ children }) => <div className={styles.content}>{children}</div>;

const Items = ({ children, position = "left" }) => (
  <div data-position={position} className={styles.itemsSlot}>
    {children}
  </div>
);

const MenuMobile = ({ children, size = 46 }) => {
  const ios = typeof window !== "undefined" ? isIOS() : false;

  const slots = useMemo(() => {
    return React.Children.toArray(children).reduce(
      (acc, child) => {
        if (!React.isValidElement(child)) return acc;

        if (child.type === MenuMobile.Head) acc.head = child;
        else if (child.type === MenuMobile.Content) acc.content = child;
        else if (child.type === MenuMobile.Items) {
          const pos = child.props.position || "left";
          acc.items[pos] = child.props.children;
        }
        return acc;
      },
      { head: null, content: null, items: { left: null, bottom: null, right: null } }
    );
  }, [children]);

  const renderMenuList = (content, isBottom = false) => {
    if (!Array.isArray(content) || content.length === 0) return null;
    const valid = content.filter((it) => it && it.key && it.display !== false);
    if (valid.length === 0) return null;

    return (
      <div className={styles.menuWrapper} data-bottom={isBottom ? "1" : "0"}>
        {valid.map((item) => (
          <button
            key={item.key}
            type="button"
            className={styles.item}
            onClick={item.onClick}
            disabled={item.display === false}
          >
            {item.icon?.name ? (
              <div className={styles.iconWrapper}>
                <IconCustomColor
                  name={item.icon.name}
                  color={item.icon.color}
                  size={Math.round(size * RATIO.menuIcon)}
                />
              </div>
            ) : null}

            <span className={styles.label} style={{ fontSize: `${Math.round(size * RATIO.menuLabel)}px` }}>
              {item.icon?.label || ""}
            </span>
          </button>
        ))}
      </div>
    );
  };

  const leftList = renderMenuList(slots.items.left, false);
  const bottomList = renderMenuList(slots.items.bottom, true);

  return (
    <div
      className={styles.container}
      style={{
        "--head-height": `${size}px`,
        "--bottom-height": `${size}px`,
        "--menu-width": `${size * RATIO.menuWidth}px`,
        "--menu-item-height": `${size * RATIO.menuItemHeight}px`,
        "--menu-label-gap": `${size * RATIO.menuItemGap}px`,

        // ✅ 关键：PC 强制 0；只有 iOS 才用 env()
        "--safe-top": ios ? "env(safe-area-inset-top, 0px)" : "0px",
        "--safe-bottom": ios ? "env(safe-area-inset-bottom, 0px)" : "0px",
      }}
    >
      {/* ✅ 只渲染你传入的 Head；Head 自己决定是否 return null */}
      {slots.head ? React.cloneElement(slots.head, { size }) : null}

      <div className={styles.mainLayout}>
        {leftList ? <aside className={styles.leftMenu}>{leftList}</aside> : null}
        <div className={styles.contentWrap}>{slots.content}</div>
      </div>

      <div className={`${styles.bottom} app-bottom-nav`}>{bottomList}</div>
    </div>
  );
};

MenuMobile.Head = Head;
MenuMobile.Items = Items;
MenuMobile.Content = Content;

export default MenuMobile;