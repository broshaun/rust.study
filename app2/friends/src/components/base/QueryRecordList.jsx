import React, { useState } from 'react';
import './QueryRecordList.css';

// ✅ 新增 onDown 回调参数，调用方式：records / onSelect / onDelete / onDown
export const QueryRecordList = ({ records = [], onSelect, onDelete, onDown }) => {
  const [activeId, setActiveId] = useState('');
  const [activeDetail, setActiveDetail] = useState(null);

  // 行选中逻辑
  const handleSelect = (record) => {
    setActiveId(record._id);
    setActiveDetail(record);
    typeof onSelect === 'function' && onSelect(record);
  };

  // 删除逻辑
  const handleDelete = (record, e) => {
    e.stopPropagation();
    typeof onDelete === 'function' && onDelete(record);
    if(record._id === activeId){
      setActiveDetail(null);
      setActiveId('');
    }
  };

  // ✅ 新增：下载按钮点击逻辑 - 触发父组件onDown回调，返回当前选中record
  const handleDownload = (e) => {
    e.stopPropagation();
    if(activeDetail && typeof onDown === 'function'){
      onDown(activeDetail);
    }
  };

  // 格式化时间
  const formatQueryTime = (time) => {
    return time ? time.split('.')[0] : '未知时间';
  };

  // 空数据兜底
  if (records.length === 0) {
    return (
      <div className="record-empty-wrap">
        <div className="record-empty">暂无查询记录</div>
      </div>
    );
  }

  return (
    <div className="record-list-detail-container">
      {/* 左侧 50% - 查询记录列表 */}
      <div className="record-list-wrap">
        <div className="query-record-list">
          {records.map((record) => {
            const isActive = record._id === activeId;
            return (
              <div
                key={record._id}
                className={`record-item ${isActive ? 'active' : ''}`}
                onClick={() => handleSelect(record)}
              >
                <div className="record-basic">
                  <div className="query-time">{formatQueryTime(record.query_info?.query_time)}</div>
                  <div className="record-actions">
                    <span className="data-count">{record.query_info?.data_count || 0} 条</span>
                    <span 
                      className="delete-btn"
                      onClick={(e) => handleDelete(record, e)}
                      title="删除该条记录"
                    >
                      删除
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 右侧 50% - 记录详情 */}
      <div className="record-detail-wrap">
        <div className="detail-inner">
          {/* ✅ 核心修改1：标题改为【查询条件参数】+ 右侧靠右下载按钮 */}
          <div className="detail-title-wrap">
            <div className="detail-title">执行结果</div>
            <span 
              className="download-btn"
              onClick={handleDownload}
              title="下载当前查询条件数据"
              disabled={!activeDetail}
            >
              下载
            </span>
          </div>

          {!activeDetail ? (
            <div className="detail-empty">暂无选中的查询记录</div>
          ) : (
            <>
              <div className="detail-item">
                <div className="detail-label">查询时间：</div>
                <div className="detail-content">{formatQueryTime(activeDetail.query_info?.query_time)}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">查询条数：</div>
                <div className="detail-content">{activeDetail.query_info?.data_count || 0} 条</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">筛选参数：</div>
                <div className="detail-content">
                  {activeDetail.parameter && Object.keys(activeDetail.parameter).length > 0 ? (
                    // ✅ 核心修改2：最多展示5条参数，使用slice(0,5)截取
                    Object.entries(activeDetail.parameter).slice(0,5).map(([k, v]) => (
                      <div key={k} className="param-item">
                        <span className="param-key">{k}</span>
                        <span className="param-separator">|</span>
                        <span className="param-value">{String(v)}</span>
                      </div>
                    ))
                  ) : (
                    <span>无筛选参数</span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};