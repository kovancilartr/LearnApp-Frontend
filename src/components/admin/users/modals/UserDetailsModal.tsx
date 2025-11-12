"use client";

import { User } from "@/types";
import { Button } from "@/components/ui/button";
import {
  X,
  Mail,
  Calendar,
  GraduationCap,
  User as UserIcon,
  BookOpen,
  UserCheck,
  AlertCircle,
  Users,
} from "lucide-react";
import { useUserDetailedProfileQuery } from "@/hooks/useUserQueries";
import { getRoleText } from "@/types/user.types";
import GlobalLoading2 from "@/components/layout/GlobalLoading2";

interface UserDetailsModalProps {
  user: User | null;
  onClose: () => void;
}

export function UserDetailsModal({ user, onClose }: UserDetailsModalProps) {
  const { data: userDetailedProfile, isLoading: loadingUserDetails } =
    useUserDetailedProfileQuery(user?.id || "", !!user);

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-8 pb-8 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden mx-4">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <UserIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-indigo-100 text-sm">
                  {getRoleText(user.role)} Detayları
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loadingUserDetails ? (
            <GlobalLoading2 contentText="Detaylar yükleniyor..." />
          ) : (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2 text-indigo-600" />
                  Temel Bilgiler
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      E-posta:
                    </span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Kayıt Tarihi:
                    </span>
                    <span className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Role-specific Information */}
              {user.role === "PARENT" && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-green-600" />
                    Veli Bilgileri
                  </h3>
                  {userDetailedProfile?.parentProfile?.children &&
                  userDetailedProfile.parentProfile.children.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        Kayıtlı Öğrenciler (
                        {userDetailedProfile.parentProfile.children.length}
                        ):
                      </p>
                      {userDetailedProfile.parentProfile.children.map(
                        (child) => (
                          <div
                            key={child.id}
                            className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-700 rounded-lg border"
                          >
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                              <UserCheck className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {child.user?.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {child.user?.email}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-500">
                      <AlertCircle className="h-4 w-4" />
                      <span>Atanmış öğrenci yok</span>
                    </div>
                  )}
                </div>
              )}

              {user.role === "STUDENT" && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />
                    Öğrenci Bilgileri
                  </h3>
                  <div className="space-y-4">
                    {/* Parent Info */}
                    <div>
                      <h4 className="font-medium mb-2">Veli Bilgisi:</h4>
                      {userDetailedProfile?.studentProfile?.parent ? (
                        <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-700 rounded-lg border">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                            <UserCheck className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {
                                userDetailedProfile.studentProfile.parent.user
                                  ?.name
                              }
                            </div>
                            <div className="text-sm text-gray-500">
                              {
                                userDetailedProfile.studentProfile.parent.user
                                  ?.email
                              }
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-500">
                          <AlertCircle className="h-4 w-4" />
                          <span>Atanmış veli yok</span>
                        </div>
                      )}
                    </div>

                    {/* Enrolled Courses */}
                    <div>
                      <h4 className="font-medium mb-2">Kayıtlı Kurslar:</h4>
                      {userDetailedProfile?.studentProfile?.enrollments &&
                      userDetailedProfile.studentProfile.enrollments.length >
                        0 ? (
                        <div className="space-y-2">
                          {userDetailedProfile.studentProfile.enrollments.map(
                            (enrollment) => (
                              <div
                                key={enrollment.id}
                                className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-700 rounded-lg border"
                              >
                                <BookOpen className="h-4 w-4 text-blue-600" />
                                <div>
                                  <div className="font-medium">
                                    {enrollment.course?.title}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {enrollment.course?.description}
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-500">
                          <AlertCircle className="h-4 w-4" />
                          <span>Kayıtlı kurs yok</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {user.role === "TEACHER" && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2 text-purple-600" />
                    Öğretmen Bilgileri
                  </h3>
                  <div>
                    <h4 className="font-medium mb-2">Verdiği Kurslar:</h4>
                    {userDetailedProfile?.teacherProfile?.courses &&
                    userDetailedProfile.teacherProfile.courses.length > 0 ? (
                      <div className="space-y-2">
                        {userDetailedProfile.teacherProfile.courses.map(
                          (course) => (
                            <div
                              key={course.id}
                              className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-700 rounded-lg border"
                            >
                              <BookOpen className="h-4 w-4 text-purple-600" />
                              <div>
                                <div className="font-medium">
                                  {course.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {course.description}
                                </div>
                                <div className="text-xs text-gray-400">
                                  Oluşturulma:{" "}
                                  {new Date(
                                    course.createdAt
                                  ).toLocaleDateString("tr-TR")}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-500">
                        <AlertCircle className="h-4 w-4" />
                        <span>Oluşturulan kurs yok</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {user.role === "ADMIN" && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2 text-red-600" />
                    Admin Bilgileri
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Bu kullanıcı sistem yöneticisi yetkilerine sahiptir.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t dark:border-gray-700">
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose} className="px-6">
              Kapat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
