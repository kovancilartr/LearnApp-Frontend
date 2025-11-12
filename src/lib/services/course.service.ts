import { apiClient } from "../api";
import {
  Course,
  Section,
  Lesson,
  Enrollment,
  Completion,
  QueryParams,
  PaginatedResponse,
  EnrollmentRequest,
} from "@/types";

export class CourseService {
  // Course management
  async getCourses(params?: QueryParams): Promise<PaginatedResponse<Course>> {
    const response = await apiClient.get<PaginatedResponse<Course>>(
      "/courses",
      params
    );
    return response.data!;
  }

  async getCourse(id: string): Promise<Course> {
    const response = await apiClient.get<Course>(`/courses/${id}`);
    return response.data!;
  }

  async createCourse(courseData: {
    title: string;
    description?: string;
    teacherId?: string;
  }): Promise<Course> {
    const response = await apiClient.post<Course>("/courses", courseData);
    return response.data!;
  }

  async updateCourse(id: string, updates: Partial<Course>): Promise<Course> {
    const response = await apiClient.put<Course>(`/courses/${id}`, updates);
    return response.data!;
  }

  async deleteCourse(id: string): Promise<void> {
    await apiClient.delete(`/courses/${id}`);
  }

  // Section management
  async createSection(
    courseId: string,
    sectionData: { title: string; order?: number }
  ): Promise<Section> {
    const response = await apiClient.post<Section>("/courses/sections", {
      ...sectionData,
      courseId,
    });
    return response.data!;
  }

  async updateSection(
    sectionId: string,
    updates: Partial<Section>
  ): Promise<Section> {
    const response = await apiClient.put<Section>(
      `/courses/sections/${sectionId}`,
      updates
    );
    return response.data!;
  }

  async deleteSection(sectionId: string): Promise<void> {
    await apiClient.delete(`/courses/sections/${sectionId}`);
  }

  // Lesson management
  async createLesson(
    sectionId: string,
    lessonData: {
      title: string;
      content?: string;
      videoUrl?: string;
      pdfUrl?: string;
      order?: number;
    }
  ): Promise<Lesson> {
    const response = await apiClient.post<Lesson>("/courses/lessons", {
      ...lessonData,
      sectionId,
    });
    return response.data!;
  }

  async updateLesson(
    lessonId: string,
    updates: Partial<Lesson>
  ): Promise<Lesson> {
    const response = await apiClient.put<Lesson>(
      `/courses/lessons/${lessonId}`,
      updates
    );
    return response.data!;
  }

  async deleteLesson(lessonId: string): Promise<void> {
    await apiClient.delete(`/courses/lessons/${lessonId}`);
  }

  async getSection(sectionId: string): Promise<Section> {
    const response = await apiClient.get<Section>(
      `/courses/sections/${sectionId}`
    );
    return response.data!;
  }

  async getLesson(lessonId: string): Promise<Lesson> {
    const response = await apiClient.get<Lesson>(
      `/courses/lessons/${lessonId}`
    );
    return response.data!;
  }

  // Enrollment management
  async getEnrollments(courseId: string): Promise<Enrollment[]> {
    // Backend endpoint: GET /api/courses/:courseId/enrollments
    const response = await apiClient.get<Enrollment[]>(
      `/courses/${courseId}/enrollments`
    );
    return response.data!;
  }

  async getCourseEnrollments(courseId: string): Promise<any[]> {
    // Backend endpoint: GET /api/courses/:courseId/enrollments
    const response = await apiClient.get<unknown[]>(
      `/courses/${courseId}/enrollments`
    );
    return response.data!;
  }

  async enrollStudent(
    courseId: string,
    studentId: string
  ): Promise<Enrollment> {
    // Backend endpoint: POST /api/courses/:id/enrollments
    const response = await apiClient.post<Enrollment>(
      `/courses/${courseId}/enrollments`,
      { studentId }
    );
    return response.data!;
  }

  async unenrollStudent(courseId: string, studentId: string): Promise<void> {
    // Backend endpoint: DELETE /api/courses/:id/enrollments/:studentId
    await apiClient.delete(`/courses/${courseId}/enrollments/${studentId}`);
  }

  async enrollInCourse(
    courseId: string,
    studentId?: string
  ): Promise<Enrollment> {
    // Backend endpoint: POST /api/courses/:id/enrollments
    const response = await apiClient.post<Enrollment>(
      `/courses/${courseId}/enrollments`,
      {
        courseId,
        ...(studentId && { studentId }),
      }
    );
    return response.data!;
  }

  // Enrollment Request management
  async createEnrollmentRequest(
    courseId: string,
    message?: string
  ): Promise<EnrollmentRequest> {
    // Backend endpoint: POST /api/courses/:id/enrollment-requests
    const response = await apiClient.post<EnrollmentRequest>(
      `/courses/${courseId}/enrollment-requests`,
      {
        message,
      }
    );
    return response.data!;
  }

