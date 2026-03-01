import React, { useMemo, Children, isValidElement } from '.store/react@18.3.1/node_modules/react';
import { IconCustomColor } from 'components/icon';
import styles from './List.module.css';

// 复用比例配置（适配浅灰主题的视觉比例）
const RATIO = {
  icon: 0.45,
  label: 0.26,
  tierGap: 0.08,
  itemHeight: 1.4
};

// 核心 List 组件：支持任意数量的 List.Items
const List = ({
  size = 46,
  tierGap,
  showDivider = true,
  iconLabelGap = 12,
  children
}) => {
  // 解析所有 List.Items 子组件（无数量限制）
  const items = useMemo(() => {
    // 1. 遍历所有子节点，筛选出 List.Items 类型的元素
    // 2. 不做任何数量过滤，有多少解析多少
    return Children.toArray(children)
      .filter(child => isValidElement(child) && child.type === List.Items)
      .map((child, index) => {
        const { 
          icon, 
          onClick, 
          children: label, 
          key = `list_item_${index}` // 自动生成key，也支持手动传
        } = child.props;
        
        return {
          key,
          display: true, // 所有项都显示，无隐藏逻辑
          icon: icon ? { name: icon } : null, // 兼容无icon的情况
          label: label || '', // 标签文字（无则为空）
          onClick // 点击事件（无则不触发）
        };
      });
  }, [children]);

  // 计算动态尺寸（保留原有逻辑，不影响数量）
  const computed = useMemo(() => ({
    itemHeight: `${Math.round(size * RATIO.itemHeight)}px`,
    iconSize: Math.round(size * RATIO.icon),
    labelFontSize: `${Math.round(size * RATIO.label)}px`,
    tierGap: tierGap || Math.round(size * RATIO.tierGap),
    iconLabelGap: `${iconLabelGap}px`
  }), [size, tierGap, iconLabelGap]);

  // 点击逻辑（每个项独立触发，无数量限制）
  const handleClick = (item) => (e) => {
    e.stopPropagation();
    item.onClick?.(e); // 传递事件对象，不限制触发次数
  };

  return (
    <div className={styles.listContainer}>
      {/* 渲染所有解析到的列表项（有多少渲染多少） */}
      {items.length > 0 && (
        <div
          className={styles.itemsLayer}
          style={{
            '--item-height': computed.itemHeight,
            '--icon-size': `${computed.iconSize}px`,
            '--label-font-size': computed.labelFontSize,
            '--icon-label-gap': computed.iconLabelGap
          }}
        >
          {/* 遍历所有items，无数量上限 */}
          {items.map((item, index) => (
            <div
              key={item.key}
              className={`${styles.item} ${
                // 分隔线：除了最后一项，其他都显示（无论数量多少）
                showDivider && index < items.length - 1 ? styles.divider : ''
              }`}
              style={{ 
                paddingLeft: `${computed.tierGap}px`,
                paddingRight: `${computed.tierGap}px`
              }}
              onClick={handleClick(item)}
            >
              {/* 图标：有则显示，无则不渲染 */}
              {item.icon?.name && (
                <div className={styles.icon}>
                  <IconCustomColor
                    name={item.icon.name}
                    size={computed.iconSize}
                  />
                </div>
              )}
              {/* 标签文字：无则为空，不影响布局 */}
              <span className={styles.label}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 定义 Items 子组件（仅作为传参载体，无渲染逻辑，无数量限制）
List.Items = ({ icon, onClick, children, key }) => null;

export default List;