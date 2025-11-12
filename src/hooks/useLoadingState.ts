import { useEffect, useState } from 'react';
import { subscribeToLoading } from '@/lib/api';

// Hook to subscribe to global loading state
export function useGlobalLoadingState() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToLoading(setIsLoading);
    return unsubscribe;
  }, []);

  return isLoading;
}

// Hook for managing local loading states
export function useLoadingState(initialState: boolean = false) {
  const [isLoading, setIsLoading] = useState(initialState);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  const setNamedLoading = (name: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [name]: loading,
    }));
  };

  const isAnyLoading = () => {
    return isLoading || Object.values(loadingStates).some(Boolean);
  };

  const getLoadingState = (name: string) => {
    return loadingStates[name] || false;
  };

  const clearAllLoading = () => {
    setIsLoading(false);
    setLoadingStates({});
  };

  return {
    isLoading,
    loadingStates,
    setLoading,
    setNamedLoading,
    isAnyLoading,
    getLoadingState,
    clearAllLoading,
  };
}

// Hook for managing async operations with loading states
export function useAsyncOperation<T = any>() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = async (operation: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setIsLoading(false);
    setError(null);
    setData(null);
  };

  return {
    isLoading,
    error,
    data,
    execute,
    reset,
  };
}

// Hook for debounced loading states (useful for search, etc.)
export function useDebouncedLoading(delay: number = 300) {
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedLoading, setDebouncedLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLoading(isLoading);
    }, delay);

    return () => clearTimeout(timer);
  }, [isLoading, delay]);

  return {
    isLoading,
    debouncedLoading,
    setLoading: setIsLoading,
  };
}