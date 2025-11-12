import { User } from "./index";

export interface StudentProfile {
  id: string;
  user: User;
  parentId?: string;
  parent?: ParentInfo;
  enrollments?: EnrollmentInfo[];
  completions?: CompletionInfo[];
}

export interface TeacherProfile {
  id: string;
  user: User;
  courses?: CourseInfo[];
}

export interface ParentProfile {
  id: string;
  user: User;
  children: StudentProfile[];
}

export interface ParentInfo {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CourseInfo {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
}

export interface EnrollmentInfo {
  id: string;
  courseId: string;
  course: {
    id: string;
    title: string;
    description?: string;
  };
  createdAt: string;
}

export interface CompletionInfo {
  id: string;
  lessonId: string;
  lesson: {
    id: string;
    title: string;
  };
  completed: boolean;
  createdAt: string;
}

export interface UpdateUserProfileRequest {
  name?: string;
  email?: string;
}

export interface LinkParentChildRequest {
  parentId: string;
  studentId: string;
}

export interface UnlinkParentChildRequest {
  studentId: string;
}

export interface UserSearchQuery {
  search?: string;
  role?: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
  page?: number;
  limit?: number;
}

export interface UserListItem {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
  createdAt: string;
  profileId?: string;
}

export interface RoleSwitchRequest {
  targetRole: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
  childId?: string; // Required when switching to STUDENT role
}



export const getRoleText = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "TEACHER":
      return "Öğretmen";
    case "STUDENT":
      return "Öğrenci";
    case "PARENT":
      return "Veli";
    default:
      return role;
  }
};

export const getRoleColor = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "role-admin";
    case "TEACHER":
      return "role-teacher";
    case "STUDENT":
      return "role-student";
    case "PARENT":
      return "role-parent";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }
};
