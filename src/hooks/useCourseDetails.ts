import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getCourseDetails, 
  getStudentProgress, 
  markLessonComplete, 
  unmarkLessonComplete,
  CourseWithDetails,
  StudentProgress 
} from '@/lib/services';
import { toast } from 'react-hot-toast';

// Get course details
export const useCourseDetails = (courseId: string) => {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourseDetails(courseId),
    enabled: !!courseId,
  });
};

// Get student progress
export const useStudentProgress = (courseId: string) => {
  return useQuery({
    queryKey: ['studentProgress', courseId],
    queryFn: () => getStudentProgress(courseId),
    enabled: !!courseId,
  });
};

// Mark lesson complete mutation
export const useMarkLessonComplete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, lessonId }: { courseId: string; lessonId: string }) =>
      markLessonComplete(courseId, lessonId),
    onSuccess: (_, { courseId, lessonId }) => {
      // Update the progress cache
      queryClient.setQueryData(['studentProgress', courseId], (old: StudentProgress[] | undefined) => {
        if (!old) return old;
        
        const existingProgress = old.find(p => p.lessonId === lessonId);
        if (existingProgress) {
          return old.map(p => 
            p.lessonId === lessonId 
              ? { ...p, isCompleted: true, completedAt: new Date().toISOString() }
              : p
          );
        } else {
          return [...old, {
            id: `temp-${Date.now()}`,
            studentId: 'current-student',
            courseId,
            lessonId,
            isCompleted: true,
            completedAt: new Date().toISOString()
          }];
        }
      });

      toast.success("✅ Ders başarıyla tamamlandı olarak işaretlendi.");
    },
    onError: () => {
      toast.error("❌ Ders tamamlanırken bir hata oluştu.");
    },
  });
};

// Unmark lesson complete mutation
export const useUnmarkLessonComplete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, lessonId }: { courseId: string; lessonId: string }) =>
      unmarkLessonComplete(courseId, lessonId),
    onSuccess: (_, { courseId, lessonId }) => {
      // Update the progress cache
      queryClient.setQueryData(['studentProgress', courseId], (old: StudentProgress[] | undefined) => {
        if (!old) return old;
        return old.map(p => 
          p.lessonId === lessonId 
            ? { ...p, isCompleted: false, completedAt: undefined }
            : p
        );
      });

      toast.success("📝 Ders tamamlandı işareti kaldırıldı.");
    },
    onError: () => {
      toast.error("❌ İşlem sırasında bir hata oluştu.");
    },
  });
};