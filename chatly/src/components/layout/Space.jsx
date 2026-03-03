// Space.jsx - 空格组件
import React from 'react';

// 预设间距类型：small(thinsp)、medium(nbsp)、large(emsp)
const Space = ({ type = 'medium', count = 1 }) => {
  const spaceMap = {
    small: '&thinsp;',
    medium: '&nbsp;',
    large: '&emsp;'
  };
  // 生成对应数量的空格实体
  const spaceHtml = spaceMap[type].repeat(count);
  
  return <span dangerouslySetInnerHTML={{ __html: spaceHtml }} />;
};

export default Space;