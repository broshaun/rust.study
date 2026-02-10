import React from 'react';
import './Divider.css';

/**
 * 复刻 Semantic UI React Divider 组件（零依赖版）
 * @see https://react.semantic-ui.com/components/divider
 * @param {Object} props
 * @param {string} [props.as='div'] - 根元素标签
 * @param {boolean} [props.horizontal] - 水平分隔线（默认）
 * @param {boolean} [props.vertical] - 垂直分隔线
 * @param {string} [props.alignment] - 标签对齐方式：left/right/center（默认center）
 * @param {boolean} [props.clearing] - 清除浮动
 * @param {boolean} [props.disabled] - 禁用态
 * @param {boolean} [props.hidden] - 隐藏分隔线（仅保留间距）
 * @param {boolean} [props.inverted] - 反色样式
 * @param {boolean} [props.section] - 段分隔（更大间距）
 * @param {boolean} [props.fitted] - 贴合（无额外间距）
 * @param {boolean} [props.dashed] - 虚线样式
 * @param {boolean} [props.bold] - 加粗样式
 * @param {React.ReactNode} [props.children] - 分隔线标签文字/图标
 * @param {string} [props.className] - 自定义类名
 * @param {Object} [props.style] - 自定义样式
 * @returns {JSX.Element}
 */
export const Divider = ({
  as = 'div',
  horizontal = true,
  vertical = false,
  alignment = 'center',
  clearing = false,
  disabled = false,
  hidden = false,
  inverted = false,
  section = false,
  fitted = false,
  dashed = false,
  bold = false,
  children,
  className,
  style,
  ...rest
}) => {
  // 原生 JS 拼接动态类名（替代 classnames）
  const buildClassNames = () => {
    // 基础类名
    let classes = ['ui', 'divider'];
    
    // 条件类名（按 Semantic UI 规则拼接）
    if (horizontal) classes.push('horizontal');
    if (vertical) classes.push('vertical');
    if (alignment && children) classes.push(`aligned-${alignment}`);
    if (clearing) classes.push('clearing');
    if (disabled) classes.push('disabled');
    if (hidden) classes.push('hidden');
    if (inverted) classes.push('inverted');
    if (section) classes.push('section');
    if (fitted) classes.push('fitted');
    if (dashed) classes.push('dashed');
    if (bold) classes.push('bold');
    
    // 自定义类名（追加到末尾）
    if (className) classes.push(className);
    
    // 拼接成字符串并去重
    return [...new Set(classes)].join(' ');
  };

  const dividerClasses = buildClassNames();
  const Comp = as; // 自定义根标签

  return (
    <Comp
      className={dividerClasses}
      style={style}
      {...rest}
    >
      {/* 分隔线标签（有子元素时显示） */}
      {children && (
        <span className={`divider-label ${alignment}`}>
          {children}
        </span>
      )}
    </Comp>
  );
};
