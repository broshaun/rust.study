import React, { useEffect, useState, useRef } from 'react';
import styles from './TrueWaterfall.module.css';

// 组件默认兜底数据
const defaultApiData = {
  "total": 0,
  "detail": []
};

/**
 * 双列瀑布流图片展示组件（无任何标题、父容器滚动、CSS Modules、精简优化）
 * @param {object} apiData - 外部传入的接口数据（格式：{total, detail}）
 * @param {function} onSelect - 卡片点击回调函数，参数为点击的item数据
 * @returns {JSX.Element} 精简版瀑布流组件
 */
export const TrueWaterfall = ({ apiData, onSelect }) => {
  const [imageList, setImageList] = useState([]);

  // 初始化数据：适配接口格式，精简判断逻辑
  useEffect(() => {
    const targetData = apiData || defaultApiData;
    setImageList(Array.isArray(targetData.detail) ? targetData.detail : []);
  }, [apiData]);

  // 判断是否有有效图片路径
  const hasValidImage = (fileName) => !!fileName && typeof fileName === 'string' && fileName.trim() !== '';

  // 补全图片路径（可根据项目路径调整）
  const getImageUrl = (fileName) => {
    const baseUrl = '/static/imgs/';
    return fileName.startsWith('/') ? fileName : `${baseUrl}${fileName}`;
  };

  // 优化图片展示：防止变形/溢出
  const optimizeImageDisplay = (imgElement) => {
    if (imgElement) {
      imgElement.style.objectFit = 'contain';
      imgElement.style.maxWidth = '100%';
      imgElement.style.maxHeight = '100%';
    }
  };

  // 处理卡片点击事件
  const handleCardClick = (item) => {
    if (typeof onSelect === 'function') onSelect(item);
  };

  // 图片卡片子组件（精简，无冗余逻辑）
  const ImageCard = ({ item }) => {
    const imgRef = useRef(null);
    const showImage = hasValidImage(item.file_name);

    // 图片加载后优化展示
    useEffect(() => {
      if (imgRef.current) {
        imgRef.current.onload = () => optimizeImageDisplay(imgRef.current);
        optimizeImageDisplay(imgRef.current);
      }
    }, [item.file_name]);

    return (
      <div className={styles.waterfallItem} onClick={() => handleCardClick(item)}>
        {showImage && (
          <div className={styles.imgBox}>
            <img
              ref={imgRef}
              src={getImageUrl(item.file_name)}
              alt={`图片-${item.id || '未知'}`}
              className={styles.waterfallImg}
              onError={(e) => { e.target.parentElement.style.display = 'none'; }}
            />
          </div>
        )}
        <div className={styles.descBox}>
          <div className={styles.descTime}>{item.create_time || '未知时间'}</div>
          {item.describe || '无描述信息'}
        </div>
      </div>
    );
  };

  // 最终渲染：无任何标题，仅核心瀑布流内容
  return (
    <div className={styles.parentContainer}>
      <div className={styles.waterfallContainer}>
        {imageList.length === 0 ? (
          <div className={styles.emptyTip}>暂无图片数据</div>
        ) : (
          <div className={styles.waterfall}>
            {imageList.map(item => (
              <ImageCard key={item.id || Math.random()} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};