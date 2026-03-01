import React from '.store/react@18.3.1/node_modules/react';
import './Segment.css';

/**
 * 原生实现的 Segment 组件（复刻 semantic-ui-react 的 Segment 特性）
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子内容
 * @param {string} [props.className=''] - 自定义类名
 * @param {boolean} [props.padded=true] - 是否带内边距（默认 true）
 * @param {boolean} [props.raised=false] - 是否凸起（阴影增强）
 * @param {boolean} [props.compact=false] - 是否紧凑（减小内边距）
 * @param {boolean} [props.inline=false] - 是否行内显示
 * @returns {React.ReactElement}
 */
export const Segment = ({
  children,
  className = '',
  padded = true,
  raised = false,
  compact = false,
  inline = false,
  ...rest // 透传其他原生属性（如 style、id 等）
}) => {
  // 合并基础样式 + 特性样式 + 自定义类名
  const finalClass = [
    'custom-segment',
    padded && !compact ? 'custom-segment-padded' : '',
    raised ? 'custom-segment-raised' : '',
    compact ? 'custom-segment-compact' : '',
    inline ? 'custom-segment-inline' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={finalClass} {...rest}>
      {children}
    </div>
  );
};
