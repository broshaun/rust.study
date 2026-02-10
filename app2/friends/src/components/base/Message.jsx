import React from 'react';
import { IconRotate } from '../icon';
import './Message.css'; // Ensure CSS is imported

export const Message = ({ title, content }) => {
  return (
    <div className="message">
      <div className="icon-container">
        <div className="icon-spin">
          <IconRotate name='circle-notch' size={48}/>
        </div>
      </div>
      <div className="message-content">
        <h4 className="message-header">{title}</h4>
        <p className="message-text">{content}</p>
      </div>
    </div>
  );
};
