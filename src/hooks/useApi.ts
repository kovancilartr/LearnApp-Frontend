import { useState, useCallback } from 'react';
import { ApiError } from '@/types';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
  setError: (error: ApiError | null) => void;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const result = await apiFunction(...args);
        setState(prev => ({ ...prev, data: result, loading: false }));
        return result;
      } catch (error: any) {
        const apiError = error.response?.data || {
          success: false,
          error: {
            code: 'API_ERROR',
            message: 'Bir hata oluştu',
          },
          timestamp: new Date().toISOString(),
        };
        
        setState(prev => ({ ...prev, error: apiError, loading: false }));
        return null;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  const setError = useCallback((error: ApiError | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
  };
}

// Specialized hook for mutations (POST, PUT, DELETE)
export function useMutation<T, P = any>(
  mutationFunction: (params: P) => Promise<T>
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(
    async (params: P): Promise<{ data: T | null; error: ApiError | null }> => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const result = await mutationFunction(params);
        setState(prev => ({ ...prev, data: result, loading: false }));
        return { data: result, error: null };
      } catch (error: any) {
        const apiError = error.response?.data || {
          success: false,
          error: {
            code: 'MUTATION_ERROR',
            message: 'İşlem gerçekleştirilemedi',
          },
          timestamp: new Date().toISOString(),
        };
        
        setState(prev => ({ ...prev, error: apiError, loading: false }));
        return { data: null, error: apiError };
      }
    },
    [mutationFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}

// Hook for handling loading states globally
export function useGlobalLoading() {
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = useCallback(() => setIsLoading(true), []);
  const stopLoading = useCallback(() => setIsLoading(false), []);

  return {
    isLoading,
    startLoading,
    stopLoading,
  };
}