import React, { forwardRef, Children, isValidElement } from "react";
import styles from './Grid.module.css';

const toUnit = (v) => {
  if (v == null || v === '') return undefined;
  return typeof v === 'number' ? `${v}px` : v;
};

const alignMap = {
  top: 'start',
  middle: 'center',
  bottom: 'end',
  stretch: 'stretch',
};

const justifyMap = {
  left: 'start',
  center: 'center',
  right: 'end',
  stretch: 'stretch',
};

/**
 * Grid.Item
 *
 * Props
 * @param {number} col       跨几列
 * @param {number} row       跨几行
 * @param {number} colStart  从第几列开始
 * @param {number} rowStart  从第几行开始
 * @param {number|string} padding
 * @param {'left'|'center'|'right'|'stretch'} align
 * @param {'top'|'middle'|'bottom'|'stretch'} vertical
 */
const Item = ({
  children,
  col = 1,
  row = 1,
  colStart,
  rowStart,
  padding = 0,
  align,
  vertical,
  className = '',
  style,
}) => {
  const vars = {
    '--gd-item-col': Math.max(1, Number(col) || 1),
    '--gd-item-row': Math.max(1, Number(row) || 1),
    '--gd-item-col-start': colStart ? Number(colStart) : 'auto',
    '--gd-item-row-start': rowStart ? Number(rowStart) : 'auto',
    '--gd-item-pad': toUnit(padding) || '0px',
    '--gd-item-justify': align
      ? (justifyMap[align] || align)
      : 'var(--gd-item-justify-default)',
    '--gd-item-align': vertical
      ? (alignMap[vertical] || vertical)
      : 'var(--gd-item-align-default)',
    ...style,
  };

  return (
    <div
      className={[styles.item, className].filter(Boolean).join(' ')}
      style={vars}
    >
      {children}
    </div>
  );
};

Item.__GRID_ITEM__ = true;

/**
 * Grid
 *
 * Props
 * @param {number|string} width
 * @param {number|string} height
 * @param {number} columns
 * @param {number|string|Array} rows
 * @param {number|string} gap
 * @param {number|string} columnGap
 * @param {number|string} rowGap
 * @param {number|string} padding
 * @param {'left'|'center'|'right'|'stretch'} justify
 * @param {'top'|'middle'|'bottom'|'stretch'} align
 * @param {boolean} dense
 * @param {boolean} border
 * @param {string} borderColor
 * @param {number|string} borderWidth
 * @param {number|string} radius
 * @param {boolean} panel
 * @param {string} background
 * @param {string} shadow
 * @param {boolean} clip
 */
export const Grid = forwardRef(({
  children,
  width = '100%',
  height,
  columns = 2,
  rows,
  gap = 0,
  columnGap,
  rowGap,
  padding = 0,
  justify = 'stretch',
  align = 'stretch',
  dense = false,

  border = false,
  borderColor,
  borderWidth = 1,
  radius,

  panel = false,
  background,
  shadow,
  clip = false,

  className = '',
  style,
}, ref) => {
  const normalizedColumns = Math.max(1, Number(columns) || 1);

  const rowTemplate = Array.isArray(rows)
    ? rows.map(v => toUnit(v) || 'auto').join(' ')
    : (typeof rows === 'number'
        ? `repeat(${Math.max(1, rows)}, minmax(0, 1fr))`
        : rows || 'auto');

  const vars = {
    '--gd-w': toUnit(width) || '100%',
    '--gd-h': toUnit(height) || 'auto',
    '--gd-columns': `repeat(${normalizedColumns}, minmax(0, 1fr))`,
    '--gd-rows': rowTemplate,
    '--gd-gap': toUnit(gap) || '0px',
    '--gd-col-gap': toUnit(columnGap) || 'var(--gd-gap)',
    '--gd-row-gap': toUnit(rowGap) || 'var(--gd-gap)',
    '--gd-pad': toUnit(padding) || '0px',

    '--gd-justify-items': justifyMap[justify] || justify,
    '--gd-align-items': alignMap[align] || align,

    '--gd-border-width': border ? (toUnit(borderWidth) || '1px') : '0px',
    '--gd-border-color':
      borderColor ||
      'var(--panel-border-color, rgba(var(--text-primary-rgb, 0, 0, 0), 0.12))',
    '--gd-radius': toUnit(radius) || 'var(--radius-main, 16px)',

    '--gd-bg': background || (panel ? 'var(--panel-bg, transparent)' : 'transparent'),
    '--gd-shadow': shadow || (panel ? 'var(--panel-shadow, none)' : 'none'),
    '--gd-backdrop': panel ? 'var(--panel-blur, blur(0px))' : 'blur(0px)',
    '--gd-text-color': 'var(--text-primary, inherit)',
    '--gd-overflow': clip ? 'hidden' : 'visible',

    '--gd-item-justify-default': justifyMap[justify] || justify,
    '--gd-item-align-default': alignMap[align] || align,

    ...style,
  };

  return (
    <div
      ref={ref}
      className={[styles.grid, className].filter(Boolean).join(' ')}
      style={vars}
      data-dense={dense ? 'true' : 'false'}
    >
      {Children.map(children, (child) => {
        if (child == null) return null;

        if (!isValidElement(child)) {
          return <Item>{child}</Item>;
        }

        if (child.type?.__GRID_ITEM__) {
          return child;
        }

        return <Item>{child}</Item>;
      })}
    </div>
  );
});

Grid.Item = Item;

export default Grid;