  async getEnrollmentRequests(filters?: {
    status?: "PENDING" | "APPROVED" | "REJECTED";
    courseId?: string;
    studentId?: string;
  }): Promise<EnrollmentRequest[]> {
    // Backend endpoint: GET /api/enrollments/requests (alternative endpoint)
    const response = await apiClient.get<EnrollmentRequest[]>(
      "/enrollments/requests",
      filters
    );
    return response.data || [];
  }

  async getStudentEnrollmentRequests(): Promise<EnrollmentRequest[]> {
    // Backend endpoint: GET /api/enrollments/my/requests
    const response = await apiClient.get<EnrollmentRequest[]>(
      `/enrollments/my/requests`
    );
    return response.data || [];
  }

  async reviewEnrollmentRequest(
    requestId: string,
    status: "APPROVED" | "REJECTED",
    adminNote?: string
  ): Promise<EnrollmentRequest> {
    // Backend endpoint: PUT /api/courses/enrollment-requests/:requestId
    const response = await apiClient.put<EnrollmentRequest>(
      `/courses/enrollment-requests/${requestId}`,
      {
        status,
        adminNote,
      }
    );
    return response.data!;
  }

  async getEnrollmentRequestById(
    requestId: string
  ): Promise<EnrollmentRequest> {
    // Backend endpoint: GET /api/courses/enrollment-requests/:requestId
    const response = await apiClient.get<EnrollmentRequest>(
      `/courses/enrollment-requests/${requestId}`
    );
    return response.data!;
  }

  async unenrollFromCourse(courseId: string, studentId: string): Promise<void> {
    // Backend endpoint: DELETE /api/courses/:id/enrollments/:studentId
    await apiClient.delete(`/courses/${courseId}/enrollments/${studentId}`);
  }

  async getStudentEnrollments(studentId: string): Promise<Enrollment[]> {
    // Backend endpoint: GET /api/courses/student/:studentId/enrollments
    const response = await apiClient.get<Enrollment[]>(
      `/courses/student/${studentId}/enrollments`
    );
    return response.data!;
  }

  // Get current user's enrollments (for students)
  async getMyEnrollments(): Promise<Enrollment[]> {
    // Backend endpoint: GET /api/enrollments/my
    const response = await apiClient.get<Enrollment[]>("/enrollments/my");
    return response.data!;
  }

  // Progress tracking
  async markLessonComplete(
    lessonId: string,
    completed: boolean = true
  ): Promise<Completion> {
    // Backend endpoint: PUT /api/courses/lessons/:lessonId/completion
    const response = await apiClient.put<Completion>(
      `/courses/lessons/${lessonId}/completion`,
      {
        completed,
      }
    );
    return response.data!;
  }

  async markLessonIncomplete(lessonId: string): Promise<void> {
    // Use the same endpoint with completed: false
    await this.markLessonComplete(lessonId, false);
  }

  async getStudentProgress(
    courseId: string,
    studentId: string
  ): Promise<{
    completedLessons: number;
    totalLessons: number;
    completionPercentage: number;
    completions: Completion[];
  }> {
    const response = await apiClient.get<{
      completedLessons: number;
      totalLessons: number;
      completionPercentage: number;
      completions: Completion[];
    }>(`/courses/${courseId}/progress/${studentId}`);
    return response.data!;
  }

  async getLessonCompletion(
    lessonId: string,
    studentId: string
  ): Promise<Completion | null> {
    const response = await apiClient.get<Completion | null>(
      `/courses/lessons/${lessonId}/completion/${studentId}`
    );
    return response.data!;
  }

  // Teacher specific
  async getTeacherCourses(): Promise<Course[]> {
    const response = await apiClient.get<Course[]>("/courses/teacher");
    return response.data!;
  }

  async assignTeacherToCourse(
    courseId: string,
    teacherId: string
  ): Promise<Course> {
    // Backend endpoint: PUT /api/courses/:id/teacher
    const response = await apiClient.put<Course>(
      `/courses/${courseId}/teacher`,
      {
        teacherId,
      }
    );
    return response.data!;
  }

  async removeTeacherFromCourse(courseId: string): Promise<Course> {
    // Backend endpoint: DELETE /api/courses/:id/teacher
    const response = await apiClient.delete<Course>(
      `/courses/${courseId}/teacher`
    );
    return response.data!;
  }

  async getCoursesByTeacher(teacherId: string): Promise<Course[]> {
    const response = await apiClient.get<Course[]>(
      `/courses/teacher/${teacherId}`
    );
    return response.data!;
  }

  // Student specific
  async getAvailableCoursesForStudent(studentId: string): Promise<Course[]> {
    const response = await apiClient.get<Course[]>(
      `/courses/student/${studentId}/available`
    );
    return response.data!;
  }

  // Bulk operations
  async bulkEnrollStudents(
    courseId: string,
    studentIds: string[]
  ): Promise<Enrollment[]> {
    // Backend endpoint: POST /api/courses/:id/enrollments/bulk
    const response = await apiClient.post<Enrollment[]>(
      `/courses/${courseId}/enrollments/bulk`,
      {
        studentIds,
      }
    );
    return response.data!;
  }

