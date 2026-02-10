import React, { useState, useMemo, useCallback, Children, isValidElement } from 'react';
import styles from './SimpleTable.module.css';

// ---------------------- 静态子组件：Heads ----------------------
const Heads = ({ data = [] }) => {
  return null;
};

// ---------------------- 静态子组件：Detail ----------------------
const Detail = ({ data = [], onTableRowSelect }) => {
  return null;
};

// ---------------------- 静态子组件：Page ----------------------
const Page = ({ total = 0, size = 10, currentPage = 1, onPageChange }) => {
  return null;
};

// ---------------------- 主组件：SimpleTable（纯文字分页：共？条数据 | 上一页｜第？页｜下一页） ----------------------
export const SimpleTable = ({ children }) => {
  const [tableHeads, setTableHeads] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null); // 选中行状态，初始为 null
  const [rowSelectCallback, setRowSelectCallback] = useState(() => () => {});
  const [paginationConfig, setPaginationConfig] = useState({
    total: 0,
    size: 10,
    currentPage: 1,
    onPageChange: () => {},
    hasPagination: false
  });

  // ---------------------- 解析子组件数据 ----------------------
  useMemo(() => {
    if (!children) return;

    let hasPagination = false;
    let tempRowSelect = () => {};

    Children.forEach(children, (child) => {
      if (!isValidElement(child)) return;

      if (child.type === Heads) {
        const headsData = child.props.data || [];
        setTableHeads(Array.isArray(headsData) ? headsData : []);
        return;
      }

      if (child.type === Detail) {
        const detailData = child.props.data || [];
        tempRowSelect = child.props.onTableRowSelect ?? (() => {});
        if (typeof tempRowSelect !== 'function') {
          tempRowSelect = () => {};
        }

        setTableData(Array.isArray(detailData) ? detailData : []);
        return;
      }

      if (child.type === Page) {
        const { total, size, currentPage, onPageChange } = child.props;
        setPaginationConfig({
          total: Number(total) || 0,
          size: Number(size) || 10,
          currentPage: Number(currentPage) || 1,
          onPageChange: onPageChange ?? (() => {}),
          hasPagination: true
        });
        hasPagination = true;
        return;
      }
    });

    setRowSelectCallback(() => tempRowSelect);
    setPaginationConfig(prev => ({ ...prev, hasPagination }));
  }, [children]);

  // ---------------------- 分页逻辑（保留边界判断，移除数字页码相关） ----------------------
  const { total, size, currentPage, onPageChange, hasPagination } = paginationConfig;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / size)), [total, size]);

  const handlePageChange = useCallback((targetPage) => {
    if (targetPage < 1 || targetPage > totalPages) return;
    
    setPaginationConfig(prev => ({ ...prev, currentPage: targetPage }));
    if (typeof onPageChange === 'function') {
      onPageChange(targetPage);
    }
  }, [totalPages, onPageChange]);

  // ---------------------- 生成分页项（核心修改：纯文字布局，删除数字页码） ----------------------
  const paginationItems = useMemo(() => {
    const items = [];

    // 1. 上一页（文字按钮）
    items.push(
      <span
        key="prev"
        className={`
          ${styles.paginationTextItem} 
          ${currentPage === 1 ? styles.paginationTextDisabled : ''}
        `}
        onClick={() => handlePageChange(currentPage - 1)}
      >
        上页
      </span>
    );

    // 2. 分隔符 + 当前页码（文字展示）
    items.push(
      <span key="page-sep1" className={styles.paginationTextSep}>｜</span>
    );
    items.push(
      <span key="current-page" className={styles.paginationTextCurrent}>
        第 {currentPage} 页
      </span>
    );

    // 3. 分隔符 + 下一页（文字按钮）
    items.push(
      <span key="page-sep2" className={styles.paginationTextSep}>｜</span>
    );
    items.push(
      <span
        key="next"
        className={`
          ${styles.paginationTextItem} 
          ${currentPage === totalPages ? styles.paginationTextDisabled : ''}
        `}
        onClick={() => handlePageChange(currentPage + 1)}
      >
        下页
      </span>
    );

    return items;
  }, [currentPage, totalPages, handlePageChange]);

  // ---------------------- 行选中处理（核心修改：实现点击同一行取消选中） ----------------------
  const handleRowSelect = useCallback((row) => {
    // 核心逻辑：判断当前点击的行是否与已选中的行一致（通过 id 唯一标识）
    const isSameRow = selectedRow?.id === row.id;

    if (isSameRow) {
      // 1. 同一行：取消选中，清空 selectedRow
      setSelectedRow(null);
      // 可选：取消选中时也触发回调，传递 null 标识取消
      if (typeof rowSelectCallback === 'function') {
        rowSelectCallback(null);
      }
    } else {
      // 2. 不同行：设置为当前行，保持选中状态
      setSelectedRow(row);
      if (typeof rowSelectCallback === 'function') {
        rowSelectCallback(row);
      }
    }
  }, [rowSelectCallback, selectedRow]); // 依赖 selectedRow，确保获取最新选中状态

  // ---------------------- 渲染 ----------------------
  return (
    <div className={styles.wrapper}>
      {/* 分页容器：纯文字布局（左侧共？条数据，右侧上一页｜第？页｜下一页） */}
      {hasPagination && (
        <div className={styles.paginationContainer}>
          {/* 左侧：共？条数据 */}
          <div className={styles.paginationInfo}>
            共 {total} 条
          </div>
          {/* 右侧：纯文字分页按钮组 */}
          <div className={styles.paginationMenuText}>
            {paginationItems}
          </div>
        </div>
      )}

      {/* 表格滚动容器 */}
      <div className={styles.scrollContainer}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.theadTr}>
              {tableHeads.map((head, index) => (
                <th 
                  key={head.key} 
                  className={`
                    ${styles.th} 
                    ${index === tableHeads.length - 1 ? styles.thLast : ''}
                  `}
                >
                  {head.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.length > 0 ? (
              tableData.map((row, index) => (
                <tr
                  key={`row-${row.id || index}`}
                  className={`
                    ${styles.tbodyTr} 
                    {/* 仅当 selectedRow 存在且与当前行 id 一致时，添加激活样式（颜色加深） */}
                    ${selectedRow?.id === row.id ? styles.tbodyTrActive : ''}
                  `}
                  onClick={() => handleRowSelect(row)}
                  onMouseEnter={(e) => e.currentTarget.classList.add(styles.tbodyTrHover)}
                  onMouseLeave={(e) => e.currentTarget.classList.remove(styles.tbodyTrHover)}
                >
                  {tableHeads.map((head, idx) => {
                    const cellValue = row[head.key] ?? '-';
                    return (
                      <td 
                        key={head.key} 
                        className={`
                          ${styles.td} 
                          ${idx === tableHeads.length - 1 ? styles.tdLast : ''}
                        `}
                      >
                        {cellValue}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={tableHeads.length} 
                  className={`${styles.td} ${styles.tdCenterAligned}`}
                >
                  暂无数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 挂载子组件到主组件上
SimpleTable.Heads = Heads;
SimpleTable.Detail = Detail;
SimpleTable.Page = Page;