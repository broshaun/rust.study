import { useLocalStorage } from "@mantine/hooks";

/**
 * 核心：安全拼接路径片段
 * 确保相邻片段之间有且仅有一个 /
 */
const safeJoin = (...parts) => {
  return parts
    .filter(Boolean)                         // 过滤掉 undefined 或空字符串
    .map((p, i) => {
      let segment = p.toString();
      if (i > 0) segment = segment.replace(/^\/+/, "");       // 除了第一段，去掉开头的斜杠
      if (i < parts.length - 1) segment = segment.replace(/\/+$/, ""); // 除了最后一段，去掉结尾的斜杠
      return segment;
    }).join("/");
};

export function useApiBase(path = "") {
  const [apiBase, setApiBase] = useLocalStorage({ key: "apiBase", defaultValue: "http://192.168.2.2:5015" });
  const base = apiBase || "";
  const joinPath = (subPath = "") => safeJoin(base, path, subPath);
  return { apiBase: base, setApiBase, joinPath };
}

export function useImgApiBase(path = "") {
  const [imgBase, setImgBase] = useLocalStorage({ key: "imgBase", defaultValue: "http://192.168.2.2:9000" });
  const base = imgBase || "";
  const joinPath = (subPath = "") => safeJoin(base, path, subPath);
  return { imgBase: base, setImgBase, joinPath };
}