  async bulkUnenrollStudents(
    courseId: string,
    studentIds: string[]
  ): Promise<void> {
    // Backend endpoint: POST /api/courses/:id/enrollments/bulk-unenroll
    await apiClient.post(`/courses/${courseId}/enrollments/bulk-unenroll`, {
      studentIds,
    });
  }
}

export const courseService = new CourseService();

// Progress tracking types
interface ProgressData {
  completedLessons: number;
  totalLessons: number;
  completionPercentage: number;
  completions: Completion[];
}

interface QueryClient {
  setQueryData: (key: unknown[], updater: (old: unknown) => unknown) => void;
  removeQueries: (key: unknown[]) => void;
  setQueriesData: (
    filters: {
      queryKey: unknown[];
      predicate?: (query: { queryKey: unknown[] }) => boolean;
    },
    updater: (old: unknown) => unknown
  ) => void;
}

// Optimistic update helpers
export const optimisticCourseUpdates = {
  // Optimistically update course in cache
  updateCourseOptimistically: (
    courseId: string,
    updates: Partial<Course>,
    queryClient: QueryClient
  ) => {
    // Update course detail cache
    queryClient.setQueryData(
      ["courses", "detail", courseId],
      (old: unknown) => {
        const oldCourse = old as Course | undefined;
        return oldCourse ? { ...oldCourse, ...updates } : undefined;
      }
    );

    // Update course in teacher courses
    queryClient.setQueryData(["courses", "teacher"], (old: unknown) => {
      const oldCourses = old as Course[] | undefined;
      return oldCourses?.map((course) =>
        course.id === courseId ? { ...course, ...updates } : course
      );
    });
  },

  // Optimistically add course to cache
  addCourseOptimistically: (newCourse: Course, queryClient: QueryClient) => {
    // Add to teacher courses cache
    queryClient.setQueryData(["courses", "teacher"], (old: unknown) => {
      const oldCourses = old as Course[] | undefined;
      return oldCourses ? [...oldCourses, newCourse] : [newCourse];
    });
  },

  // Optimistically remove course from cache
  removeCourseOptimistically: (courseId: string, queryClient: QueryClient) => {
    // Remove from teacher courses
    queryClient.setQueryData(["courses", "teacher"], (old: unknown) => {
      const oldCourses = old as Course[] | undefined;
      return oldCourses?.filter((course) => course.id !== courseId);
    });

    // Remove course detail cache
    queryClient.removeQueries(["courses", "detail", courseId]);
  },

  // Optimistically update lesson completion
  updateLessonCompletionOptimistically: (
    lessonId: string,
    studentId: string,
    completed: boolean,
    queryClient: QueryClient
  ) => {
    // Update course progress cache
    queryClient.setQueriesData(
      {
        queryKey: ["courses"],
        predicate: (query: { queryKey: unknown[] }) =>
          query.queryKey.includes("progress"),
      },
      (old: unknown) => {
        const oldProgress = old as ProgressData | undefined;
        if (!oldProgress) return oldProgress;

        // Update completion status optimistically
        return {
          ...oldProgress,
          completions:
            oldProgress.completions?.map((completion) =>
              completion.lessonId === lessonId &&
              completion.studentId === studentId
                ? { ...completion, completed }
                : completion
            ) || [],
          completedLessons: completed
            ? (oldProgress.completedLessons || 0) + 1
            : Math.max((oldProgress.completedLessons || 1) - 1, 0),
          completionPercentage:
            oldProgress.totalLessons > 0
              ? Math.round(
                  ((completed
                    ? (oldProgress.completedLessons || 0) + 1
                    : Math.max((oldProgress.completedLessons || 1) - 1, 0)) /
                    oldProgress.totalLessons) *
                    100
                )
              : 0,
        };
      }
    );
  },
};
// Additional types and functions for backward compatibility
export interface CourseWithDetails {
  id: string;
  title: string;
  description: string;
  sections: Section[];
}

export interface StudentProgress {
  id: string;
  studentId: string;
  courseId: string;
  lessonId: string;
  isCompleted: boolean;
  completedAt?: string;
}

// Additional functions for backward compatibility
export const getCourseDetails = async (
  courseId: string
): Promise<CourseWithDetails> => {
  const response = await apiClient.get<CourseWithDetails>(
    `/courses/${courseId}/details`
  );
  return response.data;
};

export const getStudentProgress = async (
  courseId: string
): Promise<StudentProgress[]> => {
  const response = await apiClient.get<StudentProgress[]>(
    `/student/courses/${courseId}/progress`
  );
  return response.data;
};

export const markLessonComplete = async (
  courseId: string,
  lessonId: string
): Promise<void> => {
  await apiClient.post<void>(
    `/student/courses/${courseId}/lessons/${lessonId}/complete`
  );
};

export const unmarkLessonComplete = async (
  courseId: string,
  lessonId: string
): Promise<void> => {
  await apiClient.delete<void>(
    `/student/courses/${courseId}/lessons/${lessonId}/complete`
  );
};
