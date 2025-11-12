import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { progressService, LessonCompletion, CourseProgress } from '@/lib/services/progress.service';

interface LessonProgressState {
  lessonId: string;
  completed: boolean;
  completedAt?: string;
  firstCompletedAt?: string;
}

interface CourseProgressState {
  courseId: string;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
  lessons: Record<string, LessonProgressState>;
  lastUpdated: string;
}

interface ProgressState {
  // Course progress data
  courseProgresses: Record<string, CourseProgressState>;
  
  // Loading states
  isLoading: boolean;
  isUpdatingLesson: string | null;
  version: number;
  
  // Actions
  initializeCourseProgress: (courseId: string, studentId?: string) => Promise<void>;
  updateLessonCompletion: (lessonId: string, completed: boolean, childId?: string) => Promise<LessonCompletion>;
  getLessonCompletionStatus: (courseId: string, lessonId: string) => boolean;
  getCourseProgress: (courseId: string) => CourseProgressState | null;
  getCompletedLessonsSet: (courseId: string) => Set<string>;
  
  // Utility actions
  setLoading: (loading: boolean) => void;
  clearCourseProgress: (courseId: string) => void;
  clearAllProgress: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      // Initial state
      courseProgresses: {},
      isLoading: false,
      isUpdatingLesson: null,
      version: 0,

      // Initialize course progress
      initializeCourseProgress: async (courseId: string, studentId?: string) => {
        try {
          set({ isLoading: true });
          
          const courseProgress = await progressService.getCourseProgress(courseId, studentId!);
          
          // Transform course progress to our store format
          const lessons: Record<string, LessonProgressState> = {};
          
          courseProgress.sections.forEach(section => {
            section.lessons.forEach(lesson => {
              lessons[lesson.id] = {
                lessonId: lesson.id,
                completed: lesson.completed,
                completedAt: lesson.completedAt,
                firstCompletedAt: lesson.completedAt,
              };
            });
          });

          const courseProgressState: CourseProgressState = {
            courseId: courseProgress.courseId,
            completedLessons: courseProgress.completedLessons,
            totalLessons: courseProgress.totalLessons,
            progressPercentage: courseProgress.progressPercentage,
            lessons,
            lastUpdated: new Date().toISOString(),
          };

          set(state => ({
            courseProgresses: {
              ...state.courseProgresses,
              [courseId]: courseProgressState,
            },
            isLoading: false,
          }));
        } catch (error) {
          console.error('Error initializing course progress:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      // Update lesson completion
      updateLessonCompletion: async (lessonId: string, completed: boolean, childId?: string) => {
        try {
          set({ isUpdatingLesson: lessonId });
          
          const result = await progressService.updateLessonCompletion(lessonId, completed, childId);
          

          
          // Update the store with the new completion status
          set(state => {
            const courseId = result.courseProgress.courseId;
            const currentCourseProgress = state.courseProgresses[courseId];
            
            if (!currentCourseProgress) {
              // If course progress doesn't exist, create it
              const newCourseProgress: CourseProgressState = {
                courseId,
                completedLessons: result.courseProgress.completedLessons,
                totalLessons: result.courseProgress.totalLessons,
                progressPercentage: result.courseProgress.progressPercentage,
                lessons: {
                  [lessonId]: {
                    lessonId,
                    completed: result.completed,
                    completedAt: result.completedAt || undefined,
                    firstCompletedAt: result.firstCompletedAt || undefined,
                  }
                },
                lastUpdated: new Date().toISOString(),
              };

              return {
                ...state,
                courseProgresses: {
                  ...state.courseProgresses,
                  [courseId]: newCourseProgress,
                },
                isUpdatingLesson: null,
              };
            }

            const updatedLessons = {
              ...currentCourseProgress.lessons,
              [lessonId]: {
                lessonId,
                completed: result.completed,
                completedAt: result.completedAt || undefined,
                firstCompletedAt: result.firstCompletedAt || undefined,
              },
            };

            const updatedCourseProgress = {
              ...currentCourseProgress,
              completedLessons: result.courseProgress.completedLessons,
              totalLessons: result.courseProgress.totalLessons,
              progressPercentage: result.courseProgress.progressPercentage,
              lessons: updatedLessons,
              lastUpdated: new Date().toISOString(),
            };

            const newState = {
              ...state,
              courseProgresses: {
                ...state.courseProgresses,
                [courseId]: updatedCourseProgress,
              },
              isUpdatingLesson: null,
            };
            
            return newState;
          });

          return result;
        } catch (error) {
          set({ isUpdatingLesson: null });
          throw error;
        }
      },

      // Get lesson completion status
      getLessonCompletionStatus: (courseId: string, lessonId: string) => {
        const courseProgress = get().courseProgresses[courseId];
        return courseProgress?.lessons[lessonId]?.completed || false;
      },

      // Get course progress
      getCourseProgress: (courseId: string) => {
        return get().courseProgresses[courseId] || null;
      },

      // Get completed lessons as Set
      getCompletedLessonsSet: (courseId: string) => {
        const courseProgress = get().courseProgresses[courseId];
        if (!courseProgress) return new Set<string>();
        
        const completedLessons = Object.entries(courseProgress.lessons)
          .filter(([_, lesson]) => lesson.completed)
          .map(([lessonId]) => lessonId);
        
        return new Set(completedLessons);
      },

      // Utility actions
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      
      clearCourseProgress: (courseId: string) => {
        set(state => {
          const { [courseId]: removed, ...rest } = state.courseProgresses;
          return { courseProgresses: rest };
        });
      },
      
      clearAllProgress: () => set({ courseProgresses: {} }),
    }),
    {
      name: 'progress-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist the course progresses, not loading states
      partialize: (state) => ({ 
        courseProgresses: state.courseProgresses 
      }),
    }
  )
);