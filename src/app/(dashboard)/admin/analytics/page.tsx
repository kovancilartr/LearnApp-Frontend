"use client";

import {
  StatsOverview,
  CourseAnalyticsChart,
  EnrollmentTrendsChart,
  PopularCoursesTable,
  ExportButton,
} from "@/components/admin";
export default function AnalyticsPage() {

  return (
    <div className="space-y-6">
      {/* Sayfa Başlığı */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Sistem performansını ve kullanım istatistiklerini görüntüleyin
          </p>
        </div>

        {/* Hızlı Export */}
        <ExportButton showFilters={false} variant="outline" />
      </div>

      {/* Ana İstatistikler */}
      <StatsOverview />

      {/* Kurs Analitiği */}
      <CourseAnalyticsChart className="mb-8" />

      {/* Kayıt Trendleri */}
      <EnrollmentTrendsChart className="mb-8" />

      {/* Popüler Kurslar Tablosu */}
      <PopularCoursesTable className="mb-8" />

      {/* Gelişmiş Export Bileşeni */}
      <ExportButton />
    </div>
  );
}
