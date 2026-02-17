import React, { useMemo, Children, isValidElement } from 'react';
import { IconCustomColor } from 'components/icon';
import styles from './TextList.module.css';

const RATIO = {
  icon: 0.45,
  label: 0.26,
  tierGap: 0.08,
  itemHeight: 1.4
};

const Items = ({ children = [] }) => null;

const TextList = ({
  size = 46,
  tierGap,
  showDivider = true,
  iconLabelGap = 12,
  children
}) => {

  const parseItems = useMemo(() => {
    let items = [];
    Children.forEach(children, (child) => {
      if (isValidElement(child) && child.type === Items) {
        items = child.props.children || [];
      }
    });
    return items.filter(item => item && item.key && item.display === true);
  }, [children]);

  const computed = useMemo(() => ({
    itemHeight: `${Math.round(size * RATIO.itemHeight)}px`,
    iconSize: Math.round(size * RATIO.icon),
    labelFontSize: `${Math.round(size * RATIO.label)}px`,
    tierGap: tierGap || Math.round(size * RATIO.tierGap),
    iconLabelGap: `${iconLabelGap}px`
  }), [size, tierGap, iconLabelGap]);

  const handleClick = (item) => (e) => {
    e.stopPropagation();
    item.onClick?.(item.key);
  };

  if (!parseItems.length) return null;

  return (
    <div
      className={styles.container}
      style={{
        '--item-height': computed.itemHeight,
        '--icon-size': `${computed.iconSize}px`,
        '--label-font-size': computed.labelFontSize,
        '--icon-label-gap': computed.iconLabelGap
      }}
    >
      {parseItems.map((item, index) => (
        <div
          key={item.key}
          className={`${styles.item} ${
            showDivider && index < parseItems.length - 1 ? styles.divider : ''
          }`}
          style={{ paddingLeft: `${computed.tierGap}px` }}
          onClick={handleClick(item)}
        >
          {item.icon?.name && (
            <div className={styles.icon}>
              <IconCustomColor
                name={item.icon.name}
                color={item.icon.color}
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
  );
};

TextList.Items = Items;

export default TextList;
