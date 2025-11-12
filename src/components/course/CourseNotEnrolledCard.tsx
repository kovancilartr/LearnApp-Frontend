import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Clock, Loader2, UserPlus } from "lucide-react";
import { Button } from "../ui/button";

interface CourseNotEnrolledCardProps {
  enrollmentRequestStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
  handleEnrollmentRequest: () => void;
  createEnrollmentRequestMutation: {
    isPending: boolean;
  };
}
const CourseNotEnrolledCard = ({
  enrollmentRequestStatus,
  handleEnrollmentRequest,
  createEnrollmentRequestMutation,
}: CourseNotEnrolledCardProps) => {
  return (
    <Card
      className={`border-2 ${
        enrollmentRequestStatus === "PENDING"
          ? "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800"
          : enrollmentRequestStatus === "REJECTED"
          ? "bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-800"
          : "bg-gradient-to-br from-orange-50 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-200 dark:border-orange-800"
      }`}
    >
      <CardHeader>
        <CardTitle
          className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 text-sm sm:text-base ${
            enrollmentRequestStatus === "PENDING"
              ? "text-blue-900 dark:text-blue-100"
              : enrollmentRequestStatus === "REJECTED"
              ? "text-red-900 dark:text-red-100"
              : "text-orange-900 dark:text-orange-100"
          }`}
        >
          {enrollmentRequestStatus === "PENDING" ? (
            <>
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              <span>Başvuru Beklemede</span>
            </>
          ) : enrollmentRequestStatus === "REJECTED" ? (
            <>
              <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
              <span>Başvuru Reddedildi</span>
            </>
          ) : (
            <>
              <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
              <span>Kursa Kayıt Ol</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {enrollmentRequestStatus === "PENDING" ? (
            <>
              <p className="text-blue-800 dark:text-blue-200 text-sm sm:text-base">
                Kursa kayıt başvurunuz admin onayını bekliyor. Onaylandığında
                size bildirilecektir.
              </p>
              <div className="flex items-center gap-2 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-800 dark:text-blue-200 font-medium text-sm sm:text-base">
                  Durum: Onay Bekliyor
                </span>
              </div>
            </>
          ) : enrollmentRequestStatus === "REJECTED" ? (
            <>
              <p className="text-red-800 dark:text-red-200 text-sm sm:text-base">
                Kursa kayıt başvurunuz reddedildi. Tekrar başvuru
                yapabilirsiniz.
              </p>
              <Button
                onClick={handleEnrollmentRequest}
                disabled={createEnrollmentRequestMutation.isPending}
                className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 dark:from-red-700 dark:to-pink-700 dark:hover:from-red-800 dark:hover:to-pink-800 text-sm sm:text-base"
              >
                {createEnrollmentRequestMutation.isPending ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                    <span className="hidden sm:inline">Başvuru Gönderiliyor...</span>
                    <span className="sm:hidden">Gönderiliyor...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    <span className="hidden sm:inline">Tekrar Başvur</span>
                    <span className="sm:hidden">Tekrar</span>
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <p className="text-orange-800 dark:text-orange-200 text-sm sm:text-base">
                Bu kursa erişim sağlamak için kayıt başvurusu yapmanız
                gerekiyor. Başvurunuz admin tarafından değerlendirilecektir.
              </p>
              <Button
                onClick={handleEnrollmentRequest}
                disabled={createEnrollmentRequestMutation.isPending}
                className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 dark:from-orange-700 dark:to-yellow-700 dark:hover:from-orange-800 dark:hover:to-yellow-800 text-sm sm:text-base"
              >
                {createEnrollmentRequestMutation.isPending ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                    <span className="hidden sm:inline">Başvuru Gönderiliyor...</span>
                    <span className="sm:hidden">Gönderiliyor...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    <span className="hidden sm:inline">Kayıt Başvurusu Yap</span>
                    <span className="sm:hidden">Başvur</span>
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseNotEnrolledCard;
