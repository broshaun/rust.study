// src/components/MenuMobile/MenuMobile.jsx
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

const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

const Head = ({ title, leftIcon, onClick, size = 46, show }) => {
  // ✅ 优化：默认按 title 自动显示；title 为空 => 不渲染不占位
  const shouldShow = typeof show === "boolean" ? show : isNonEmptyString(title);

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
        <div className={styles.headSide} aria-hidden="true" />
      )}

      <div className={styles.headTitle} style={{ fontSize }} title={title}>
        {title}
      </div>

      <div className={styles.headSide} aria-hidden="true" />
    </div>
  );
};

const Content = ({ children }) => <div className={styles.content}>{children}</div>;

const Items = ({ children, position = "left" }) => (
  <div data-position={position} className={styles.itemsSlot}>
    {children}
  </div>
);

/**
 * ✅ 优化点总览
 * 1) 去掉 menuContent state + useEffect：少一次 state 更新、少一次 render
 * 2) Head：title 为空时不占位（return null），解决“无标题仍占高”
 * 3) renderMenuList：只渲染一次，避免重复调用
 * 4) 更稳的过滤：display === false 才禁用；缺 key 直接忽略
 * 5) 给底部栏增加全局 class（便于未来键盘场景隐藏）
 */
const MenuMobile = ({ children, size = 46, title = "" }) => {
  const slots = useMemo(() => {
    return React.Children.toArray(children).reduce(
      (acc, child) => {
        if (!React.isValidElement(child)) return acc;

        if (child.type === MenuMobile.Head) acc.head = child;
        else if (child.type === MenuMobile.Content) acc.content = child;
        else if (child.type === MenuMobile.Items) {
          const pos = child.props.position || "left";
          // 仅允许 left/bottom/right
          const safePos = ["left", "bottom", "right"].includes(pos) ? pos : "left";
          acc.items[safePos] = child.props.children;
        }
        return acc;
      },
      { head: null, content: null, items: { left: null, bottom: null, right: null } }
    );
  }, [children]);

  const normalizeItems = (content) => {
    if (!Array.isArray(content) || content.length === 0) return [];
    return content.filter((it) => it && it.key && it.display !== false);
  };

  const leftItems = useMemo(() => normalizeItems(slots.items.left), [slots.items.left]);
  const bottomItems = useMemo(() => normalizeItems(slots.items.bottom), [slots.items.bottom]);

  const renderMenu = (items, isBottom) => {
    if (!items || items.length === 0) return null;

    return (
      <div className={styles.menuWrapper} data-bottom={isBottom ? "1" : "0"}>
        {items.map((item) => {
          const disabled = item.display === false; // ✅ 严格：只有 false 才禁用
          const iconName = item.icon?.name;
          const iconLabel = item.icon?.label || "";

          return (
            <button
              key={item.key}
              type="button"
              className={styles.item}
              onClick={disabled ? undefined : item.onClick}
              disabled={disabled}
            >
              {iconName ? (
                <div className={styles.iconWrapper}>
                  <IconCustomColor
                    name={iconName}
                    color={item.icon?.color}
                    size={Math.round(size * RATIO.menuIcon)}
                  />
                </div>
              ) : null}

              <span className={styles.label} style={{ fontSize: `${Math.round(size * RATIO.menuLabel)}px` }}>
                {iconLabel}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={styles.container}
      style={{
        "--head-height": `${size}px`,
        "--bottom-height": `${size}px`,
        "--menu-width": `${size * RATIO.menuWidth}px`,
        "--menu-item-height": `${size * RATIO.menuItemHeight}px`,
        "--menu-label-gap": `${size * RATIO.menuItemGap}px`,
      }}
    >
      {/* ✅ 优化：没有显式 Head 时，用 title 自动生成；title 为空则不占位 */}
      {slots.head
        ? React.cloneElement(slots.head, { size })
        : (isNonEmptyString(title) ? <MenuMobile.Head title={title} size={size} /> : null)}

      <div className={styles.mainLayout}>
        {leftItems.length > 0 ? <aside className={styles.leftMenu}>{renderMenu(leftItems, false)}</aside> : null}
        <div className={styles.contentWrap}>
          {slots.content || <MenuMobile.Content />}
        </div>
      </div>

      <div className={`${styles.bottom} app-bottom-nav`}>
        {renderMenu(bottomItems, true)}
      </div>
    </div>
  );
};

MenuMobile.Head = Head;
MenuMobile.Items = Items;
MenuMobile.Content = Content;

export default MenuMobile;