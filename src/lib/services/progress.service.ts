import { apiClient } from "../api";

export interface LessonCompletion {
  lessonId: string;
  studentId: string;
  completed: boolean;
  completedAt: string | null;
  previousStatus: boolean;
  toggleAction: 'completed' | 'uncompleted' | 'unchanged';
  firstCompletedAt: string | null;
  lastModifiedAt: string;
  courseProgress: {
    courseId: string;
    completedLessons: number;
    totalLessons: number;
    progressPercentage: number;
  };
}

export interface CourseProgress {
  courseId: string;
  courseTitle: string;
  studentId: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  sections: SectionProgress[];
  enrolledAt: string;
}

export interface SectionProgress {
  id: string;
  title: string;
  order: number;
  lessons: LessonProgress[];
}

export interface LessonProgress {
  id: string;
  title: string;
  order: number;
  completed: boolean;
  completedAt?: string;
}

export interface StudentProgressSummary {
  studentId: string;
  studentName: string;
  studentEmail: string;
  totalCourses: number;
  totalLessonsCompleted: number;
  totalLessonsAvailable: number;
  overallProgressPercentage: number;
  courseProgresses: CourseProgress[];
}

export interface RecentCompletion {
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  courseTitle: string;
  sectionTitle: string;
  completedAt: string;
}

export interface CourseCompletionAnalytics {
  courseId: string;
  courseTitle: string;
  totalLessons: number;
  totalSections: number;
  overallStats: {
    totalStudents: number;
    averageCompletionPercentage: number;
    studentsFullyCompleted: number;
    studentsStarted: number;
    studentsNotStarted: number;
  };
  sectionBreakdown: {
    sectionId: string;
    sectionTitle: string;
    sectionOrder: number;
    totalLessons: number;
    averageCompletionPercentage: number;
    lessonsCompleted: number;
  }[];
  studentSpecificData?: {
    studentId: string;
    completedLessons: number;
    completionPercentage: number;
    lastActivityAt: string | null;
    completionsBySection: {
      sectionId: string;
      completedLessons: number;
      totalLessons: number;
      percentage: number;
    }[];
  };
}

export interface ProgressCertificate {
  courseId: string;
  courseTitle: string;
  studentName: string;
  completionDate: string;
  completionPercentage: number;
  certificateId: string;
}

export interface DetailedProgressAnalytics {
  courseId: string;
  studentId: string;
  completionData: {
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
  };
  timeAnalytics: {
    firstLessonCompletedAt: string | null;
    lastLessonCompletedAt: string | null;
    averageTimePerLesson: number;
  };
  sectionBreakdown: {
    sectionId: string;
    sectionTitle: string;
    completedLessons: number;
    totalLessons: number;
    percentage: number;
  }[];
}

export interface BulkProgressAnalytics {
  studentId: string;
  overallStats: {
    totalCoursesEnrolled: number;
    totalCoursesCompleted: number;
    totalLessonsCompleted: number;
    overallProgressPercentage: number;
  };
  courseBreakdown: {
    courseId: string;
    courseTitle: string;
    progressPercentage: number;
    completedLessons: number;
    totalLessons: number;
    lastActivityAt: string | null;
  }[];
}

export const progressService = {
  /**
   * Update lesson completion status (toggle functionality)
   */
  async updateLessonCompletion(
    lessonId: string,
    completed: boolean,
    childId?: string
  ): Promise<LessonCompletion> {
    const response = await apiClient.post<LessonCompletion>('/progress/lesson-completion', {
      lessonId,
      completed,
      childId,
    });
    return response.data;
  },

  /**
   * Get course progress for student
   */
  async getCourseProgress(
    courseId: string,
    studentId: string
  ): Promise<CourseProgress> {
    const response = await apiClient.get<CourseProgress>(
      `/progress/course/${courseId}/student/${studentId}`
    );
    return response.data;
  },

  /**
   * Get student progress summary across all courses
   */
  async getStudentProgressSummary(
    studentId: string
  ): Promise<StudentProgressSummary> {
    const response = await apiClient.get<StudentProgressSummary>(`/progress/student/${studentId}/summary`);
    return response.data;
  },

  /**
   * Get recent lesson completions for student
   */
  async getRecentCompletions(
    studentId: string,
    limit: number = 10
  ): Promise<RecentCompletion[]> {
    const response = await apiClient.get<RecentCompletion[]>(
      `/progress/student/${studentId}/recent-completions`,
      { params: { limit } }
    );
    return response.data;
  },

  /**
   * Get lesson completion status
   */
  async getLessonCompletionStatus(
    lessonId: string,
    studentId: string
  ): Promise<boolean> {
    const response = await apiClient.get<{ completed: boolean }>(
      `/progress/lesson/${lessonId}/student/${studentId}/status`
    );
    return response.data.completed || false;
  },

  /**
   * Get detailed course completion analytics
   */
  async getCourseCompletionAnalytics(
    courseId: string,
    studentId?: string
  ): Promise<CourseCompletionAnalytics> {
    const response = await apiClient.get<CourseCompletionAnalytics>(
      `/progress/course/${courseId}/analytics`,
      { params: studentId ? { studentId } : {} }
    );
    return response.data;
  },

  /**
   * Get detailed progress analytics for a specific course and student
   */
  async getDetailedProgressAnalytics(
    courseId: string,
    studentId: string
  ): Promise<DetailedProgressAnalytics> {
    const response = await apiClient.get<DetailedProgressAnalytics>(
      `/progress/course/${courseId}/student/${studentId}/detailed-analytics`
    );
    return response.data;
  },

  /**
   * Get bulk progress analytics for all student's courses
   */
  async getBulkProgressAnalytics(studentId: string): Promise<BulkProgressAnalytics> {
    const response = await apiClient.get<BulkProgressAnalytics>(
      `/progress/student/${studentId}/bulk-analytics`
    );
    return response.data;
  },

  /**
   * Generate course completion certificate
   */
  async generateCertificate(
    courseId: string,
    studentId: string
  ): Promise<ProgressCertificate> {
    const courseProgress = await this.getCourseProgress(courseId, studentId);
    
    if (courseProgress.progressPercentage < 100) {
      throw new Error('Course must be 100% completed to generate certificate');
    }

    return {
      courseId: courseProgress.courseId,
      courseTitle: courseProgress.courseTitle,
      studentName: 'Student Name', // This would come from user context
      completionDate: new Date().toISOString(),
      completionPercentage: courseProgress.progressPercentage,
      certificateId: `CERT-${courseId}-${studentId}-${Date.now()}`,
    };
  },
};

// Backward compatibility
export const ProgressService = {
  updateLessonCompletion: progressService.updateLessonCompletion,
  getCourseProgress: progressService.getCourseProgress,
  getStudentProgressSummary: progressService.getStudentProgressSummary,
  getRecentCompletions: progressService.getRecentCompletions,
  getLessonCompletionStatus: progressService.getLessonCompletionStatus,
  getCourseCompletionAnalytics: progressService.getCourseCompletionAnalytics,
  getDetailedProgressAnalytics: progressService.getDetailedProgressAnalytics,
  getBulkProgressAnalytics: progressService.getBulkProgressAnalytics,
  generateCertificate: progressService.generateCertificate,
};