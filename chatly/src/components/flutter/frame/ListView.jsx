import React, { useState, useRef, useEffect, useMemo } from 'react';
import styles from './ListView.module.css';

/**
 * ListView - 性能极致优化版
 * 仅底部消隐，顶部保持清晰，移除所有非必要计算。
 */
export const ListView = ({ itemCount, itemHeight, itemBuilder, buffer = 3 }) => {
  const scrollRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewHeight, setViewHeight] = useState(0);

  // 1. 初始化与尺寸感知
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    // 初始高度获取
    setViewHeight(el.offsetHeight);

    const observer = new ResizeObserver(entries => {
      const h = entries[0].contentRect.height;
      if (h > 0) setViewHeight(h);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 2. 极简滚动监听 (直接触发，现代引擎对 scrollTop 的处理已足够高效)
  const onScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  // 3. 核心计算逻辑 (使用 useMemo 避免多余重绘)
  const { startIndex, endIndex, offsetTop } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
    const end = Math.min(itemCount - 1, Math.floor((scrollTop + viewHeight) / itemHeight) + buffer);
    return {
      startIndex: start,
      endIndex: end,
      offsetTop: start * itemHeight
    };
  }, [scrollTop, viewHeight, itemCount, itemHeight, buffer]);

  // 4. 构建渲染队列
  const items = [];
  for (let i = startIndex; i <= endIndex; i++) {
    items.push(
      <div key={i} style={{ height: itemHeight, width: '100%' }}>
        {itemBuilder(i)}
      </div>
    );
  }

  return (
    <div className={styles.container} ref={scrollRef} onScroll={onScroll}>
      {/* 幽灵层高度：加上底部缓冲，确保渐隐区不遮挡最后一个 Item */}
      <div className={styles.phantom} style={{ height: itemCount * itemHeight + 60 }} />
      
      <div 
        className={styles.content} 
        style={{ transform: `translateY(${offsetTop}px)` }}
      >
        {items}
      </div>
    </div>
  );
};