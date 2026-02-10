import React from 'react'
import styles from './MenuBar.module.css'
import { IconCustomColor } from 'components/icon'

// 插槽组件：按要求命名（Items/Message/Content）
const Items = ({ children }) => children
const Message = ({ children }) => children
const Content = ({ children, fluid = false, scroll = false }) => (
  <div className={`${styles.content} ${fluid ? styles.contentFluid : ''} ${scroll ? styles.contentScroll : ''}`}>
    {children}
  </div>
)

const MenuBar = ({ 
  children, 
  size = { width: '100%', height: 46 }
}) => {
  const menuSize = {
    width: size.width,
    height: size.height
  }

  const fontSize = Math.round(menuSize.height * 0.3)
  const iconSize = Math.round(menuSize.height * 0.5)

  // 分离插槽
  let itemsList = [], messageList = [];
  let contentSlot = null;
  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) return;

    if (child.type === MenuBar.Content) {
      contentSlot = child;
      return;
    }

    const slotItems = child.props.children || [];
    const formattedItems = Array.isArray(slotItems) 
      ? slotItems 
      : (slotItems?.key ? [slotItems] : []);
    
    if (child.type === MenuBar.Items) itemsList = formattedItems;
    if (child.type === MenuBar.Message) messageList = formattedItems;
  });

  const filterValidItem = item => !!item && !!item.key && item.display === true;

  const renderItem = (item) => (
    <button
      key={item.key}
      type="button"
      className={styles.item}
      style={{ fontSize }}
      onClick={() => item.onClick?.(item.key)}
      disabled={item.disabled}
    >
      {item.icon?.name && <IconCustomColor 
        name={item.icon.name} 
        color={item.icon.color} 
        size={iconSize} 
      />}
      <span className={styles.label}>{item.icon?.lable || ''}</span>
    </button>
  );

  return (
    <div className={styles.menuWrapper}>
      {/* 导航栏：添加固定样式，冻结 Items/Message 不跟随滚动 */}
      <nav 
        className={styles.menu}
        style={{ 
          ...menuSize, 
          boxSizing: 'border-box'
        }}
      >
        {itemsList.filter(filterValidItem).map(renderItem)}
        {messageList.filter(filterValidItem).length > 0 && (
          <div className={styles.right}>
            {messageList.filter(filterValidItem).map(renderItem)}
          </div>
        )}
      </nav>

      {/* Content 包裹层：单独控制滚动区域，确保导航冻结不被影响 */}
      <div className={styles.contentWrapper}>
        {contentSlot}
      </div>
    </div>
  )
}

MenuBar.Items = Items;
MenuBar.Message = Message;
MenuBar.Content = Content;

export { MenuBar };