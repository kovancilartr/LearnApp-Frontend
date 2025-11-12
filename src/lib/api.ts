import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, ApiError } from '@/types';

// Global loading state management
let activeRequests = 0;
const loadingCallbacks: Array<(loading: boolean) => void> = [];

export const subscribeToLoading = (callback: (loading: boolean) => void) => {
  loadingCallbacks.push(callback);
  return () => {
    const index = loadingCallbacks.indexOf(callback);
    if (index > -1) {
      loadingCallbacks.splice(index, 1);
    }
  };
};

const setGlobalLoading = (loading: boolean) => {
  loadingCallbacks.forEach(callback => callback(loading));
};

class ApiClient {
  public client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
      timeout: 15000, // Increased timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  private setupInterceptors() {
    // Request interceptor to add auth token and handle loading
    this.client.interceptors.request.use(
      (config) => {
        // Increment active requests and set loading
        activeRequests++;
        if (activeRequests === 1) {
          setGlobalLoading(true);
        }

        // Only add token if we're not on the server side
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('accessToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => {
        // Decrement active requests on error
        activeRequests--;
        if (activeRequests === 0) {
          setGlobalLoading(false);
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh and loading
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse<any>>) => {
        // Decrement active requests on success
        activeRequests--;
        if (activeRequests === 0) {
          setGlobalLoading(false);
        }
        return response;
      },
      async (error: AxiosError) => {
        // Decrement active requests on error
        activeRequests--;
        if (activeRequests === 0) {
          setGlobalLoading(false);
        }
        const originalRequest = error.config as any;

        // Handle timeout errors
        if (error.code === 'ECONNABORTED') {
          const timeoutError: ApiError = {
            success: false,
            error: {
              code: 'TIMEOUT_ERROR',
              message: 'İstek zaman aşımına uğradı',
            },
            timestamp: new Date().toISOString(),
          };
          return Promise.reject(timeoutError);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If we're already refreshing, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.client(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = typeof window !== 'undefined' 
              ? localStorage.getItem('refreshToken') 
              : null;
              
            if (refreshToken) {
              const response = await this.client.post('/auth/refresh', {
                refreshToken,
              });

              const { accessToken } = response.data.data;
              
              if (typeof window !== 'undefined') {
                localStorage.setItem('accessToken', accessToken);
              }

              this.processQueue(null, accessToken);

              // Retry the original request
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            
            // Refresh failed, clear tokens and redirect to login
            if (typeof window !== 'undefined') {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('auth-storage');
              
              // Only redirect if we're not already on auth pages
              if (!window.location.pathname.includes('/login') && 
                  !window.location.pathname.includes('/register')) {
                window.location.href = '/login';
              }
            }
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url);
    return response.data;
  }

  // Method to manually set authorization header
  setAuthToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Method to clear authorization header
  clearAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }

  // Method to get current auth token
  getAuthToken(): string | null {
    const authHeader = this.client.defaults.headers.common['Authorization'];
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }
}

export const apiClient = new ApiClient();

// Error handling utilities
export class ApiErrorHandler {
  static handleError(error: AxiosError): ApiError {
    if (error.response?.data) {
      // Server responded with error
      const serverError = error.response.data as ApiError;
      return {
        success: false,
        error: {
          code: serverError.error?.code || 'SERVER_ERROR',
          message: serverError.error?.message || 'Sunucu hatası oluştu',
          details: serverError.error?.details,
        },
        timestamp: new Date().toISOString(),
      };
    } else if (error.request) {
      // Network error
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.',
          details: { originalError: error.message },
        },
        timestamp: new Date().toISOString(),
      };
    } else {
      // Request setup error
      return {
        success: false,
        error: {
          code: 'REQUEST_ERROR',
          message: 'İstek hazırlanırken hata oluştu',
          details: { originalError: error.message },
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  static getErrorMessage(error: ApiError): string {
    switch (error.error.code) {
      case 'VALIDATION_ERROR':
        if (error.error.details && Array.isArray(error.error.details)) {
          const messages = error.error.details.map((detail: any) => 
            detail.message || detail.msg || detail
          ).join(', ');
          return `Doğrulama hatası: ${messages}`;
        }
        return 'Girilen bilgiler geçersiz. Lütfen kontrol edin.';
      case 'UNAUTHORIZED':
        return 'Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.';
      case 'FORBIDDEN':
        return 'Bu işlem için yetkiniz bulunmuyor.';
      case 'NOT_FOUND':
        return 'Aradığınız kaynak bulunamadı.';
      case 'CONFLICT':
        return 'Bu işlem çakışma nedeniyle gerçekleştirilemedi.';
      case 'RATE_LIMIT_EXCEEDED':
        return 'Çok fazla istek gönderdiniz. Lütfen bekleyin.';
      case 'SERVER_ERROR':
        return 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
      case 'NETWORK_ERROR':
        return 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.';
      case 'TIMEOUT_ERROR':
        return 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.';
      case 'ENROLLMENT_EXISTS':
        return 'Bu kursa zaten kayıtlısınız.';
      case 'ENROLLMENT_NOT_FOUND':
        return 'Kurs kaydınız bulunamadı.';
      case 'COURSE_NOT_FOUND':
        return 'Kurs bulunamadı.';
      case 'LESSON_NOT_FOUND':
        return 'Ders bulunamadı.';
      case 'QUIZ_NOT_FOUND':
        return 'Quiz bulunamadı.';
      case 'ATTEMPT_LIMIT_EXCEEDED':
        return 'Quiz deneme limitiniz dolmuş.';
      case 'QUIZ_TIME_EXPIRED':
        return 'Quiz süresi dolmuş.';
      case 'INSUFFICIENT_PERMISSIONS':
        return 'Bu işlem için yeterli izniniz yok.';
      default:
        return error.error.message || 'Bilinmeyen bir hata oluştu.';
    }
  }
}

// Request retry utility
export class RequestRetry {
  static async withRetry<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on client errors (4xx)
        if (error instanceof AxiosError && error.response?.status && error.response.status < 500) {
          throw error;
        }

        if (attempt === maxRetries) {
          throw lastError;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }

    throw lastError!;
  }
}