import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { quizService } from '@/lib/services';
import { Quiz } from '@/types';

// Query keys
export const quizKeys = {
  all: ['quizzes'] as const,
  lists: () => [...quizKeys.all, 'list'] as const,
  list: (filters: string) => [...quizKeys.lists(), { filters }] as const,
  details: () => [...quizKeys.all, 'detail'] as const,
  detail: (id: string) => [...quizKeys.details(), id] as const,
  teacher: () => [...quizKeys.all, 'teacher'] as const,
  available: () => [...quizKeys.all, 'available'] as const,
  attempts: () => [...quizKeys.all, 'attempts'] as const,
  attempt: (id: string) => [...quizKeys.attempts(), id] as const,
  studentAttempts: (studentId: string, quizId?: string) => 
    [...quizKeys.attempts(), 'student', studentId, ...(quizId ? [quizId] : [])] as const,
};

// Get teacher quizzes (using general quiz list for now)
export function useTeacherQuizzes() {
  return useQuery({
    queryKey: quizKeys.teacher(),
    queryFn: () => quizService.getQuizzes().then(response => response.items),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get available quizzes for students (using general quiz list for now)
export function useAvailableQuizzes() {
  return useQuery({
    queryKey: quizKeys.available(),
    queryFn: () => quizService.getQuizzes().then(response => response.items),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get quiz details
export function useQuiz(quizId: string) {
  return useQuery({
    queryKey: quizKeys.detail(quizId),
    queryFn: () => quizService.getQuiz(quizId),
    enabled: !!quizId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get student quiz attempts - TODO: Implement backend endpoint
export function useStudentQuizAttempts(studentId: string, quizId?: string) {
  return useQuery({
    queryKey: quizKeys.studentAttempts(studentId, quizId),
    queryFn: async () => {
      // TODO: Replace with actual API call when backend endpoint is ready
      // For now, return empty array to prevent errors
      return [];
    },
    enabled: !!studentId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Create quiz mutation
export function useCreateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quizData: { title: string; courseId: string; duration?: number; attemptsAllowed?: number }) =>
      quizService.createQuiz(quizData),
    onSuccess: (newQuiz) => {
      // Add to teacher quizzes cache
      queryClient.setQueryData<Quiz[]>(quizKeys.teacher(), (old) => {
        return old ? [...old, newQuiz] : [newQuiz];
      });

      // Add to available quizzes cache
      queryClient.setQueryData<Quiz[]>(quizKeys.available(), (old) => {
        return old ? [...old, newQuiz] : [newQuiz];
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
    },
    onError: (error: any) => {
      console.error('Create quiz error:', error);
    },
  });
}

// Update quiz mutation
export function useUpdateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, updates }: { quizId: string; updates: Partial<Quiz> }) =>
      quizService.updateQuiz(quizId, updates),
    onSuccess: (updatedQuiz, { quizId }) => {
      // Update quiz detail cache
      queryClient.setQueryData(quizKeys.detail(quizId), updatedQuiz);

      // Update quiz in lists
      queryClient.setQueryData<Quiz[]>(quizKeys.teacher(), (old) => {
        return old?.map((quiz) => 
          quiz.id === quizId ? { ...quiz, ...updatedQuiz } : quiz
        );
      });

      queryClient.setQueryData<Quiz[]>(quizKeys.available(), (old) => {
        return old?.map((quiz) => 
          quiz.id === quizId ? { ...quiz, ...updatedQuiz } : quiz
        );
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
    },
    onError: (error: any) => {
      console.error('Update quiz error:', error);
    },
  });
}

// Delete quiz mutation
export function useDeleteQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quizId: string) => quizService.deleteQuiz(quizId),
    onSuccess: (_, quizId) => {
      // Remove from all quiz lists
      queryClient.setQueryData<Quiz[]>(quizKeys.teacher(), (old) => {
        return old?.filter((quiz) => quiz.id !== quizId);
      });

      queryClient.setQueryData<Quiz[]>(quizKeys.available(), (old) => {
        return old?.filter((quiz) => quiz.id !== quizId);
      });

      // Remove quiz detail cache
      queryClient.removeQueries({ queryKey: quizKeys.detail(quizId) });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
    },
    onError: (error: any) => {
      console.error('Delete quiz error:', error);
    },
  });
}

// Start quiz attempt mutation
export function useStartQuizAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quizId: string) => quizService.startQuizAttempt(quizId),
    onSuccess: (attempt, quizId) => {
      // Invalidate student attempts to include new attempt
      queryClient.invalidateQueries({ 
        queryKey: quizKeys.studentAttempts(attempt.studentId, quizId) 
      });
      
      // Invalidate all student attempts
      queryClient.invalidateQueries({ 
        queryKey: quizKeys.studentAttempts(attempt.studentId) 
      });
    },
    onError: (error: any) => {
      console.error('Start quiz attempt error:', error);
    },
  });
}

// Submit quiz response mutation (using submitQuizAttempt instead)
export function useSubmitQuizResponse() {
  return useMutation({
    mutationFn: ({ attemptId, responses }: { 
      attemptId: string; 
      responses: Array<{questionId: string; choiceId: string}>; 
    }) => quizService.submitQuizAttempt(attemptId, responses),
    onError: (error: any) => {
      console.error('Submit quiz response error:', error);
    },
  });
}

// Finish quiz attempt mutation
export function useFinishQuizAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attemptId: string) => quizService.getQuizResult(attemptId),
    onSuccess: (finishedAttempt) => {
      // Invalidate student attempts to show updated results
      queryClient.invalidateQueries({ 
        queryKey: quizKeys.studentAttempts(finishedAttempt.studentId) 
      });
      
      // Invalidate specific quiz attempts
      queryClient.invalidateQueries({ 
        queryKey: quizKeys.studentAttempts(finishedAttempt.studentId, finishedAttempt.quizId) 
      });
    },
    onError: (error: any) => {
      console.error('Finish quiz attempt error:', error);
    },
  });
}

// Custom hook for quiz taking state management
export function useQuizTaking(quizId: string) {
  const { data: quiz, isLoading: isLoadingQuiz } = useQuiz(quizId);
  const startAttemptMutation = useStartQuizAttempt();
  const submitResponseMutation = useSubmitQuizResponse();
  const finishAttemptMutation = useFinishQuizAttempt();

  return {
    quiz,
    isLoadingQuiz,
    startAttempt: startAttemptMutation.mutate,
    isStartingAttempt: startAttemptMutation.isPending,
    submitResponse: submitResponseMutation.mutate,
    isSubmittingResponse: submitResponseMutation.isPending,
    finishAttempt: finishAttemptMutation.mutate,
    isFinishingAttempt: finishAttemptMutation.isPending,
    attemptError: startAttemptMutation.error || submitResponseMutation.error || finishAttemptMutation.error,
  };
}