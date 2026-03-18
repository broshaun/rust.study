import React, { useMemo, Children, isValidElement } from 'react';
import { Icon } from 'components/flutter';
import styles from './List.module.css';

const RATIO = {
  icon: 0.42,
  label: 0.26,
  arrow: 0.26,
  itemHeight: 1.2
};

const List = ({
  size = 46,
  showDivider = true,
  iconLabelGap = 12,
  children,
  inset = true,
  arrow = true,
  blend = 'surface' // surface | soft | clear
}) => {
  const computed = useMemo(
    () => ({
      itemHeight: `${Math.round(size * RATIO.itemHeight)}px`,
      iconSize: Math.round(size * RATIO.icon),
      arrowSize: Math.round(size * RATIO.arrow),
      labelFontSize: `${Math.round(size * RATIO.label)}px`,
      iconLabelGap: `${iconLabelGap}px`
    }),
    [size, iconLabelGap]
  );

  const items = useMemo(
    () =>
      Children.toArray(children).filter(
        child => isValidElement(child) && child.type === List.Items
      ),
    [children]
  );

  return (
    <div
      className={styles.listContainer}
      data-inset={inset ? 'true' : 'false'}
      data-blend={blend}
      style={{
        '--item-height': computed.itemHeight,
        '--label-font-size': computed.labelFontSize,
        '--icon-label-gap': computed.iconLabelGap,
        '--list-icon-size': `${computed.iconSize}px`,
        '--list-arrow-size': `${computed.arrowSize}px`
      }}
    >
      <div className={styles.itemsLayer}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const clickable = typeof item.props.onClick === 'function';

          return (
            <div
              key={item.key ?? index}
              className={[
                styles.item,
                showDivider && !isLast ? styles.divider : '',
                clickable ? styles.clickable : ''
              ].filter(Boolean).join(' ')}
              onClick={(e) => {
                e.stopPropagation();
                item.props.onClick?.(e);
              }}
            >
              {item.props.icon ? (
                <div className={styles.icon}>
                  <Icon name={item.props.icon} size={computed.iconSize} />
                </div>
              ) : (
                <div className={styles.iconPlaceholder} />
              )}

              <span className={styles.label}>{item.props.children}</span>

              {arrow && (
                <div className={styles.arrow}>
                  <Icon name="chevron-right" size={computed.arrowSize} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

List.Items = () => null;

export default List;