import { useState, useMemo, useCallback } from '.store/react@18.3.1/node_modules/react';
import './MultiCheckbox.css';

/**
 * 通用多选组件（支持标题、横向/纵向布局）
 * @param {Array} options - 选项列表，格式：[{ label: '', value: '', disabled?: boolean }]
 * @param {Function} onSelect - 选中变化回调，参数：选中值数组 []
 * @param {Array} defaultValue - 默认选中值数组，可选
 * @param {string} layout - 布局方向：horizontal（横向，默认）/ vertical（纵向）
 * @param {string} title - 自定义标题，默认："多选选项"
 */
export const MultiCheckbox = ({
  options = [],
  onSelect,
  defaultValue = [],
  layout = 'horizontal',
  title = '多选选项' // 新增：标题参数，默认值"多选选项"
}) => {
  // 维护选中值状态
  const [selectedValues, setSelectedValues] = useState(defaultValue);

  // 过滤可用选项（排除禁用的）
  const enableOptions = useMemo(() => {
    return options.filter(opt => !opt.disabled);
  }, [options]);

  // 计算全选状态：所有可用选项都被选中
  const isAllSelected = useMemo(() => {
    return enableOptions.every(opt => selectedValues.includes(opt.value));
  }, [selectedValues, enableOptions]);

  // 计算半选状态：部分选项被选中
  const isIndeterminate = useMemo(() => {
    const selectedCount = enableOptions.filter(opt => selectedValues.includes(opt.value)).length;
    return selectedCount > 0 && selectedCount < enableOptions.length;
  }, [selectedValues, enableOptions]);

  // 单个选项点击事件
  const handleOptionChange = useCallback((value, disabled) => {
    if (disabled) return; // 禁用选项不响应

    // 更新选中值
    const newSelected = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value) // 取消选中
      : [...selectedValues, value]; // 新增选中

    setSelectedValues(newSelected);
    // 触发外部回调，返回选中值数组
    onSelect && onSelect(newSelected);
  }, [selectedValues, onSelect]);

  // 全选/取消全选
  const handleAllChange = useCallback(() => {
    let newSelected = [];
    if (isAllSelected) {
      // 取消全选
      newSelected = [];
    } else {
      // 全选可用选项
      newSelected = enableOptions.map(opt => opt.value);
    }

    setSelectedValues(newSelected);
    onSelect && onSelect(newSelected);
  }, [isAllSelected, enableOptions, onSelect]);

  return (
    <div className="multi-checkbox-container">
      {/* 新增：标题区域 */}
      {title && (
        <div className="multi-checkbox-title">
          {title}
        </div>
      )}

      {/* 全选复选框 */}
      <label className="checkbox-item all-select-item">
        <input
          type="checkbox"
          checked={isAllSelected}
          indeterminate={isIndeterminate} // 半选状态
          onChange={handleAllChange}
          className="native-checkbox"
        />
        <span className="checkbox-label">全选</span>
      </label>

      {/* 选项列表 - 根据 layout 动态切换样式类 */}
      <div className={`options-list ${layout === 'horizontal' ? 'horizontal-layout' : 'vertical-layout'}`}>
        {options.map((option) => (
          <label
            key={option.value}
            className={`checkbox-item ${option.disabled ? 'disabled' : ''} ${layout === 'horizontal' ? 'horizontal-item' : ''}`}
          >
            <input
              type="checkbox"
              value={option.value}
              checked={selectedValues.includes(option.value)}
              onChange={() => handleOptionChange(option.value, option.disabled)}
              disabled={option.disabled}
              className="native-checkbox"
            />
            <span className="checkbox-label">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

// 示例使用
const MultiCheckboxDemo = () => {
  // 你的 OPTIONS 配置
  const OPTIONS = [
    { label: '选项1', value: '1' },
    { label: '选项2', value: '2', disabled: true }, // 禁用选项
    { label: '选项3', value: '3' },
    { label: '选项4', value: '4' },
    { label: '选项5', value: '5' },
  ];

  // 外部 onSelect 回调
  const handleSelect = (selectedValues) => {
    console.log('选中的值数组：', selectedValues);
    // 这里可以处理选中后的业务逻辑
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h3>Checkbox 多选示例（默认横向 + 审核状态标题）</h3>
      <MultiCheckbox
        options={OPTIONS}
        defaultValue={['1']} // 默认选中选项1
        onSelect={handleSelect}
        title="审核状态" // 自定义标题：审核状态
        // layout="vertical" // 取消注释切换为纵向布局
      />

      <h3 style={{ marginTop: '20px' }}>Checkbox 多选示例（纵向 + 角色权限标题）</h3>
      <MultiCheckbox
        options={OPTIONS}
        defaultValue={['1']}
        onSelect={handleSelect}
        layout="vertical"
        title="角色权限" // 自定义标题：角色权限
      />

      <h3 style={{ marginTop: '20px' }}>Checkbox 多选示例（无标题）</h3>
      <MultiCheckbox
        options={OPTIONS}
        onSelect={handleSelect}
        title={null} // 隐藏标题
      />
    </div>
  );
};