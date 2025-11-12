export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
  // Detailed profile data (optional, loaded when needed)
  studentProfile?: StudentProfile;
  teacherProfile?: TeacherProfile;
  parentProfile?: ParentProfile;
}

export interface StudentProfile {
  id: string;
  userId: string;
  parentId?: string;
  user?: User;
  parent?: ParentProfile;
  enrollments?: Enrollment[];
  completions?: Completion[];
}

export interface TeacherProfile {
  id: string;
  userId: string;
  user?: User;
  courses?: Course[];
}

export interface ParentProfile {
  id: string;
  userId: string;
  user?: User;
  children?: StudentProfile[];
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  course?: Course;
  createdAt: string;
}

export interface Completion {
  id: string;
  studentId: string;
  lessonId: string;
  lesson?: Lesson;
  completed: boolean;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface Lesson {
  id: string;
  title: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: Role;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponseData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface Student {
  id: string;
  userId: string;
  parentId?: string;
  user: User;
  enrollments?: any[];
  completions?: any[];
  attempts?: any[];
}

export interface Parent {
  id: string;
  userId: string;
  user: User;
  children: Student[];
}

export interface ChildProgress {
  studentId: string;
  student: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  };
  totalCourses: number;
  completedLessons: number;
  totalLessons: number;
  averageQuizScore: number;
  recentActivity: ActivityItem[];
  courseProgress: CourseProgress[];
}

export interface CourseProgress {
  courseId: string;
  courseTitle: string;
  completionPercentage: number;
  completedLessons: number;
  totalLessons: number;
  quizScores: QuizScore[];
  lastActivity: string;
}

export interface QuizScore {
  quizId: string;
  quizTitle: string;
  score: number;
  attemptDate: string;
  maxScore: number;
}

export interface ActivityItem {
  id: string;
  type: 'lesson_completed' | 'quiz_completed' | 'course_enrolled';
  title: string;
  description: string;
  timestamp: string;
  courseTitle?: string;
  score?: number;
}