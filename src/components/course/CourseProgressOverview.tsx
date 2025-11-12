import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Award } from "lucide-react";
import { Progress } from "@radix-ui/react-progress";
import { Course } from "@/types";

interface CourseProgressOverviewProps {
  course: Course;
  progressPercentage: number;
  completedCount: number;
  storeTotalLessons: number;
  totalLessons: number;
}

const CourseProgressOverview = ({
  course,
  progressPercentage,
  completedCount,
  storeTotalLessons,
  totalLessons,
}: CourseProgressOverviewProps) => {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100 text-base sm:text-lg">
          <Award className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
          İlerleme Durumu
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <span className="text-blue-800 dark:text-blue-200 font-medium text-sm sm:text-base">
              Tamamlanan Dersler
            </span>
            <span className="text-blue-900 dark:text-blue-100 font-bold text-base sm:text-lg">
              {completedCount} / {storeTotalLessons || totalLessons}
            </span>
          </div>

          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-3 sm:h-4 bg-blue-200 dark:bg-blue-800" />
            <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm text-blue-700 dark:text-blue-300 gap-1">
              <span>%{progressPercentage} tamamlandı</span>
              <span>
                {(storeTotalLessons || totalLessons) - completedCount} ders
                kaldı
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            <div className="text-center p-2 sm:p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="text-xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {storeTotalLessons || totalLessons}
              </div>
              <div className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 font-medium">
                <span className="hidden sm:inline">Toplam Ders</span>
                <span className="sm:hidden">Toplam</span>
              </div>
            </div>
            <div className="text-center p-2 sm:p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-green-200 dark:border-green-700">
              <div className="text-xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                {completedCount}
              </div>
              <div className="text-xs sm:text-sm text-green-800 dark:text-green-200 font-medium">
                <span className="hidden sm:inline">Tamamlanan</span>
                <span className="sm:hidden">Biten</span>
              </div>
            </div>
            <div className="text-center p-2 sm:p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-orange-200 dark:border-orange-700">
              <div className="text-xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                {(course as Course).quizzes?.length || 0}
              </div>
              <div className="text-xs sm:text-sm text-orange-800 dark:text-orange-200 font-medium">Quiz</div>
            </div>
          </div>

          {progressPercentage === 100 && (
            <div className="text-center p-3 sm:p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
              <div className="text-green-800 dark:text-green-200 font-semibold text-sm sm:text-base">🎉 Tebrikler!</div>
              <div className="text-green-700 dark:text-green-300 text-xs sm:text-sm">
                Bu kursu başarıyla tamamladınız!
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseProgressOverview;
