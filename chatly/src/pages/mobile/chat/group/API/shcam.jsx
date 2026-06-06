/**
 * 格式化并校验接口数据
 * @param {Object} apiData - 接口原始数据
 * @returns {Object} 格式化后的安全数据
 */
function formatApiData(apiData) {
  // 1. 定义字段白名单 + 类型规则 + 默认值
  const rules = {
    id: { type: 'number', default: 0 },
    name: { type: 'string', default: '' },
    age: { type: 'number', default: null },
    isActive: { type: 'boolean', default: false },
  };

  const result = {};

  // 2. 遍历规则，只保留白名单字段，校验类型
  Object.keys(rules).forEach(key => {
    const rule = rules[key];
    let value = apiData[key];

    // 类型不匹配 → 使用默认值
    if (typeof value !== rule.type) {
      value = rule.default;
    }

    result[key] = value;
  });

  return result;
}

// ============= 使用 =============
const rawData = {
  id: 123,
  name: '张三',
  age: '25', // 类型错误
  isActive: true,
  extraField: '多余字段', // 会被过滤
};

const safeData = formatApiData(rawData);
console.log(safeData);
// 输出：{ id: 123, name: '张三', age: null, isActive: true }