import React, { useMemo, Children, isValidElement } from 'react';
import { Icon } from 'components/flutter'; 
import styles from './List.module.css';

const RATIO = { icon: 0.42, label: 0.26, tierGap: 0.1, itemHeight: 1.2 };

const List = ({
  size = 46,
  showDivider = true,
  iconLabelGap = 12,
  children
}) => {
  // 1. 先计算尺寸变量（确保后面 map 循环时 computed 已存在）
  const computed = useMemo(() => ({
    itemHeight: `${Math.round(size * RATIO.itemHeight)}px`,
    iconSize: Math.round(size * RATIO.icon),
    labelFontSize: `${Math.round(size * RATIO.label)}px`,
    iconLabelGap: `${iconLabelGap}px`
  }), [size, iconLabelGap]);

  // 2. 解析子组件
  const items = useMemo(() => 
    Children.toArray(children).filter(
      child => isValidElement(child) && child.type === List.Items
    ), [children]
  );

  return (
    <div className={styles.listContainer}>
      <div className={styles.itemsLayer} style={{
        '--item-height': computed.itemHeight,
        '--label-font-size': computed.labelFontSize,
        '--icon-label-gap': computed.iconLabelGap
      }}>
        {items.map((item, index) => (
          <div
            key={item.props.key || index}
            className={`${styles.item} ${showDivider && index < items.length - 1 ? styles.divider : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              item.props.onClick?.(e);
            }}
          >
            {item.props.icon && (
              <div className={styles.icon}>
                <Icon name={item.props.icon} size={computed.iconSize} />
              </div>
            )}
            <span className={styles.label}>{item.props.children}</span>
            
            {/* 增加右侧箭头，增加列表的“可点击”视觉引导 */}
            <div className={styles.arrow}>
               <Icon name="chevron-right" size={computed.iconSize * 0.6} opacity={0.3} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

List.Items = () => null;

export default List;