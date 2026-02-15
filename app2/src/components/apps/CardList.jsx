import React, { useMemo, useState, useCallback } from 'react';
// 关键改动1：导入 CSS Modules，命名为 styles（约定俗成）
import styles from './CardList.module.css';

/* ===== 常量定义（抽离配置）===== */
// 审核状态映射
const AUDIT_STATUS_MAP = {
  PENDING: { label: '未审核', bg: '#fef3c7', color: '#b45309', border: '#fde68a' },
  APPROVED: { label: '审核通过', bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' },
  REJECTED: { label: '审核不通过', bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' },
  ARCHIVED: { label: '归档', bg: '#e5e7eb', color: '#374151', border: '#d1d5db' },
};

// 信息行配置（统一管理字段）
const INFO_ROWS_CONFIG = [
  { key: 'name', label: '姓名：', formatter: v => v },
  { key: 'sex', label: '性别：', formatter: s => s === 'boy' ? '男' : s === 'girl' ? '女' : '未知' },
  { key: 'job', label: '职业：', formatter: v => v },
  { key: 'hometown', label: '家乡：', formatter: v => v },
  { key: 'liveadd', label: '住宅：', formatter: v => v },
  { key: 'birthday', label: '生日：', formatter: formatBirthday },
  { key: 'marital_status_cn', label: '婚姻：', formatter: v => v },
];

/* ===== 工具函数（精简版）===== */
// 空值处理
const formatValue = (v) => v == null || v === '' ? '未填写' : v;

// 生日格式化
function formatBirthday(str) {
  if (!str) return '未填写';
  const d = new Date(str);
  return isNaN(d.getTime()) 
    ? '未填写' 
    : `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, '0')}月${String(d.getDate()).padStart(2, '0')}日`;
}

// 时间戳格式化
const formatTime = (ts) => {
  if (!ts) return '未知';
  // 核心修复：时间戳单位兼容（部分ts为微秒，需转换为毫秒）
  const msTs = ts > 1e12 ? ts / 1000 : ts;
  return new Date(msTs).toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  });
};

/**
 * CardList 名片列表组件
 * @param {Object} props 
 * @param {Object} props.datas - { total, detail } 数据源
 * @param {number} props.pageSize - 每页条数，默认10
 * @param {Function} props.onPageChange - 翻页回调（仅点击翻页时触发）
 * @param {Function} props.onSelect - 卡片点击回调
 */
