// List.jsx - 最终版：浅灰色主题 + 图标无固定色 + 悬浮无背景变化
import React, { useMemo, Children, isValidElement } from 'react';
import { IconCustomColor } from 'components/icon';
import styles from './List.module.css';

// 复用比例配置（适配浅灰主题的视觉比例）
const RATIO = {
  icon: 0.45,
  label: 0.26,
  tierGap: 0.08,
  itemHeight: 1.4
};

// 空子组件（仅作为插槽标识）
const Items = ({ children = [] }) => null;
const Content = ({ children }) => null;

// 核心 List 组件：仅渲染，不处理任何条件逻辑
const List = ({
  size = 46,
  tierGap,
  showDivider = true,
  iconLabelGap = 12,
  children
}) => {
  // 仅解析插槽：不判断是否互斥，有则渲染
  const slotMap = useMemo(() => {
    const result = {
      items: [],       // Items 插槽内容
      content: null,   // Content 插槽内容
      hasItems: false, // 是否传入了 Items
      hasContent: false// 是否传入了 Content
    };

    Children.forEach(children, (child) => {
      if (isValidElement(child)) {
        if (child.type === Items) {
          result.items = Array.isArray(child.props.children) 
            ? child.props.children 
            : [child.props.children];
          result.hasItems = true;
        }
        if (child.type === Content) {
          result.content = child.props.children;
          result.hasContent = true;
        }
      }
    });

    // 过滤有效列表项（仅过滤无效项，不处理显示逻辑）
    result.items = result.items.filter(item => item && item.key && item.display === true);
    return result;
  }, [children]);

  const { items, content, hasItems, hasContent } = slotMap;

  // 计算动态尺寸（保留 TextList 逻辑，适配浅灰主题的视觉比例）
  const computed = useMemo(() => ({
    itemHeight: `${Math.round(size * RATIO.itemHeight)}px`,
    iconSize: Math.round(size * RATIO.icon),
    labelFontSize: `${Math.round(size * RATIO.label)}px`,
    tierGap: tierGap || Math.round(size * RATIO.tierGap),
    iconLabelGap: `${iconLabelGap}px`
  }), [size, tierGap, iconLabelGap]);

  // 点击逻辑：只要有 Items 就触发（显示逻辑由上层控制）
  const handleClick = (item) => (e) => {
    e.stopPropagation();
    item.onClick?.(item.key);
  };

  return (
    <div className={styles.listContainer}>
      {/* 渲染 Items：只要传入了就渲染（显示/隐藏由上层控制） */}
      {hasItems && items.length > 0 && (
        <div
          className={styles.itemsLayer}
          style={{
            '--item-height': computed.itemHeight,
            '--icon-size': `${computed.iconSize}px`,
            '--label-font-size': computed.labelFontSize,
            '--icon-label-gap': computed.iconLabelGap
          }}
        >
          {items.map((item, index) => (
            <div
              key={item.key}
              className={`${styles.item} ${
                showDivider && index < items.length - 1 ? styles.divider : ''
              }`}
              style={{ 
                paddingLeft: `${computed.tierGap}px`,
                // 浅灰主题优化：添加轻微的内边距，提升视觉呼吸感
                paddingRight: `${computed.tierGap}px`
              }}
              onClick={handleClick(item)}
            >
              {item.icon?.name && (
                <div className={styles.icon}>
                  <IconCustomColor
                    name={item.icon.name}
                    // 关键修改：移除强制设置的颜色，让图标使用默认色
                    size={computed.iconSize}
                  />
                </div>
              )}
              <span className={styles.label}>
                {item.icon?.label || ''}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 渲染 Content：只要传入了就渲染（层级在上，覆盖 Items） */}
      {hasContent && (
        <div className={styles.contentLayer}>
          {content}
        </div>
      )}
    </div>
  );
};

// 挂载子组件
List.Items = Items;
List.Content = Content;

export default List;