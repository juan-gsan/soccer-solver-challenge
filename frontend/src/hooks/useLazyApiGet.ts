import { useCallback, useState } from "react";
import { apiGet, ApiError } from "../api/client";

export interface UseLazyApiGetResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (path: string) => Promise<void>;
}

export function useLazyApiGet<T>(): UseLazyApiGetResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (path: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiGet<T>(path);
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Error loading data");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, execute };
}
