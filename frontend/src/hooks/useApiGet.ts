import { useEffect, useRef, useState } from "react";
import { apiGet, ApiError } from "../api/client";

export interface UseApiGetResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApiGet<T>(path: string | null): UseApiGetResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef<number>(0);

  useEffect((): void => {
    if (path === null) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    const currentRequest: number = ++requestId.current;
    setLoading(true);
    setError(null);

    apiGet<T>(path)
      .then((result: T): void => {
        if (currentRequest !== requestId.current) return;
        setData(result);
      })
      .catch((err: unknown): void => {
        if (currentRequest !== requestId.current) return;
        setError(
          err instanceof ApiError ? err.message : "Error al cargar los datos",
        );
        setData(null);
      })
      .finally((): void => {
        if (currentRequest !== requestId.current) return;
        setLoading(false);
      });
  }, [path]);

  return { data, loading, error };
}
