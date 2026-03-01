import { useState, useCallback, useId } from '.store/react@18.3.1/node_modules/react'; // 引入 useId
import './SingleRadio.css';

/**
 * 通用单选组件（全自动独立，无需额外配置）
 * @param {Array} options - 选项列表，格式：[{ label: '', value: '', disabled?: boolean }]
 * @param {Function} onSelect - 选中变化回调，参数：选中值（单个字符串）
 * @param {string} defaultValue - 默认选中值，可选
 * @param {string} layout - 布局方向：horizontal（横向，默认）/ vertical（纵向）
 * @param {string} title - 自定义标题，默认："单选选项"
 */
export const SingleRadio = ({
  options = [],
  onSelect,
  defaultValue = '',
  layout = 'horizontal',
  title = '单选选项'
}) => {
  // 核心：React 18+ 内置 useId 生成唯一ID（替代groupKey，全自动）
  const radioGroupId = useId();
  // 拼接唯一的name（确保全局唯一）
  const radioGroupName = `single-radio-group-${radioGroupId}`;

  // 维护选中值状态（单选为单个字符串）
  const [selectedValue, setSelectedValue] = useState(defaultValue);

  // 单个选项点击事件
  const handleOptionChange = useCallback((value, disabled) => {
    if (disabled) return; // 禁用选项不响应

    // 更新选中值
    setSelectedValue(value);
    // 触发外部回调，返回单个选中值
    onSelect && onSelect(value);
  }, [onSelect]);

  return (
    <div className="single-radio-container">
      {/* 标题区域 */}
      {title && (
        <div className="single-radio-title">
          {title}
        </div>
      )}

      {/* 选项列表 */}
      <div className={`radio-options-list ${layout === 'horizontal' ? 'horizontal-layout' : 'vertical-layout'}`}>
        {options.map((option) => (
          <label
            key={option.value}
            className={`radio-item ${option.disabled ? 'disabled' : ''} ${layout === 'horizontal' ? 'horizontal-item' : ''}`}
          >
            <input
              type="radio"
              name={radioGroupName} // 全自动唯一name，无冲突
              value={option.value}
              checked={selectedValue === option.value}
              onChange={() => handleOptionChange(option.value, option.disabled)}
              disabled={option.disabled}
              className="native-radio"
            />
            <span className="radio-label">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

// 你的业务使用代码（完全无需groupKey，直接用）
const RadioDemo = () => {
  const OPTIONS = [
    { label: '未审核', value: 'PENDING' },
    { label: '审核通过', value: 'APPROVED' },
    { label: '审核不通过', value: 'REJECTED' },
    { label: '归档', value: 'ARCHIVED' },
  ];

  const OPTIONS2 = [
    { label: '未知', value: 'unknown' },
    { label: '未婚', value: 'unmarried' },
    { label: '已婚', value: 'married' },
    { label: '离婚', value: 'divorced' },
    { label: '丧偶', value: 'widowed' },
  ];

  return (
    <React.Fragment>
      {/* 零配置，自动独立 */}
      <SingleRadio 
        title='审核状态' 
        options={OPTIONS} 
        onSelect={(value) => { console.log('审核状态：', value) }} 
      />
      <hr style={{ margin: '16px 0' }} /> {/* 替代Divider，避免依赖 */}
      <SingleRadio 
        title='婚姻状态' 
        options={OPTIONS2} 
        onSelect={(value) => { console.log('婚姻状态：', value) }} 
      />
    </React.Fragment>
  );
};