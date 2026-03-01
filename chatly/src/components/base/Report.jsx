import React, { Children } from '.store/react@18.3.1/node_modules/react';
import { useNavigate } from 'react-router-dom';
import { IconItem } from 'components/icon';
import './Report.css';

export const Report = ({ children }) => {
  const navigate = useNavigate();
  
  // 获取报表标题
  let title = '';
  Children.forEach(children, (child) => {
    if (child?.type === Report.Head) {
      title = child.props.children || '';
    }
  });

  // 筛选子组件
  let filterChild = null;
  let buttonChild = null;
  Children.forEach(children, (child) => {
    if (child?.type === Report.Filter) filterChild = child;
    if (child?.type === Report.Button) buttonChild = child;
  });

  return (
    <div className="report-container">
      {/* 标题区：报表名称居中 */}
      <div className="report-head">
        <div className="report-back-btn" onClick={() => navigate(-1)}>
          <IconItem name='arrow-uturn-left' />
        </div>
        <h1 className="report-title-text">{title}</h1>
      </div>

      {/* 筛选+按钮行：按钮放在Filter右侧 */}
      <div className="report-filter-btn-row">
        {/* 筛选区 + 按钮组合 */}
        <div className="report-filter-with-btn">
          {filterChild}
          {/* 按钮放在筛选区右侧 */}
          <div className="report-btn-wrapper">
            {buttonChild}
          </div>
        </div>
      </div>

      {/* Record/Table 区域 */}
      {Children.map(children, (child) => {
        if (!child) return null;

        if (child.type === Report.Record) {
          const recordTitle = child.props.title || '报名记录';
          return (
            <section className="report-record">
              <h2 className="report-section-title">{recordTitle}</h2>
              {child.props.children}
            </section>
          );
        }

        if (child.type === Report.Table) {
          const tableTitle = child.props.title || '报名详情';
          return (
            <section className="report-table">
              <h2 className="report-section-title">{tableTitle}</h2>
              {child.props.children}
            </section>
          );
        }

        if ([Report.Head, Report.Filter, Report.Button].includes(child.type)) {
          return null;
        }

        return child;
      })}
    </div>
  );
};

// 子组件定义
Report.Head = ({ children }) => <>{children}</>;
Report.Filter = ({ children }) => <div className="report-filter-content">{children}</div>;
Report.Button = ({ children }) => <>{children}</>;
Report.Record = ({ title, children }) => <>{children}</>;
Report.Table = ({ title, children }) => <>{children}</>;