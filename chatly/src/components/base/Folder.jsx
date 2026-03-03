import React from 'react';
import { IconItemHoverScale, IconItem } from "../icon";
import './Folder.css';


export const Folder = ({
  folderData = [
    {
      label: '默认图标',
      iconName: 'home',
      onClick: () => { console.log('点击回调') }
    }
  ],
  title = '应用中心',
  viewMode = 'icon',
  maxWidth = 1200,
  paddingX = '20px',
  homeJumpUrl = '' // 语义化参数名：主页跳转地址，默认空（不跳转）
}) => {
  const validViewMode = ['icon', 'list'].includes(viewMode) ? viewMode : 'icon';

  // 条件跳转：仅当 homeJumpUrl 有值时才执行跳转
  const handleGoHome = () => {
    // 校验值是否有效（非空、非空格）
    if (homeJumpUrl && homeJumpUrl.trim()) {
      window.open(homeJumpUrl, '_self');
    }
    // 无值时不执行任何操作
  };

  return (
    <div className="folder-outer-wrapper" style={{ paddingLeft: paddingX, paddingRight: paddingX, position: 'relative', minHeight: '100vh' }}>
      {/* 左上角主页图标：无跳转地址时，光标恢复默认，无点击反馈 */}
      <div
        className="folder-home-icon"
        onClick={handleGoHome}
        style={{
          cursor: homeJumpUrl && homeJumpUrl.trim() ? 'pointer' : 'default'
        }}
      >
        <IconItem name='home' size={24} />
      </div>

      <div className="folder-center-container" style={{ maxWidth: `${maxWidth}px`, margin: '0 auto', paddingTop: '80px' }}>
        <div className="folder-header">
          <div className="folder-title">{title}</div>
          <div className="folder-subtitle">共 {folderData.length} 个应用</div>
        </div>

        <div className={`folder-container ${validViewMode}-mode`}>
          {folderData.map((item, index) => (
            <div
              key={index}
              className={`folder-item ${validViewMode}-item`}
              onClick={item.onClick}
              style={{ cursor: item.onClick ? 'pointer' : 'default' }}
            >
              <IconItemHoverScale
                name={item.iconName}
                size={validViewMode === 'icon' ? 48 : 32}
                scaleRatio={1.5}
              />
              <span className="folder-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};