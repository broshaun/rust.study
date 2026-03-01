import { useCallback } from 'react';


export const useGlobalStyle = () => {
  const setCss = useCallback((cssId, inputCss) => {
    const cssKey = `style-${cssId}`;
    let style = document.getElementById(cssKey);
    if (!style) {
      style = document.createElement('style');
      style.id = cssKey;
      document.head.appendChild(style);
      style.innerHTML = inputCss;
    }
  }, [])
  return { setCss };
};