import React, { useState, useEffect, useMemo } from '.store/react@18.3.1/node_modules/react';
import styles from './MenuMobile.module.css';
import { IconCustomColor } from 'components/icon';

// 精简全局比例配置（仅保留菜单必要配置，与 Content 无关）
const RATIO = {
  leftIcon: 0.39,
  titleFont: 0.37,
  menuIcon: 0.45,
  menuLabel: 0.26,
  menuItemGap: 0.08,
  menuWidth: 1.78,
  menuItemHeight: 1.4
};

// Head 组件
const Head = ({ title, leftIcon, onClick }) => {
  const getSize = () => {
    const container = document.querySelector(`.${styles.container}`);
    if (!container) return 44;
    return parseFloat(getComputedStyle(container).getPropertyValue('--head-height')) || 44;
  };

  const size = getSize();
  return (
    <div className={styles.head}>
      {leftIcon && (
        <div className={styles.headLeft} onClick={onClick}>
          <IconCustomColor name={leftIcon} size={Math.round(size * RATIO.leftIcon)} />
        </div>
      )}
      <div className={styles.headTitle} style={{ fontSize: `${Math.round(size * RATIO.titleFont)}px` }}>
        {title}
      </div>
    </div>
  );
};

// Content 组件：极致精简！仅作为承载 Outlet 的极简容器，无多余配置
const Content = ({ children }) => (
  <div className={styles.content}>{children}</div>
);

// Items 组件
const Items = ({ children, position = 'left' }) => (
  <div data-position={['left', 'bottom', 'right'].includes(position) ? position : 'left'} className={styles.itemsSlot}>
    {children}
  </div>
);

// 核心 MenuMobile 组件
const MenuMobile = ({ children, size = 46, title = '' }) => {
  const [menuContent, setMenuContent] = useState({ left: null, bottom: null, right: null });

  // 渲染菜单项
  const renderMenuItem = (item) => (
    <button key={item.key} className={styles.item} onClick={item.onClick} disabled={!item.display}>
      {item.icon?.name && (
        <div className={styles.iconWrapper}>
          <IconCustomColor
            name={item.icon.name}
            color={item.icon.color}
            size={Math.round(size * RATIO.menuIcon)}
          />
        </div>
      )}
      <span className={styles.label} style={{ fontSize: `${Math.round(size * RATIO.menuLabel)}px` }}>
        {item.icon?.label || ''}
      </span>
    </button>
  );

  // 渲染菜单列表
  const renderMenuList = (content) => {
    if (!Array.isArray(content) || content.length === 0) return null;
    const validItems = content.filter(item => item && item.key && item.display !== false);
    return validItems.length > 0 ? (
      <div className={styles.menuWrapper}>{validItems.map(renderMenuItem)}</div>
    ) : null;
  };

  // 解析插槽
  const slotMap = useMemo(() => {
    return React.Children.toArray(children).reduce(
      (acc, child) => {
        if (React.isValidElement(child)) {
          switch (child.type) {
            case MenuMobile.Head:
              acc.head = child;
              break;
            case MenuMobile.Items:
              acc.items[child.props.position || 'left'] = child.props.children;
              break;
            case MenuMobile.Content:
              acc.content = child;
              break;
          }
        }
        return acc;
      },
      { head: null, items: { left: null, bottom: null, right: null }, content: null }
    );
  }, [children]);

  const { head, items, content } = slotMap;

  // 更新菜单内容
  useEffect(() => {
    setMenuContent({ left: items.left, bottom: items.bottom, right: items.right });
  }, [items]);

  return (
    <div className={styles.container} style={{
      '--head-height': `${size}px`,
      '--bottom-height': `${size}px`,
      '--menu-width': `${size * RATIO.menuWidth}px`,
      '--menu-item-height': `${size * RATIO.menuItemHeight}px`,
      '--menu-label-gap': `${size * RATIO.menuItemGap}px`
    }}>
      {head || (title && <MenuMobile.Head title={title} leftIcon={null} />)}
      <div className={styles.mainLayout}>
        {renderMenuList(menuContent.left) && <aside className={styles.leftMenu}>{renderMenuList(menuContent.left)}</aside>}
        {content}
      </div>
      <div className={styles.bottom}>{renderMenuList(menuContent.bottom)}</div>
    </div>
  );
};

// 挂载插槽
MenuMobile.Head = Head;
MenuMobile.Items = Items;
MenuMobile.Content = Content;

export default MenuMobile;