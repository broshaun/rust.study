import { useLocalStorage } from "@mantine/hooks";

/**
 * 全局 apiBase（统一入口）
 * - defaultValue 固定为 ""
 * - 业务层只从这里拿 apiBase，不要重复 useLocalStorage("apiBase")
 */
export function useApiBase() {
  const [apiBase, setApiBase] = useLocalStorage({ key: "apiBase", defaultValue: "http://192.168.2.2:5015" });
  return { apiBase: apiBase || "", setApiBase };
}


export function useImgApiBase(path = "") {
  const [imgBase, setImgBase] = useLocalStorage({
    key: "imgBase",
    defaultValue: "http://192.168.2.2:9000",
  });

  const base = imgBase || "";

  const joinPath = (subPath = "") => {
    const b = base.endsWith("/") ? base.slice(0, -1) : base;
    const p = path.startsWith("/") ? path : `/${path}`;
    const s = subPath.startsWith("/") ? subPath : `/${subPath}`;
    return `${b}${p}${s}`;
  };

  return { imgBase: base, joinPath, setImgBase };
}