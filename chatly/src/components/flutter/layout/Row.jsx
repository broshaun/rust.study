import React from 'react';
import styles from './Row.module.css';

export const Row = ({ 
  children, 
  mainAxisAlignment = 'start', 
  crossAxisAlignment = 'center',
  spacing = 0,
  style 
}) => {
  
  const alignmentMap = {
    start: 'flex-start',
    end: 'flex-end',
    center: 'center',
    'space-between': 'space-between'
  };

  const rowStyle = {
    justifyContent: alignmentMap[mainAxisAlignment] || mainAxisAlignment,
    alignItems: crossAxisAlignment,
    gap: `${spacing}px`,
    ...style
  };

  return (
    <div className={styles.row} style={rowStyle}>
      {children}
    </div>
  );
};