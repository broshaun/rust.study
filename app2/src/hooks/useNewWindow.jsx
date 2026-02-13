import { useCallback } from 'react';
import { WebviewWindow, getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';

function buildUrl(url, query) {
  if (!query || Object.keys(query).length === 0) return url;

  const params = new URLSearchParams(query).toString();

  return url.includes('?')
    ? `${url}&${params}`
    : `${url}?${params}`;
}

export function useNewWindow() {

  /**
   * 打开窗口（通用）
   *
   * @param {string} label 唯一窗口标识
   * @param {object} options
   * @param {string} options.url 页面路径
   * @param {object} options.query 查询参数
   * @param {string} options.title 标题
   * @param {number} options.width 宽度
   * @param {number} options.height 高度
   * @param {boolean} options.center 是否居中
   */
  const openWindow = useCallback((label, options = {}) => {

    const existing = WebviewWindow.getByLabel(label);

    if (existing) {
      existing.setFocus();
      return existing;
    }

    const {
      url = '/',
      query = {},
      title = '',
      width = 900,
      height = 700,
      center = true,
      resizable = true,
      ...rest
    } = options;

    const fullUrl = buildUrl(url, query);

    const win = new WebviewWindow(label, {
      url: fullUrl,
      title,
      width,
      height,
      center,
      resizable,
      ...rest
    });

    return win;

  }, []);

  /**
   * 关闭窗口
   */
  const closeWindow = useCallback((label) => {
    const win = WebviewWindow.getByLabel(label);
    win?.close();
  }, []);

  /**
   * 关闭当前窗口
   */
  const closeCurrentWindow = useCallback(() => {
    getCurrentWebviewWindow().close();
  }, []);

  return {
    openWindow,
    closeWindow,
    closeCurrentWindow,
  };
}
