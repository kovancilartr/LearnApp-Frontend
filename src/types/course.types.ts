// Course Types
export interface CreateCourseRequest {
  title: string;
  description?: string;
  teacherId?: string;
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
}

export interface CourseSearchQuery {
  search?: string;
  teacherId?: string;
  page?: number;
  limit?: number;
}

export interface AssignTeacherRequest {
  courseId: string;
  teacherId: string;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  teacherId?: string | null;
  createdAt: string;
  updatedAt: string;
  teacher?: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  } | null;
  sections?: Section[];
  enrollments?: Enrollment[];
  quizzes?: any[];
  _count?: {
    enrollments: number;
    sections: number;
  };
}

export interface CourseWithDetails extends Course {
  sections: (Section & {
    lessons: (Lesson & {
      completions?: {
        completed: boolean;
        createdAt: string;
      }[];
    })[];
  })[];
  enrollments: (Enrollment & {
    student: {
      id: string;
      user: {
        id: string;
        name: string;
        email: string;
      };
    };
  })[];
}

export interface CourseListItem {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  teacher?: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  } | null;
  enrollmentCount: number;
  sectionCount: number;
}

// Section Types
export interface CreateSectionRequest {
  title: string;
  courseId: string;
  order?: number;
}

export interface UpdateSectionRequest {
  title?: string;
  order?: number;
}

export interface Section {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  courseId: string;
  lessons: Lesson[];
  course?: {
    id: string;
    title: string;
  };
}

// Lesson Types
export interface CreateLessonRequest {
  title: string;
  content?: string;
  videoUrl?: string;
  pdfUrl?: string;
  sectionId: string;
  order?: number;
}

export interface UpdateLessonRequest {
  title?: string;
  content?: string;
  videoUrl?: string;
  pdfUrl?: string;
  order?: number;
}

export interface Lesson {
  id: string;
  title: string;
  content?: string | null;
  videoUrl?: string | null;
  pdfUrl?: string | null;
  order: number;
  sectionId: string;
  section?: Section & {
    course: {
      id: string;
      title: string;
    };
  };
  completions?: Completion[];
}

// Enrollment Types
export interface EnrollStudentRequest {
  courseId: string;
  studentId: string;
}

export interface UnenrollStudentRequest {
  courseId: string;
  studentId: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  createdAt: string;
  student?: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  course?: {
    id: string;
    title: string;
    description: string | null;
  };
  status: "ACTIVE" | "PASSIVE";
  progress?: {
    completedLessons: number;
    totalLessons: number;
    completionPercentage: number;
    completions: Completion[];
    lastAccessedAt: string;
  };
}

export interface Completion {
  id: string;
  studentId: string;
  lessonId: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  lesson?: {
    id: string;
    title: string;
  };
}

// Progress Types
export interface LessonProgress {
  id: string;
  title: string;
  order: number;
  completed: boolean;
  completedAt?: string;
}

export interface SectionProgress {
  id: string;
  title: string;
  order: number;
  lessons: LessonProgress[];
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

// Quiz types are now in separate quiz.types.ts file

// Bulk Operations Types
export interface BulkEnrollRequest {
  courseId: string;
  studentIds: string[];
}

export interface BulkUnenrollRequest {
  courseId: string;
  studentIds: string[];
}

export interface BulkEnrollResult {
  successful: string[];
  failed: {
    studentId: string;
    error: string;
  }[];
}
