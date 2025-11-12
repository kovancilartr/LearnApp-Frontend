import { Award, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { Course } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface CourseHeaderProps {
  course: Course;
  isEnrolled: boolean;
}

const CourseHeader = ({ course, isEnrolled }: CourseHeaderProps) => {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:items-center text-blue-900 dark:text-blue-100 justify-between gap-3">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
            <span className="text-base sm:text-lg font-semibold truncate">
              {course.title}
            </span>
          </div>

          {(course as Course).teacher && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-gray-700 dark:text-gray-300">
                  Eğitmen: {(course as Course).teacher?.user.name}
                </span>
              </div>

              {isEnrolled ? (
                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-900/50 cursor-default w-fit">
                  Kayıtlı
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 cursor-default w-fit"
                >
                  Kayıt Gerekli
                </Badge>
              )}
            </div>
          )}
        </CardTitle>
        <CardDescription className="text-blue-800 dark:text-blue-200 text-sm sm:text-base">
          {course.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6"></div>
      </CardContent>
    </Card>
  );
};

export default CourseHeader;
