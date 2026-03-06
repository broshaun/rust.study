import React, { useMemo, Children, isValidElement } from 'react';
import { Icon } from 'components/flutter'; // 统一使用我们改造后的 Icon
import styles from './List.module.css';

const RATIO = { icon: 0.45, label: 0.32, tierGap: 0.1, itemHeight: 1.2 };

const List = ({
  size = 46,
  showDivider = true,
  iconLabelGap = 12,
  children
}) => {
  // 1. 直接解析子组件，不进行二次存储，提升性能
  const items = Children.toArray(children).filter(
    child => isValidElement(child) && child.type === List.Items
  );

  const computed = useMemo(() => ({
    itemHeight: `${Math.round(size * RATIO.itemHeight)}px`,
    iconSize: Math.round(size * RATIO.icon),
    labelFontSize: `${Math.round(size * RATIO.label)}px`,
    iconLabelGap: `${iconLabelGap}px`
  }), [size, iconLabelGap]);

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
          </div>
        ))}
      </div>
    </div>
  );
};

// 仅作为声明使用
List.Items = () => null;

export default List;