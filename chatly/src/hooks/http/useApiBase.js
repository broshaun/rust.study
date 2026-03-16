import { useStore } from "@/hooks/db";

export function useApiBase() {
  const [apiBase, setApiBase] = useStore(
    "apiBase",
    "http://103.186.108.161:5015"
  );

  return { apiBase, setApiBase };
}