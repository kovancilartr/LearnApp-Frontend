import { useState } from "react";
import { CourseWithDetails } from "../CourseManagement";
import { CourseListItem } from "./CourseListItem";

interface CourseListProps {
  courses: CourseWithDetails[];
  onEdit: (course: CourseWithDetails) => void;
  onDelete: (courseId: string) => void;
  onAssignTeacher: (course: CourseWithDetails) => void;
  onViewDetails: (course: CourseWithDetails) => void;
}

export function CourseList({
  courses,
  onEdit,
  onDelete,
  onAssignTeacher,
  onViewDetails,
}: CourseListProps) {
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(
    new Set()
  );

  const toggleExpansion = (courseId: string) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };

  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <CourseListItem
          key={course.id}
          course={course}
          expanded={expandedCourses.has(course.id)}
          onToggleExpansion={() => toggleExpansion(course.id)}
          onEdit={onEdit}
          onDelete={onDelete}
          onAssignTeacher={onAssignTeacher}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
