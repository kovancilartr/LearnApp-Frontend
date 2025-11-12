import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { parentService } from '@/lib/services';
import { Parent, ChildProgress, Student } from '@/types/auth.types';

// Get parent profile with children
export const useParentProfile = (options?: UseQueryOptions<Parent>) => {
  return useQuery({
    queryKey: ['parent', 'profile'],
    queryFn: () => parentService.getParentProfile(),
    ...options,
  });
};

// Get all children
export const useParentChildren = (options?: UseQueryOptions<Student[]>) => {
  return useQuery({
    queryKey: ['parent', 'children'],
    queryFn: () => parentService.getChildren(),
    ...options,
  });
};

// Get specific child's progress
export const useChildProgress = (
  childId: string,
  options?: UseQueryOptions<ChildProgress>
) => {
  return useQuery({
    queryKey: ['parent', 'child', childId, 'progress'],
    queryFn: () => parentService.getChildProgress(childId),
    enabled: !!childId,
    ...options,
  });
};

// Get child's courses
export const useChildCourses = (
  childId: string,
  options?: UseQueryOptions<any>
) => {
  return useQuery({
    queryKey: ['parent', 'child', childId, 'courses'],
    queryFn: () => parentService.getChildCourses(childId),
    enabled: !!childId,
    ...options,
  });
};

// Get child's quiz results
export const useChildQuizResults = (
  childId: string,
  options?: UseQueryOptions<any>
) => {
  return useQuery({
    queryKey: ['parent', 'child', childId, 'quiz-results'],
    queryFn: () => parentService.getChildQuizResults(childId),
    enabled: !!childId,
    ...options,
  });
};

// Get child's activity
export const useChildActivity = (
  childId: string,
  limit: number = 10,
  options?: UseQueryOptions<any>
) => {
  return useQuery({
    queryKey: ['parent', 'child', childId, 'activity', limit],
    queryFn: () => parentService.getChildActivity(childId, limit),
    enabled: !!childId,
    ...options,
  });
};

// Get parent statistics
export const useParentStats = (options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: ['parent', 'stats'],
    queryFn: () => parentService.getParentStats(),
    ...options,
  });
};

// Enhanced parent progress monitoring hooks

// Get detailed progress report
export const useDetailedProgressReport = (options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: ['parent', 'detailed-report'],
    queryFn: () => parentService.getDetailedProgressReport(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Get children progress comparison
export const useChildrenProgressComparison = (options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: ['parent', 'children-comparison'],
    queryFn: () => parentService.getChildrenProgressComparison(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Get progress notifications
export const useProgressNotifications = (options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: ['parent', 'notifications'],
    queryFn: () => parentService.getProgressNotifications(),
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time notifications
    ...options,
  });
};

// Export progress data (this would typically be a mutation)
export const useExportProgressData = () => {
  return {
    exportData: async (format: 'json' | 'csv' | 'pdf' = 'json', dateRange?: { startDate: string; endDate: string }) => {
      return parentService.exportProgressData(format, dateRange);
    }
  };
};