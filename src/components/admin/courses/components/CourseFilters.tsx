import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Grid, List } from "lucide-react";
import { ViewMode, FilterStatus, SortBy } from "../CourseManagement";

interface CourseFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filterStatus: FilterStatus;
  onFilterStatusChange: (status: FilterStatus) => void;
  sortBy: SortBy;
  onSortByChange: (sort: SortBy) => void;
}

export function CourseFilters({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  filterStatus,
  onFilterStatusChange,
  sortBy,
  onSortByChange,
}: CourseFiltersProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Kurs adı, açıklama veya öğretmen ara..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={onFilterStatusChange}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="draft">Taslak</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">En Yeni</SelectItem>
              <SelectItem value="oldest">En Eski</SelectItem>
              <SelectItem value="name">İsme Göre</SelectItem>
              <SelectItem value="students">Öğrenci Sayısı</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
