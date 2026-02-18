// Container.jsx - 支持主题配置的通用容器组件
import React from 'react';
import styles from './Container.module.css';

/**
 * 通用容器组件：默认从上往下垂直排列 + 统一间距 + 滚动条配置 + 主题定制
 * @param {object} props - 组件属性
 * @param {React.ReactNode} props.children - 容器子元素
 * @param {boolean} [props.verticalScroll=false] - 是否开启垂直（上下）滚动条
 * @param {boolean} [props.horizontalScroll=false] - 是否开启水平（左右）滚动条
 * @param {number} [props.gap=16] - 子元素之间的统一间距（px），默认16px
 * @param {string} [props.alignItems='flex-start'] - 水平对齐方式：flex-start/center/flex-end
 * @param {boolean} [props.fullWidth=false] - 子元素是否占满容器宽度
 * @param {string} [props.theme='light-gray'] - 预设主题：light-gray（浅灰，默认）/dark-gray（深灰）/white（纯白）/custom（自定义）
 * @param {object} [props.themeConfig] - 自定义主题配置（theme=custom 时生效）
 * @param {string} [props.themeConfig.bgColor] - 容器背景色
 * @param {string} [props.themeConfig.scrollThumbColor] - 滚动条滑块颜色
 * @param {string} [props.themeConfig.scrollTrackColor] - 滚动条轨道颜色
 * @param {string} [props.themeConfig.scrollThumbHoverColor] - 滚动条滑块悬浮颜色
 * @returns {React.ReactElement} 通用容器组件
 */
const Container = ({
  children,
  verticalScroll = false,
  horizontalScroll = false,
  gap = 16,
  alignItems = 'flex-start',
  fullWidth = false,
  theme = 'light-gray', // 默认浅灰色主题
  themeConfig = {}
}) => {
  // 预设主题配置（核心：浅灰色主题为默认）
  const presetThemes = {
    // 浅灰色主题（默认，适配之前的设计）
    'light-gray': {
      bgColor: '#f9f9f9',
      scrollThumbColor: '#e0e0e0',
      scrollTrackColor: '#f9f9f9',
      scrollThumbHoverColor: '#c0c0c0'
    },
    // 深灰色主题（备用）
    'dark-gray': {
      bgColor: '#1f1f1f',
      scrollThumbColor: '#444444',
      scrollTrackColor: '#282828',
      scrollThumbHoverColor: '#555555'
    },
    // 纯白主题（备用）
    'white': {
      bgColor: '#ffffff',
      scrollThumbColor: '#e5e5e5',
      scrollTrackColor: '#f5f5f5',
      scrollThumbHoverColor: '#d0d0d0'
    },
    // 自定义主题（由 themeConfig 覆盖）
    'custom': themeConfig
  };

  // 获取最终主题配置
  const finalTheme = presetThemes[theme] || presetThemes['light-gray'];

  // 纵向排列核心布局样式 + 主题样式注入
  const layoutStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems,
    gap: `${gap}px`,
    // 注入 CSS 变量（供样式文件使用）
    '--container-bg': finalTheme.bgColor,
    '--scroll-thumb': finalTheme.scrollThumbColor,
    '--scroll-track': finalTheme.scrollTrackColor,
    '--scroll-thumb-hover': finalTheme.scrollThumbHoverColor
  };

  return (
    <div
      className={`${styles.container} ${fullWidth ? styles.fullWidthChildren : ''}`}
      style={layoutStyles}
      data-vertical-scroll={verticalScroll}
      data-horizontal-scroll={horizontalScroll}
      data-theme={theme} // 标记主题，供样式文件扩展
    >
      {children}
    </div>
  );
};
 
export default Container;