export const CardList = ({
  datas,
  pageSize = 10,
  onPageChange,
  onSelect,
}) => {
  // 解构数据
  const { total = 0, detail = [] } = datas || {};
  const list = useMemo(() => detail, [detail]);
  
  // 分页状态（仅初始化一次）
  const [page, setPage] = useState(1);
  const totalPage = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  // 渲染审核标签（精简版）
  const renderAuditTag = useCallback((status) => {
    const cfg = AUDIT_STATUS_MAP[status];
    return cfg ? (
      // 关键改动2：替换类名为 styles.auditTag
      <span className={styles.auditTag} style={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`
      }}>
        {cfg.label}
      </span>
    ) : null;
  }, []);

  // 构建信息行（基于配置）
  const buildInfoRows = useCallback((item) => {
    return INFO_ROWS_CONFIG.map(({ key, label, formatter }) => ({
      label,
      value: formatValue(formatter(item[key]))
    }));
  }, []);

  // 翻页处理（仅点击时触发 onPageChange）
  const handlePageChange = useCallback((newPage) => {
    if (newPage < 1 || newPage > totalPage || newPage === page) return;
    setPage(newPage);
    onPageChange?.(newPage); // 仅点击时触发
  }, [page, totalPage, onPageChange]);

  // 上一页/下一页
  const handlePrev = useCallback(() => handlePageChange(page - 1), [page, handlePageChange]);
  const handleNext = useCallback(() => handlePageChange(page + 1), [page, handlePageChange]);

  return (
    // 关键改动3：批量替换类名，全部改为 styles.xxx
    <div className={styles.container}>
      {/* 头部 */}
      <div className={styles.header}>
        <h2>名片列表</h2>
        <span className={styles.totalCount}>共 {total} 条 · 第 {page} / {totalPage} 页</span>
      </div>

      {/* 卡片列表 */}
      <div className={styles.grid}>
        {list.map((item) => (
          <div key={item.id} className={styles.card} onClick={() => onSelect?.(item)}>
            {renderAuditTag(item.audit_status)}
            
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{formatValue(item.name)}</h3>
              <div className={styles.cardDivider} />
            </div>

            {/* 主体：响应式布局，宽足够时并列，不足时上下排列 */}
            <div className={styles.cardBody}>
              <div className={styles.cardPhoto}>
                {item.file_name ? (
                  <img src={item.file_name} alt="头像" />
                ) : (
                  <div className={styles.photoPlaceholder}>无照片</div>
                )}
              </div>

              <div className={styles.cardInfo}>
                {buildInfoRows(item).map((r, idx) => (
                  <div key={idx} className={styles.cardRow}>
                    <span className={styles.cardLabel}>{r.label}</span>
                    <span className={styles.cardValue}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.cardDescription}>
              <div className={styles.descLabel}>自我介绍</div>
              <div className={styles.descBox}>{formatValue(item.description)}</div>
            </div>

            <div className={styles.cardFooter}>
              <span className={styles.updateTime}>更新时间：{formatTime(item.update_time)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 翻页按钮 */}
      <div className={styles.pagination}>
        <button 
          className={styles.paginationButton} 
          onClick={handlePrev} 
          disabled={page === 1}
        >
          上一页
        </button>
        <span className={styles.paginationText}>{page} / {totalPage}</span>
        <button 
          className={styles.paginationButton} 
          onClick={handleNext} 
          disabled={page === totalPage}
        >
          下一页
        </button>
      </div>
    </div>
  );
};

// 示例演示组件
export const CardListDemo = () => {
  // 接口数据（精简重复数据，保留核心结构）
  const apiData = {
    "total": 13,
    "detail": Array(13).fill().map((_, idx) => ({
      "id": idx + 1,
      "update_time": 1769082066821887 + idx * 1000000,
      "user_id": idx % 2,
      "name": ["小二", "李四", "王五"][idx % 3],
      "sex": ["boy", "girl", "unknown"][idx % 3],
      "job": ["警察", "自由职业者", "程序员"][idx % 3],
      "hometown": idx % 3 === 1 ? "北京市朝阳区" : (idx % 3 === 2 ? "上海市浦东新区" : null),
      "liveadd": idx % 3 === 1 ? "北京市海淀区" : (idx % 3 === 2 ? "上海市徐汇区" : null),
      "liveadd_code": "110101",
      "hometown_code": "110101",
      "birthday": ["2021-09-22 00:00:00", "1990-05-15 00:00:00", "1995-12-01 00:00:00"][idx % 3],
      "description": ["本人从事公安工作5年，熟悉各类案件办理流程，具备较强的沟通协调能力和应急处置能力。", "从事设计行业多年，擅长UI/UX设计、平面设计，拥有丰富的项目落地经验，注重用户体验与视觉美感的平衡。", "专注于前端开发领域，熟练掌握React、Vue等框架，具备独立搭建项目和解决复杂问题的能力，热爱技术创新与学习。"][idx % 3],
      "image_id": 0,
      "marital_status": "unknown",
      "marital_status_cn": "未知",
      "audit_status": ["APPROVED", "PENDING", "REJECTED"][idx % 3],
      "audit_status_cn": ["审核通过", "未审核", "审核不通过"][idx % 3],
      "file_name": null
    })),
    "heads": [
      { "key": "name", "title": "姓名" },
      { "key": "sex", "title": "性别" },
      { "key": "job", "title": "工作" },
      { "key": "hometown", "title": "家乡" },
      { "key": "liveadd", "title": "住宅" },
      { "key": "birthday", "title": "生日" },
      { "key": "description", "title": "自我介绍" },
      { "key": "marital_status_cn", "title": "婚姻状态" },
      { "key": "audit_status_cn", "title": "审核状态" }
    ]
  };

  return (
    <CardList 
      pageSize={3} 
      datas={apiData} 
      onPageChange={(page) => console.log('选中页面:', page)} 
      onSelect={(row) => console.log('选中的 row 数据:', row)} 
    />
  );
};