import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProgressService } from '@/lib/services';
import { useAuth } from './useAuth';
import { toast } from 'react-hot-toast';

export const useProgressQuery = {
  // Get course progress for student
  useCourseProgress: (courseId: string, studentId?: string) => {
    const { user } = useAuth();
    const actualStudentId = studentId || user?.studentProfile?.id;

    return useQuery({
      queryKey: ['courseProgress', courseId, actualStudentId],
      queryFn: () => ProgressService.getCourseProgress(courseId, actualStudentId!),
      enabled: !!courseId && !!actualStudentId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    });
  },

  // Get student progress summary
  useStudentProgressSummary: (studentId?: string) => {
    const { user } = useAuth();
    const actualStudentId = studentId || user?.studentProfile?.id;

    return useQuery({
      queryKey: ['studentProgressSummary', actualStudentId],
      queryFn: () => ProgressService.getStudentProgressSummary(actualStudentId!),
      enabled: !!actualStudentId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    });
  },

  // Get recent completions
  useRecentCompletions: (studentId?: string, limit: number = 10) => {
    const { user } = useAuth();
    const actualStudentId = studentId || user?.studentProfile?.id;

    return useQuery({
      queryKey: ['recentCompletions', actualStudentId, limit],
      queryFn: () => ProgressService.getRecentCompletions(actualStudentId!, limit),
      enabled: !!actualStudentId,
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchOnWindowFocus: false,
    });
  },

  // Get lesson completion status
  useLessonCompletionStatus: (lessonId: string, studentId?: string) => {
    const { user } = useAuth();
    const actualStudentId = studentId || user?.studentProfile?.id;

    return useQuery({
      queryKey: ['lessonCompletion', lessonId, actualStudentId],
      queryFn: () => ProgressService.getLessonCompletionStatus(lessonId, actualStudentId!),
      enabled: !!lessonId && !!actualStudentId,
      staleTime: 1 * 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    });
  },

  // Get course completion analytics
  useCourseCompletionAnalytics: (courseId: string, studentId?: string) => {
    const { user } = useAuth();
    const actualStudentId = studentId || user?.studentProfile?.id;

    return useQuery({
      queryKey: ['courseAnalytics', courseId, actualStudentId],
      queryFn: () => ProgressService.getCourseCompletionAnalytics(courseId, actualStudentId),
      enabled: !!courseId,
      staleTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    });
  },

  // Get detailed progress analytics
  useDetailedProgressAnalytics: (courseId: string, studentId?: string) => {
    const { user } = useAuth();
    const actualStudentId = studentId || user?.studentProfile?.id;

    return useQuery({
      queryKey: ['detailedAnalytics', courseId, actualStudentId],
      queryFn: () => ProgressService.getDetailedProgressAnalytics(courseId, actualStudentId!),
      enabled: !!courseId && !!actualStudentId,
      staleTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    });
  },

  // Get bulk progress analytics
  useBulkProgressAnalytics: (studentId?: string) => {
    const { user } = useAuth();
    const actualStudentId = studentId || user?.studentProfile?.id;

    return useQuery({
      queryKey: ['bulkAnalytics', actualStudentId],
      queryFn: () => ProgressService.getBulkProgressAnalytics(actualStudentId!),
      enabled: !!actualStudentId,
      staleTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    });
  },
};

export const useProgressMutations = () => {
  const queryClient = useQueryClient();

  const { user } = useAuth();

  // Update lesson completion
  const updateLessonCompletion = useMutation({
    mutationFn: ({ 
      lessonId, 
      completed, 
      childId 
    }: { 
      lessonId: string; 
      completed: boolean; 
      childId?: string; 
    }) => ProgressService.updateLessonCompletion(lessonId, completed, childId),
    onSuccess: (data, variables) => {
      const studentId = variables.childId || user?.studentProfile?.id;
      
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ['lessonCompletion', variables.lessonId, studentId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['courseProgress', data.courseProgress.courseId, studentId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['studentProgressSummary', studentId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['recentCompletions', studentId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['courseAnalytics', data.courseProgress.courseId, studentId] 
      });

      // Show success message
      const action = data.toggleAction === 'completed' ? 'tamamlandı' : 
                    data.toggleAction === 'uncompleted' ? 'tamamlanmadı' : 'güncellendi';
      
      toast.success(`Ders başarıyla ${action} olarak işaretlendi.`);
    },
    onError: (error: any) => {
      console.error('Lesson completion update error:', error);
      toast.error('Ders durumu güncellenirken bir hata oluştu.');
    },
  });

  // Generate certificate
  const generateCertificate = useMutation({
    mutationFn: ({ 
      courseId, 
      studentId 
    }: { 
      courseId: string; 
      studentId?: string; 
    }) => {
      const actualStudentId = studentId || user?.studentProfile?.id;
      return ProgressService.generateCertificate(courseId, actualStudentId!);
    },
    onSuccess: (certificate) => {
      toast.success(`🎉 ${certificate.courseTitle} kursu için sertifikanız hazırlandı!`);
    },
    onError: (error: unknown) => {
      console.error('Certificate generation error:', error);
      toast.error((error as any)?.message || 'Sertifika oluşturulurken bir hata oluştu.');
    },
  });

  return {
    updateLessonCompletion,
    generateCertificate,
  };
};