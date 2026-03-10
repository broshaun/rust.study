import React, { useState, useRef, useEffect, useMemo } from 'react';
import styles from './ListView.module.css';

export const ListView = ({ itemCount, itemHeight, itemBuilder, buffer = 3 }) => {
  const scrollRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewHeight, setViewHeight] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      setViewHeight(entry.contentRect.height);
    });
    
    observer.observe(el);
    setViewHeight(el.offsetHeight);
    return () => observer.disconnect();
  }, []);

  // 核心计算：计算索引范围
  const { start, end, offset } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
    const end = Math.min(itemCount - 1, Math.floor((scrollTop + viewHeight) / itemHeight) + buffer);
    return { start, end, offset: start * itemHeight };
  }, [scrollTop, viewHeight, itemCount, itemHeight, buffer]);

  return (
    <div 
      ref={scrollRef} 
      className={styles.container} 
      onScroll={e => setScrollTop(e.target.scrollTop)}
    >
      {/* 幽灵占位层 */}
      <div style={{ height: itemCount * itemHeight + 60, pointerEvents: 'none' }} />
      
      {/* 虚拟内容层 */}
      <div className={styles.content} style={{ transform: `translate3d(0, ${offset}px, 0)` }}>
        {Array.from({ length: end - start + 1 }, (_, i) => {
          const index = start + i;
          return (
            <div key={index} style={{ height: itemHeight }}>
              {itemBuilder(index)}
            </div>
          );
        })}
      </div>
    </div>
  );
};