import { useState, useCallback } from "react";

export function useLoading(initialState: Record<string, boolean> = {}) {
  const [loadingStates, setLoadingStates] = useState(initialState);

  const startLoading = useCallback((key: string) => {
    setLoadingStates(prev => ({ ...prev, [key]: true }));
  }, []);

  const stopLoading = useCallback((key: string) => {
    setLoadingStates(prev => ({ ...prev, [key]: false }));
  }, []);

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const wrapLoading = useCallback(async <T,>(key: string, fn: () => Promise<T>): Promise<T> => {
    startLoading(key);
    try {
      return await fn();
    } finally {
      stopLoading(key);
    }
  }, [startLoading, stopLoading]);

  return { startLoading, stopLoading, isLoading, wrapLoading };
}
