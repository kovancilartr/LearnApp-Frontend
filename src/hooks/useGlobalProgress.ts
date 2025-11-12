import { useCallback } from "react";
import { useProgressStore } from "@/store/progressStore";
import { useAuth } from "./useAuth";

/**
 * Global progress hook that provides progress data for any course
 * This hook ensures progress data is available across the app
 */
export function useGlobalProgress() {
  const { user } = useAuth();
  const {
    courseProgresses,
    initializeCourseProgress,
    getLessonCompletionStatus,
    getCourseProgress,
    getCompletedLessonsSet,
    updateLessonCompletion,
    isUpdatingLesson,
  } = useProgressStore();

  // Helper function to get progress for a specific course
  const getCourseProgressPercentage = useCallback(
    (courseId: string): number => {
      const progress = getCourseProgress(courseId);
      return progress?.progressPercentage || 0;
    },
    [getCourseProgress]
  );

  // Helper function to get completed lessons count for a course
  const getCompletedLessonsCount = useCallback(
    (courseId: string): number => {
      const progress = getCourseProgress(courseId);
      return progress?.completedLessons || 0;
    },
    [getCourseProgress]
  );

  // Helper function to get total lessons count for a course
  const getTotalLessonsCount = useCallback(
    (courseId: string): number => {
      const progress = getCourseProgress(courseId);
      return progress?.totalLessons || 0;
    },
    [getCourseProgress]
  );

  // Helper function to initialize progress for a course if not exists
  const ensureCourseProgress = useCallback(
    async (courseId: string) => {
      if (!user?.studentProfile?.id) return;

      const existingProgress = getCourseProgress(courseId);
      if (!existingProgress) {
        try {
          await initializeCourseProgress(courseId, user.studentProfile.id);
        } catch (error) {
          console.error("Error initializing course progress:", error);
        }
      }
    },
    [user?.studentProfile?.id, getCourseProgress, initializeCourseProgress]
  );

  // Helper function to get overall progress across all courses
  const getOverallProgress = useCallback(() => {
    const allProgresses = Object.values(courseProgresses);
    if (allProgresses.length === 0)
      return { percentage: 0, completed: 0, total: 0 };

    const totalCompleted = allProgresses.reduce(
      (sum, progress) => sum + progress.completedLessons,
      0
    );
    const totalLessons = allProgresses.reduce(
      (sum, progress) => sum + progress.totalLessons,
      0
    );
    const percentage =
      totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

    return {
      percentage,
      completed: totalCompleted,
      total: totalLessons,
    };
  }, [courseProgresses]);

  return {
    // Store state
    courseProgresses,
    isUpdatingLesson,

    // Core functions
    initializeCourseProgress,
    updateLessonCompletion,
    ensureCourseProgress,

    // Getter functions
    getLessonCompletionStatus,
    getCourseProgress,
    getCompletedLessonsSet,
    getCourseProgressPercentage,
    getCompletedLessonsCount,
    getTotalLessonsCount,
    getOverallProgress,

    // Computed values
    hasAnyProgress: Object.keys(courseProgresses).length > 0,
    totalCourses: Object.keys(courseProgresses).length,
  };
}
