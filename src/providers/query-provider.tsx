'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: 5 minutes
            staleTime: 5 * 60 * 1000,
            // Cache time: 10 minutes
            gcTime: 10 * 60 * 1000,
            // Retry failed requests 3 times
            retry: (failureCount, error: any) => {
              // Don't retry on 401 (unauthorized) errors
              if (error?.response?.status === 401) {
                return false;
              }
              return failureCount < 3;
            },
            // Retry delay increases exponentially
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Refetch on window focus
            refetchOnWindowFocus: false,
            // Refetch on reconnect
            refetchOnReconnect: true,
            // Network mode
            networkMode: 'online',
          },
          mutations: {
            // Retry failed mutations once
            retry: (failureCount, error: any) => {
              // Don't retry on 401 (unauthorized) errors
              if (error?.response?.status === 401) {
                return false;
              }
              return failureCount < 1;
            },
            // Retry delay for mutations
            retryDelay: 1000,
            // Network mode
            networkMode: 'online',
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}