"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useAnalyticsExport,
  useDashboardStats,
  useCourseAnalytics,
  useEnrollmentTrends,
} from "@/hooks";
import {
  Download,
  FileText,
  Database,
  Filter,
  CheckCircle,
  AlertCircle,
  Calendar,
  Users,
  BookOpen,
  TrendingUp,
} from "lucide-react";

interface ExportOptions {
  dashboard: boolean;
  courses: boolean;
  users: boolean;
  enrollments: boolean;
  teachers: boolean;
}

interface ExportButtonProps {
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  showFilters?: boolean;
}

export function ExportButton({
  className,
  variant = "default",
  size = "default",
  showFilters = true,
}: ExportButtonProps) {
  const { downloadCSV, downloadJSON } = useAnalyticsExport();
  const { data: dashboardStats } = useDashboardStats();
  const { data: courses } = useCourseAnalytics();
  const { data: trends } = useEnrollmentTrends();

  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    dashboard: true,
    courses: true,
    users: true,
    enrollments: true,
    teachers: true,
  });
  const [lastExport, setLastExport] = useState<{
    type: string;
    format: string;
    timestamp: Date;
  } | null>(null);

  const handleExport = async (
    format: "csv" | "json",
    type: string = "overview"
  ) => {
    try {
      setIsExporting(true);

      if (format === "csv") {
        await downloadCSV(type);
      } else {
        await downloadJSON(type);
      }

      setLastExport({
        type,
        format: format.toUpperCase(),
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Export hatası:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleBulkExport = async (format: "csv" | "json") => {
    try {
      setIsExporting(true);

      const selectedTypes = Object.entries(exportOptions)
        .filter(([_, selected]) => selected)
        .map(([type, _]) => type);

      for (const type of selectedTypes) {
        await new Promise((resolve) => setTimeout(resolve, 500)); // Rate limiting
        if (format === "csv") {
          await downloadCSV(type);
        } else {
          await downloadJSON(type);
        }
      }

      setLastExport({
        type: `${selectedTypes.length} dosya`,
        format: format.toUpperCase(),
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Toplu export hatası:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const getDataStats = () => {
    return {
      dashboard: dashboardStats ? 1 : 0,
      courses: courses?.length || 0,
      users:
        dashboardStats?.totalStudents +
          dashboardStats?.totalTeachers +
          dashboardStats?.totalParents || 0,
      enrollments: trends?.monthly?.length || 0,
      teachers: dashboardStats?.totalTeachers || 0,
    };
  };

  const dataStats = getDataStats();
  const selectedCount = Object.values(exportOptions).filter(Boolean).length;

  if (!showFilters) {
    // Basit export butonu
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={className}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "İndiriliyor..." : "Dışa Aktar"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Format Seçin</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleExport("csv")}>
            <FileText className="h-4 w-4 mr-2" />
            CSV İndir
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport("json")}>
            <Database className="h-4 w-4 mr-2" />
            JSON İndir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className={className}>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Download className="h-5 w-5 mr-2 text-blue-600" />
            Veri Dışa Aktarma
          </h3>
          {lastExport && (
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              Son: {lastExport.format} -{" "}
              {lastExport.timestamp.toLocaleTimeString("tr-TR")}
            </Badge>
          )}
        </div>

        {/* Veri Seçimi */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Dışa Aktarılacak Veriler ({selectedCount}/5)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Checkbox
                id="dashboard"
                checked={exportOptions.dashboard}
                onCheckedChange={(checked) =>
                  setExportOptions((prev) => ({
                    ...prev,
                    dashboard: !!checked,
                  }))
                }
              />
              <div className="flex-1">
                <label
                  htmlFor="dashboard"
                  className="text-sm font-medium text-gray-900 cursor-pointer"
                >
                  Dashboard İstatistikleri
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <TrendingUp className="h-3 w-3 text-blue-600" />
                  <span className="text-xs text-gray-600">
                    {dataStats.dashboard} veri seti
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Checkbox
                id="courses"
                checked={exportOptions.courses}
                onCheckedChange={(checked) =>
                  setExportOptions((prev) => ({ ...prev, courses: !!checked }))
                }
              />
              <div className="flex-1">
                <label
                  htmlFor="courses"
                  className="text-sm font-medium text-gray-900 cursor-pointer"
                >
                  Kurs Analitiği
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <BookOpen className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-gray-600">
                    {dataStats.courses} kurs
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Checkbox
                id="users"
                checked={exportOptions.users}
                onCheckedChange={(checked) =>
                  setExportOptions((prev) => ({ ...prev, users: !!checked }))
                }
              />
              <div className="flex-1">
                <label
                  htmlFor="users"
                  className="text-sm font-medium text-gray-900 cursor-pointer"
                >
                  Kullanıcı Analitiği
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Users className="h-3 w-3 text-purple-600" />
                  <span className="text-xs text-gray-600">
                    {dataStats.users} kullanıcı
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Checkbox
                id="enrollments"
                checked={exportOptions.enrollments}
                onCheckedChange={(checked) =>
                  setExportOptions((prev) => ({
                    ...prev,
                    enrollments: !!checked,
                  }))
                }
              />
              <div className="flex-1">
                <label
                  htmlFor="enrollments"
                  className="text-sm font-medium text-gray-900 cursor-pointer"
                >
                  Kayıt Trendleri
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-3 w-3 text-orange-600" />
                  <span className="text-xs text-gray-600">
                    {dataStats.enrollments} ay verisi
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Checkbox
                id="teachers"
                checked={exportOptions.teachers}
                onCheckedChange={(checked) =>
                  setExportOptions((prev) => ({ ...prev, teachers: !!checked }))
                }
              />
              <div className="flex-1">
                <label
                  htmlFor="teachers"
                  className="text-sm font-medium text-gray-900 cursor-pointer"
                >
                  Öğretmen Atamaları
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Users className="h-3 w-3 text-red-600" />
                  <span className="text-xs text-gray-600">
                    {dataStats.teachers} öğretmen
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hızlı Seçim */}
        <div className="mb-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setExportOptions({
                  dashboard: true,
                  courses: true,
                  users: true,
                  enrollments: true,
                  teachers: true,
                })
              }
            >
              Tümünü Seç
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setExportOptions({
                  dashboard: false,
                  courses: false,
                  users: false,
                  enrollments: false,
                  teachers: false,
                })
              }
            >
              Hiçbirini Seçme
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setExportOptions({
                  dashboard: true,
                  courses: true,
                  users: false,
                  enrollments: false,
                  teachers: false,
                })
              }
            >
              Temel Veriler
            </Button>
          </div>
        </div>

        {/* Export Butonları */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => handleBulkExport("csv")}
            disabled={isExporting || selectedCount === 0}
            className="flex-1"
          >
            <FileText className="h-4 w-4 mr-2" />
            {isExporting
              ? "CSV İndiriliyor..."
              : `CSV İndir (${selectedCount} dosya)`}
          </Button>

          <Button
            variant="outline"
            onClick={() => handleBulkExport("json")}
            disabled={isExporting || selectedCount === 0}
            className="flex-1"
          >
            <Database className="h-4 w-4 mr-2" />
            {isExporting
              ? "JSON İndiriliyor..."
              : `JSON İndir (${selectedCount} dosya)`}
          </Button>
        </div>

        {/* Uyarı Mesajı */}
        {selectedCount === 0 && (
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Dışa aktarmak için en az bir veri türü seçmelisiniz.
            </AlertDescription>
          </Alert>
        )}

        {/* Tek Dosya Export Seçenekleri */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Tek Dosya İndirme
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleExport("csv", "dashboard")}
              disabled={isExporting}
              className="justify-start"
            >
              <TrendingUp className="h-3 w-3 mr-2" />
              Dashboard CSV
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleExport("csv", "courses")}
              disabled={isExporting}
              className="justify-start"
            >
              <BookOpen className="h-3 w-3 mr-2" />
              Kurslar CSV
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleExport("csv", "users")}
              disabled={isExporting}
              className="justify-start"
            >
              <Users className="h-3 w-3 mr-2" />
              Kullanıcılar CSV
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleExport("json", "overview")}
              disabled={isExporting}
              className="justify-start"
            >
              <Database className="h-3 w-3 mr-2" />
              Genel Bakış JSON
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleExport("csv", "enrollments")}
              disabled={isExporting}
              className="justify-start"
            >
              <Calendar className="h-3 w-3 mr-2" />
              Kayıtlar CSV
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleExport("csv", "teachers")}
              disabled={isExporting}
              className="justify-start"
            >
              <Users className="h-3 w-3 mr-2" />
              Öğretmenler CSV
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
