import { CourseWithDetails } from "../CourseManagement";
import { CourseCard } from "./CourseCard";

interface CourseGridProps {
  courses: CourseWithDetails[];
  onEdit: (course: CourseWithDetails) => void;
  onDelete: (courseId: string) => void;
  onAssignTeacher: (course: CourseWithDetails) => void;
  onViewDetails: (course: CourseWithDetails) => void;
}

export function CourseGrid({
  courses,
  onEdit,
  onDelete,
  onAssignTeacher,
  onViewDetails,
}: CourseGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          onEdit={onEdit}
          onDelete={onDelete}
          onAssignTeacher={onAssignTeacher}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
