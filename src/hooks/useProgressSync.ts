import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useProgressStore } from '@/store/progressStore';
import { useAuth } from './useAuth';

/**
 * Hook to sync progress store with React Query cache
 * This ensures both systems stay in sync
 */
export function useProgressSync() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { courseProgresses } = useProgressStore();

  useEffect(() => {
    if (!user?.studentProfile?.id) return;

    const studentId = user.studentProfile.id;

    // Sync course progress data with React Query cache
    Object.entries(courseProgresses).forEach(([courseId, courseProgress]) => {
      // Update course progress query cache
      queryClient.setQueryData(
        ['courseProgress', courseId, studentId],
        {
          courseId: courseProgress.courseId,
          completedLessons: courseProgress.completedLessons,
          totalLessons: courseProgress.totalLessons,
          progressPercentage: courseProgress.progressPercentage,
          sections: [], // This would need to be populated from the original course data
          lastUpdated: courseProgress.lastUpdated,
        }
      );

      // Update individual lesson completion status queries
      Object.entries(courseProgress.lessons).forEach(([lessonId, lessonProgress]) => {
        queryClient.setQueryData(
          ['lessonCompletion', lessonId, studentId],
          lessonProgress.completed
        );
      });

      // Invalidate related queries to trigger refetch if needed
      queryClient.invalidateQueries({ 
        queryKey: ['studentProgressSummary', studentId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['recentCompletions', studentId] 
      });
    });
  }, [courseProgresses, queryClient, user?.studentProfile?.id]);

  return {
    // Utility function to manually sync a specific course
    syncCourse: (courseId: string) => {
      if (!user?.studentProfile?.id) return;
      
      const courseProgress = courseProgresses[courseId];
      if (courseProgress) {
        queryClient.invalidateQueries({ 
          queryKey: ['courseProgress', courseId, user.studentProfile.id] 
        });
      }
    },
    
    // Utility function to clear all progress cache
    clearProgressCache: () => {
      queryClient.removeQueries({ queryKey: ['courseProgress'] });
      queryClient.removeQueries({ queryKey: ['lessonCompletion'] });
      queryClient.removeQueries({ queryKey: ['studentProgressSummary'] });
      queryClient.removeQueries({ queryKey: ['recentCompletions'] });
    }
  };
}