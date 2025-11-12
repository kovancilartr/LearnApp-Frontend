"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RoleGuard } from "@/components/auth";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store";
import { courseService } from "@/lib/services";
import { Course } from "@/types";
import {
  useCreateEnrollmentRequest,
  useStudentEnrollmentRequests,
} from "@/hooks/useCourseQuery";
import { useGlobalProgress } from "@/hooks/useGlobalProgress";
import GlobalLoading from "@/components/layout/GlobalLoading";
import CourseHeader from "@/components/course/CourseHeader";
import CourseNotEnrolledCard from "@/components/course/CourseNotEnrolledCard";
import CourseContent from "@/components/course/CourseContent";

export default function StudentCourseDetailPage() {
  const params = useParams();

  const { user } = useAuthStore();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentRequestStatus, setEnrollmentRequestStatus] = useState<
    "NONE" | "PENDING" | "APPROVED" | "REJECTED"
  >("NONE");

  // Progress store integration
  const {
    getCourseProgressPercentage,
    getCompletedLessonsCount,
    getTotalLessonsCount,
    getLessonCompletionStatus,
    ensureCourseProgress,
  } = useGlobalProgress();

  // React Query hooks
  const createEnrollmentRequestMutation = useCreateEnrollmentRequest();
  const studentId = user?.studentProfile?.id || user?.id;
  const { data: enrollmentRequests } = useStudentEnrollmentRequests(
    studentId || ""
  );

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setIsLoading(true);

        // Fetch course details
        const courseData = await courseService.getCourse(courseId);
        setCourse(courseData);

        if (user?.id) {
          // For enrollment check, we need to use the actual student profile ID
          // Check if student is enrolled using the new endpoint
          try {
            const enrollments = await courseService.getMyEnrollments();
            const isStudentEnrolled = enrollments.some(
              (enrollment) => enrollment.courseId === courseId
            );
            setIsEnrolled(isStudentEnrolled);

            // If enrolled, initialize progress store
            if (isStudentEnrolled && user?.studentProfile?.id) {
              await ensureCourseProgress(courseId);
            }
          } catch (enrollmentError) {
            console.error("Error checking enrollments:", enrollmentError);
            // If we can't check enrollments, assume not enrolled
            setIsEnrolled(false);
          }
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        toast.error("Kurs bilgileri yüklenirken bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, user?.id, user?.studentProfile?.id, ensureCourseProgress]);

  // Check enrollment request status
  useEffect(() => {
    if (enrollmentRequests && courseId) {
      const request = enrollmentRequests.find(
        (req) => req.courseId === courseId
      );
      if (request) {
        setEnrollmentRequestStatus(request.status);
      } else {
        setEnrollmentRequestStatus("NONE");
      }
    }
  }, [enrollmentRequests, courseId]);

  const handleEnrollmentRequest = async () => {
    if (!user?.id) {
      toast.error(
        "Kursa kayıt başvurusu yapmak için giriş yapmanız gerekiyor."
      );
      return;
    }

    try {
      await createEnrollmentRequestMutation.mutateAsync({
        courseId,
        message: "Kursa katılmak istiyorum.",
      });

      setEnrollmentRequestStatus("PENDING");
      toast.success(
        "Kursa kayıt başvurunuz gönderildi! Admin onayını bekliyor."
      );
    } catch (error) {
      console.error("Error creating enrollment request:", error);
      toast.error("Kayıt başvurusu gönderilirken bir hata oluştu.");
    }
  };

  const totalLessons =
    course?.sections?.reduce(
      (sum, section) => sum + (section.lessons?.length || 0),
      0
    ) || 0;

  // Get real-time progress from store
  const progressPercentage = isEnrolled
    ? getCourseProgressPercentage(courseId)
    : 0;
  const completedCount = isEnrolled ? getCompletedLessonsCount(courseId) : 0;
  const storeTotalLessons = isEnrolled
    ? getTotalLessonsCount(courseId)
    : totalLessons;

  if (isLoading || !course) {
    return (
      <RoleGuard allowedRoles={["STUDENT"]}>
        <GlobalLoading />
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["STUDENT"]}>
      <div className="space-y-6">
        {/* Course Header */}
        <CourseHeader course={course} isEnrolled={isEnrolled} />

        {/* Enrollment Card */}
        {!isEnrolled && (
          <CourseNotEnrolledCard
            enrollmentRequestStatus={enrollmentRequestStatus}
            handleEnrollmentRequest={handleEnrollmentRequest}
            createEnrollmentRequestMutation={createEnrollmentRequestMutation}
          />
        )}

        {/* Course Content */}

        <CourseContent
          course={course}
          courseId={courseId}
          completedCount={completedCount}
          progressPercentage={progressPercentage}
          storeTotalLessons={storeTotalLessons}
          totalLessons={totalLessons}
          getLessonCompletionStatus={getLessonCompletionStatus}
          isEnrolled={isEnrolled}
          enrollmentRequestStatus={enrollmentRequestStatus}
          handleEnrollmentRequest={handleEnrollmentRequest}
          createEnrollmentRequestMutation={createEnrollmentRequestMutation}
        />
      </div>
    </RoleGuard>
  );
}
