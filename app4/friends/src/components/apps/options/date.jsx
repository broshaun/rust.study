import { InputText } from "components";

/**
 * 日期输入框组件
 * @param {Object} props
 * @param {string} props.label - 输入框标签，默认"开始时间"
 * @param {string|number|Date} props.defaultValue - 默认值（支持时间戳、Date对象、字符串）
 * @param {Function} props.dateChange - 日期变化回调 (date: string) => void
 */
export const InputDate = ({
    label = '时间:',
    defaultValue = '',
    dateChange
}) => {
    // 格式化日期为 YYYY-MM-DD 格式
    const formatDateToYMD = (value) => {
        // 空值直接返回
        if (!value) return '';

        let date;
        // 处理时间戳（秒级/毫秒级）
        if (typeof value === 'number') {
            // 秒级时间戳转毫秒级
            date = new Date(value.toString().length === 10 ? value * 1000 : value);
        } 
        // 处理Date对象
        else if (value instanceof Date) {
            date = value;
        } 
        // 处理字符串
        else if (typeof value === 'string') {
            // 先尝试直接解析
            date = new Date(value);
            // 解析失败则返回空
            if (isNaN(date.getTime())) return '';
        } 
        // 其他类型返回空
        else {
            return '';
        }

        // 验证日期有效性
        if (isNaN(date.getTime())) return '';

        // 格式化为 YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    };

    // 标准化默认值格式
    const normalizedDefaultValue = formatDateToYMD(defaultValue);

    const internalChangeHandler = (e) => {
        const selectedDate = e.target.value;
        if (typeof dateChange === 'function') {
            dateChange(selectedDate);
        }
    };

    return (
        <InputText
            label={label}
            type='date'
            onChange={internalChangeHandler}
            defaultValue={normalizedDefaultValue}
        />
    );
};