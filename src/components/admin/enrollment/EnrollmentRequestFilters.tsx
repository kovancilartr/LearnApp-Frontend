"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, RefreshCw } from "lucide-react";
import type { EnrollmentRequestFilters as Filters } from "@/types/enrollment.types";

interface Course {
  id: string;
  title: string;
}

interface EnrollmentRequestFiltersProps {
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: unknown) => void;
  onReset: () => void;
  courses: Course[] | undefined;
  isLoading: boolean;
}

export function EnrollmentRequestFilters({
  filters,
  onFilterChange,
  onReset,
  courses,
  isLoading,
}: EnrollmentRequestFiltersProps) {
  return (
    <Card className="p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4" />
        <h3 className="font-medium">Filtreler</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Öğrenci adı veya email ara..."
            value={filters.search || ""}
            onChange={(e) => onFilterChange("search", e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={filters.status || "all"}
          onValueChange={(value) =>
            onFilterChange("status", value === "all" ? undefined : value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Durum seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            <SelectItem value="PENDING">Bekleyen</SelectItem>
            <SelectItem value="APPROVED">Onaylanan</SelectItem>
            <SelectItem value="REJECTED">Reddedilen</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.courseId || "all"}
          onValueChange={(value) =>
            onFilterChange("courseId", value === "all" ? undefined : value)
          }
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Kurs seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Kurslar</SelectItem>
            {courses?.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.sortBy || "createdAt"}
          onValueChange={(value) => onFilterChange("sortBy", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sıralama" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Talep Tarihi</SelectItem>
            <SelectItem value="studentName">Öğrenci Adı</SelectItem>
            <SelectItem value="courseTitle">Kurs Adı</SelectItem>
            <SelectItem value="status">Durum</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Select
            value={filters.sortOrder || "desc"}
            onValueChange={(value) => onFilterChange("sortOrder", value)}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Azalan</SelectItem>
              <SelectItem value="asc">Artan</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            onClick={onReset}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Sıfırla
          </Button>
        </div>
      </div>
    </Card>
  );
}