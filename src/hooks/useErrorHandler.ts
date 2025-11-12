import { useCallback } from 'react';
import { ApiError } from '@/types';
import { useUIStore } from '@/store';
import { ApiErrorHandler } from '@/lib/api';

export function useErrorHandler() {
  const { addNotification } = useUIStore();

  const handleError = useCallback((error: ApiError | Error | any, customMessage?: string) => {
    let apiError: ApiError;

    if (error?.response?.data) {
      // Axios error with API response
      apiError = error.response.data;
    } else if (error?.error) {
      // Already an ApiError
      apiError = error;
    } else {
      // Generic error
      apiError = ApiErrorHandler.handleError(error);
    }

    const message = customMessage || ApiErrorHandler.getErrorMessage(apiError);

    // Show notification
    addNotification({
      type: 'error',
      title: 'Hata',
      message,
      duration: 5000,
    });

    // Log error for debugging
    console.error('Error handled:', apiError);

    return apiError;
  }, [addNotification]);

  const handleSuccess = useCallback((message: string, title: string = 'Başarılı') => {
    addNotification({
      type: 'success',
      title,
      message,
      duration: 3000,
    });
  }, [addNotification]);

  const handleWarning = useCallback((message: string, title: string = 'Uyarı') => {
    addNotification({
      type: 'warning',
      title,
      message,
      duration: 4000,
    });
  }, [addNotification]);

  const handleInfo = useCallback((message: string, title: string = 'Bilgi') => {
    addNotification({
      type: 'info',
      title,
      message,
      duration: 4000,
    });
  }, [addNotification]);

  return {
    handleError,
    handleSuccess,
    handleWarning,
    handleInfo,
  };
}

// Hook for handling specific error types
export function useAuthErrorHandler() {
  const { handleError } = useErrorHandler();

  const handleAuthError = useCallback((error: ApiError | any) => {
    if (error?.error?.code === 'UNAUTHORIZED') {
      // Redirect to login or show login modal
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return;
    }

    if (error?.error?.code === 'FORBIDDEN') {
      handleError(error, 'Bu işlem için yetkiniz bulunmuyor.');
      return;
    }

    if (error?.error?.code === 'TOKEN_EXPIRED') {
      handleError(error, 'Oturumunuz sona erdi. Lütfen tekrar giriş yapın.');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return;
    }

    // Handle other auth errors normally
    handleError(error);
  }, [handleError]);

  return { handleAuthError };
}

// Hook for handling validation errors
export function useValidationErrorHandler() {
  const { handleError } = useErrorHandler();

  const handleValidationError = useCallback((error: ApiError | any) => {
    if (error?.error?.code === 'VALIDATION_ERROR' && error?.error?.details) {
      const details = error.error.details;
      
      if (Array.isArray(details)) {
        // Multiple validation errors
        const messages = details.map((detail: any) => detail.message || detail).join(', ');
        handleError(error, `Doğrulama hatası: ${messages}`);
      } else if (typeof details === 'object') {
        // Field-specific validation errors
        const fieldErrors = Object.entries(details)
          .map(([field, message]) => `${field}: ${message}`)
          .join(', ');
        handleError(error, `Doğrulama hatası: ${fieldErrors}`);
      } else {
        handleError(error, `Doğrulama hatası: ${details}`);
      }
      return;
    }

    // Handle other validation errors normally
    handleError(error);
  }, [handleError]);

  return { handleValidationError };
}