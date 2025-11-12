import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '@/lib/services';
import { Course, Section, Lesson, Enrollment, Completion } from '@/types';

// Query keys
export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (filters: string) => [...courseKeys.lists(), { filters }] as const,
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
  teacher: () => [...courseKeys.all, 'teacher'] as const,
  enrollments: () => [...courseKeys.all, 'enrollments'] as const,
  studentEnrollments: (studentId: string) => [...courseKeys.enrollments(), 'student', studentId] as const,
  progress: () => [...courseKeys.all, 'progress'] as const,
  studentProgress: (courseId: string, studentId: string) => [...courseKeys.progress(), courseId, studentId] as const,
};

// Course queries
export function useCourses(params?: unknown) {
  return useQuery({
    queryKey: courseKeys.list(JSON.stringify(params || {})),
    queryFn: () => courseService.getCourses(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => courseService.getCourse(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTeacherCourses() {
  return useQuery({
    queryKey: courseKeys.teacher(),
    queryFn: courseService.getTeacherCourses,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStudentEnrollments(studentId: string) {
  return useQuery({
    queryKey: courseKeys.studentEnrollments(studentId),
    queryFn: () => courseService.getMyEnrollments(),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStudentProgress(courseId: string, studentId: string) {
  return useQuery({
    queryKey: courseKeys.studentProgress(courseId, studentId),
    queryFn: () => courseService.getStudentProgress(courseId, studentId),
    enabled: !!courseId && !!studentId,
    staleTime: 2 * 60 * 1000, // 2 minutes for progress data
  });
}

// Course mutations
export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseService.createCourse,
    onSuccess: (newCourse) => {
      // Invalidate and refetch courses
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.teacher() });
      
      // Add to cache optimistically
      queryClient.setQueryData(courseKeys.detail(newCourse.id), newCourse);
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Course> }) =>
      courseService.updateCourse(id, updates),
    onSuccess: (updatedCourse) => {
      // Update course detail cache
      queryClient.setQueryData(courseKeys.detail(updatedCourse.id), updatedCourse);
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.teacher() });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseService.deleteCourse,
    onSuccess: (_, courseId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: courseKeys.detail(courseId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.teacher() });
    },
  });
}

// Section mutations
export function useCreateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, sectionData }: { courseId: string; sectionData: Omit<Section, 'id' | 'courseId' | 'lessons'> }) =>
      courseService.createSection(courseId, sectionData),
    onSuccess: (_, { courseId }) => {
      // Invalidate course detail to refetch with new section
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
    },
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sectionId, updates }: { sectionId: string; updates: Partial<Section> }) =>
      courseService.updateSection(sectionId, updates),
    onSuccess: () => {
      // Invalidate all course details since we don't know which course this section belongs to
      queryClient.invalidateQueries({ queryKey: courseKeys.details() });
    },
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseService.deleteSection,
    onSuccess: () => {
      // Invalidate all course details
      queryClient.invalidateQueries({ queryKey: courseKeys.details() });
    },
  });
}

// Lesson mutations
export function useCreateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sectionId, lessonData }: { sectionId: string; lessonData: Omit<Lesson, 'id' | 'sectionId' | 'completions'> }) =>
      courseService.createLesson(sectionId, lessonData),
    onSuccess: () => {
      // Invalidate all course details
      queryClient.invalidateQueries({ queryKey: courseKeys.details() });
    },
  });
}

export function useUpdateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, updates }: { lessonId: string; updates: Partial<Lesson> }) =>
      courseService.updateLesson(lessonId, updates),
    onSuccess: () => {
      // Invalidate all course details
      queryClient.invalidateQueries({ queryKey: courseKeys.details() });
    },
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseService.deleteLesson,
    onSuccess: () => {
      // Invalidate all course details
      queryClient.invalidateQueries({ queryKey: courseKeys.details() });
    },
  });
}

// Enrollment mutations
export function useEnrollInCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, studentId }: { courseId: string; studentId?: string }) =>
      courseService.enrollInCourse(courseId, studentId),
    onSuccess: () => {
      // Invalidate course lists and enrollments
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });
}

// Enrollment Request queries and mutations
export function useCreateEnrollmentRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, message }: { courseId: string; message?: string }) =>
      courseService.createEnrollmentRequest(courseId, message),
    onSuccess: () => {
      // Invalidate enrollment requests
      queryClient.invalidateQueries({ queryKey: ['enrollmentRequests'] });
    },
  });
}

export function useEnrollmentRequests(filters?: {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  courseId?: string;
  studentId?: string;
}) {
  return useQuery({
    queryKey: ['enrollmentRequests', filters],
    queryFn: () => courseService.getEnrollmentRequests(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useStudentEnrollmentRequests(studentId: string) {
  return useQuery({
    queryKey: ['enrollmentRequests', 'student', studentId],
    queryFn: () => courseService.getStudentEnrollmentRequests(),
    enabled: !!studentId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useReviewEnrollmentRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, status, adminNote }: { 
      requestId: string; 
      status: 'APPROVED' | 'REJECTED'; 
      adminNote?: string;
    }) => courseService.reviewEnrollmentRequest(requestId, status, adminNote),
    onSuccess: () => {
      // Invalidate enrollment requests
      queryClient.invalidateQueries({ queryKey: ['enrollmentRequests'] });
      // Invalidate enrollments in case request was approved
      queryClient.invalidateQueries({ queryKey: courseKeys.enrollments() });
    },
  });
}

export function useUnenrollFromCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, studentId }: { courseId: string; studentId: string }) =>
      courseService.unenrollFromCourse(courseId, studentId),
    onSuccess: (_, { studentId }) => {
      // Invalidate student enrollments
      queryClient.invalidateQueries({ queryKey: courseKeys.studentEnrollments(studentId) });
      
      // Invalidate course lists
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

// Progress mutations
export function useMarkLessonComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonId: string) => courseService.markLessonComplete(lessonId, true),
    onSuccess: () => {
      // Invalidate progress queries
      queryClient.invalidateQueries({ queryKey: courseKeys.progress() });
    },
  });
}

export function useMarkLessonIncomplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseService.markLessonIncomplete,
    onSuccess: () => {
      // Invalidate progress queries
      queryClient.invalidateQueries({ queryKey: courseKeys.progress() });
    },
  });
}

// Teacher assignment mutations
export function useAssignTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, teacherId }: { courseId: string; teacherId: string }) =>
      courseService.assignTeacherToCourse(courseId, teacherId),
    onSuccess: (updatedCourse) => {
      // Update course detail
      queryClient.setQueryData(courseKeys.detail(updatedCourse.id), updatedCourse);
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.teacher() });
    },
  });
}

export function useRemoveTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseService.removeTeacherFromCourse,
    onSuccess: (updatedCourse) => {
      // Update course detail
      queryClient.setQueryData(courseKeys.detail(updatedCourse.id), updatedCourse);
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.teacher() });
    },
  });
}

// Export as object for easier usage
export const useCourseQuery = {
  useCourses,
  useCourse,
  useTeacherCourses,
  useStudentEnrollments,
  useStudentProgress,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
  useCreateSection,
  useUpdateSection,
  useDeleteSection,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
  useEnrollInCourse,
  useUnenrollFromCourse,
  useMarkLessonComplete,
  useMarkLessonIncomplete,
  useAssignTeacher,
  useRemoveTeacher,
};