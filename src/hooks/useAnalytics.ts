import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { analyticsService } from '@/lib/services';
import {
  DashboardStats,
  CourseAnalytics,
  UserAnalytics,
  EnrollmentTrends,
  SystemUsageStats,
  TeacherAssignment,
  SystemAnalytics,
  AnalyticsQuery,
} from '@/types';

// Query keys for analytics
export const analyticsKeys = {
  all: ['analytics'] as const,
  dashboard: () => [...analyticsKeys.all, 'dashboard'] as const,
  courses: (query?: AnalyticsQuery) => [...analyticsKeys.all, 'courses', query] as const,
  users: (query?: AnalyticsQuery) => [...analyticsKeys.all, 'users', query] as const,
  enrollments: (query?: AnalyticsQuery) => [...analyticsKeys.all, 'enrollments', query] as const,
  usage: (query?: AnalyticsQuery) => [...analyticsKeys.all, 'usage', query] as const,
  teachers: (query?: AnalyticsQuery) => [...analyticsKeys.all, 'teachers', query] as const,
  overview: (query?: AnalyticsQuery) => [...analyticsKeys.all, 'overview', query] as const,
};

/**
 * Dashboard istatistiklerini getiren hook
 */
export function useDashboardStats(): UseQueryResult<DashboardStats, Error> {
  return useQuery({
    queryKey: analyticsKeys.dashboard(),
    queryFn: () => analyticsService.getDashboardStats(),
    staleTime: 5 * 60 * 1000, // 5 dakika
    gcTime: 10 * 60 * 1000, // 10 dakika
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * Kurs analitiği verilerini getiren hook
 */
export function useCourseAnalytics(query?: AnalyticsQuery): UseQueryResult<CourseAnalytics[], Error> {
  return useQuery({
    queryKey: analyticsKeys.courses(query),
    queryFn: () => analyticsService.getCourseAnalytics(query),
    staleTime: 5 * 60 * 1000, // 5 dakika
    gcTime: 10 * 60 * 1000, // 10 dakika
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * Kullanıcı analitiği verilerini getiren hook
 */
export function useUserAnalytics(query?: AnalyticsQuery): UseQueryResult<UserAnalytics, Error> {
  return useQuery({
    queryKey: analyticsKeys.users(query),
    queryFn: () => analyticsService.getUserAnalytics(query),
    staleTime: 5 * 60 * 1000, // 5 dakika
    gcTime: 10 * 60 * 1000, // 10 dakika
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * Kayıt trendlerini getiren hook
 */
export function useEnrollmentTrends(query?: AnalyticsQuery): UseQueryResult<EnrollmentTrends, Error> {
  return useQuery({
    queryKey: analyticsKeys.enrollments(query),
    queryFn: () => analyticsService.getEnrollmentTrends(query),
    staleTime: 5 * 60 * 1000, // 5 dakika
    gcTime: 10 * 60 * 1000, // 10 dakika
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * Sistem kullanım istatistiklerini getiren hook
 */
export function useSystemUsageStats(query?: AnalyticsQuery): UseQueryResult<SystemUsageStats, Error> {
  return useQuery({
    queryKey: analyticsKeys.usage(query),
    queryFn: () => analyticsService.getSystemUsageStats(query),
    staleTime: 5 * 60 * 1000, // 5 dakika
    gcTime: 10 * 60 * 1000, // 10 dakika
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * Öğretmen atamalarını getiren hook
 */
export function useTeacherAssignments(query?: AnalyticsQuery): UseQueryResult<TeacherAssignment[], Error> {
  return useQuery({
    queryKey: analyticsKeys.teachers(query),
    queryFn: () => analyticsService.getTeacherAssignments(query),
    staleTime: 5 * 60 * 1000, // 5 dakika
    gcTime: 10 * 60 * 1000, // 10 dakika
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * Kapsamlı analytics genel bakışını getiren hook
 */
export function useAnalyticsOverview(query?: AnalyticsQuery): UseQueryResult<SystemAnalytics, Error> {
  return useQuery({
    queryKey: analyticsKeys.overview(query),
    queryFn: () => analyticsService.getAnalyticsOverview(query),
    staleTime: 5 * 60 * 1000, // 5 dakika
    gcTime: 10 * 60 * 1000, // 10 dakika
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * Analytics verilerini yenileme fonksiyonları
 */
export function useAnalyticsRefresh() {
  const queryClient = useQueryClient();

  const refreshDashboard = () => {
    queryClient.invalidateQueries({ queryKey: analyticsKeys.dashboard() });
  };

  const refreshCourses = () => {
    queryClient.invalidateQueries({ queryKey: analyticsKeys.courses() });
  };

  const refreshUsers = () => {
    queryClient.invalidateQueries({ queryKey: analyticsKeys.users() });
  };

  const refreshEnrollments = () => {
    queryClient.invalidateQueries({ queryKey: analyticsKeys.enrollments() });
  };

  const refreshUsage = () => {
    queryClient.invalidateQueries({ queryKey: analyticsKeys.usage() });
  };

  const refreshTeachers = () => {
    queryClient.invalidateQueries({ queryKey: analyticsKeys.teachers() });
  };

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
  };

  return {
    refreshDashboard,
    refreshCourses,
    refreshUsers,
    refreshEnrollments,
    refreshUsage,
    refreshTeachers,
    refreshAll,
  };
}

/**
 * Analytics verilerini dışa aktarma hook'u
 */
export function useAnalyticsExport() {
  const downloadCSV = async (type: string = 'overview') => {
    try {
      const blob = await analyticsService.downloadAnalyticsCSV(type);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-${type}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('CSV indirme hatası:', error);
      throw error;
    }
  };

  const downloadJSON = async (type: string = 'overview') => {
    try {
      const blob = await analyticsService.downloadAnalyticsJSON(type);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-${type}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('JSON indirme hatası:', error);
      throw error;
    }
  };

  return {
    downloadCSV,
    downloadJSON,
  };
}