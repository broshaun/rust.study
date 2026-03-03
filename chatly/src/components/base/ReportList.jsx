import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ReportList.module.css';
import { IconItem } from "../icon";


export const ReportList = ({
  reportList = [],
  title = '报表列表',
  viewMode = 'icon',
  maxWidth = 1200,
  paddingX = '20px',
  backIcon = { name: 'arrow-left', size: 36 },
  onBackClick
}) => {
  const navigate = useNavigate();
  const validMode = ['icon', 'list'].includes(viewMode) ? viewMode : 'icon';
  const containerClass = `${styles['report-container']} ${styles[`report-${validMode}-mode`]}`;

  const handleBack = (e) => {
    e.stopPropagation();
    typeof onBackClick === 'function' && onBackClick(e, navigate);
  };

  const handleItemClick = (path) => {
    path?.trim() && navigate(path);
  };

  return (
    <div className={styles['report-page-wrapper']}>
      <div 
        className={styles['report-list']} 
        style={{ maxWidth, padding: `0 ${paddingX}`, minHeight: '100vh' }}
      >
        <header className={styles['report-header']}>
          <div 
            className={styles['report-back-icon-wrapper']}
            onClick={handleBack}
            style={{ cursor: 'pointer' }}
          >
            <IconItem 
              name={backIcon.name} 
              size={backIcon.size}
              style={{ pointerEvents: 'none' }}
            />
          </div>
          <h1 className={styles['report-title']}>{title}</h1>
          <span className={styles['report-count']}>共 {reportList.length} 个报表</span>
        </header>

        <div className={containerClass}>
          {reportList.map((item, idx) => (
            <div 
              key={idx} 
              className={styles['report-item']} 
              onClick={() => handleItemClick(item.path)}
            >
              <IconItem 
                name={item.iconName} 
                size={validMode === 'icon' ? 48 : 32} 
              />
              <span className={styles['report-label']}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};