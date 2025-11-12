"use client";

import { useCourseAnalytics } from "@/hooks";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { BookOpen, AlertCircle, BarChart3 } from "lucide-react";

interface CourseAnalyticsChartProps {
  className?: string;
  limit?: number;
}

// Recharts için özel tooltip bileşeni
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{label}</p>
        {payload.map((entry, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
            {entry.name.includes("Oran") ? "%" : ""}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Pie chart için renkler
const COLORS = [
  "#3B82F6",
  "#10B981",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#6B7280",
];

function CourseAnalyticsChart({
  className,
  limit = 10,
}: CourseAnalyticsChartProps) {
  const { data: courses, isLoading, error, refetch } = useCourseAnalytics();

  if (error) {
    return (
      <div className={className}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Kurs analitiği yüklenirken hata oluştu: {error.message}</span>
            <button
              onClick={() => refetch()}
              className="ml-2 text-sm underline hover:no-underline"
            >
              Tekrar dene
            </button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
          </Card>
          <Card className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  const displayCourses = courses?.slice(0, limit) || [];

  if (displayCourses.length === 0) {
    return (
      <div className={className}>
        <Card className="p-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Henüz kurs verisi yok
          </h3>
          <p className="text-gray-600">
            Sistem kurslara kayıt olduğunda analitik veriler burada görünecek.
          </p>
        </Card>
      </div>
    );
  }

  // Grafik verileri hazırlama
  const barChartData = displayCourses.map((course) => ({
    name:
      course.title.length > 15
        ? course.title.substring(0, 15) + "..."
        : course.title,
    fullName: course.title,
    öğrenci: course.studentCount,
    tamamlanma: course.completionRate,
    ilerleme: course.averageProgress,
  }));

  const pieChartData = displayCourses.map((course, index) => ({
    name:
      course.title.length > 20
        ? course.title.substring(0, 20) + "..."
        : course.title,
    value: course.studentCount,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className={className}>
      {/* Başlık */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
          Kurs Analitiği
        </h2>
        <Badge variant="outline">{courses?.length || 0} kurs</Badge>
      </div>

      {/* Grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bar Chart - Öğrenci Sayıları ve Tamamlanma Oranları */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Öğrenci Sayıları ve Tamamlanma Oranları
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="öğrenci" fill="#3B82F6" name="Öğrenci Sayısı" />
              <Bar
                dataKey="tamamlanma"
                fill="#10B981"
                name="Tamamlanma Oranı %"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie Chart - Öğrenci Dağılımı */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Kurslara Göre Öğrenci Dağılımı
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value} öğrenci`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Yüzde Bilgileri */}
          <div className="mt-4 space-y-2">
            {pieChartData.map((entry, index) => {
              const totalStudents = pieChartData.reduce(
                (sum, item) => sum + item.value,
                0
              );
              const percentage =
                totalStudents > 0
                  ? ((entry.value / totalStudents) * 100).toFixed(1)
                  : 0;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-gray-700">{entry.name}</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {entry.value} öğrenci (%{percentage})
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Line Chart - İlerleme Karşılaştırması */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Kurs İlerleme Karşılaştırması
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={barChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="tamamlanma"
              stroke="#10B981"
              strokeWidth={2}
              name="Tamamlanma Oranı %"
            />
            <Line
              type="monotone"
              dataKey="ilerleme"
              stroke="#8B5CF6"
              strokeWidth={2}
              name="Ortalama İlerleme %"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Özet İstatistikler */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {courses?.reduce((sum, course) => sum + course.studentCount, 0) ||
              0}
          </div>
          <div className="text-sm text-blue-700">Toplam Öğrenci</div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {courses?.reduce((sum, course) => sum + course.lessonCount, 0) || 0}
          </div>
          <div className="text-sm text-green-700">Toplam Ders</div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {courses?.reduce((sum, course) => sum + course.quizCount, 0) || 0}
          </div>
          <div className="text-sm text-purple-700">Toplam Quiz</div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {courses?.length
              ? (
                  courses.reduce(
                    (sum, course) => sum + course.completionRate,
                    0
                  ) / courses.length
                ).toFixed(1)
              : 0}
            %
          </div>
          <div className="text-sm text-orange-700">Ort. Tamamlanma</div>
        </div>
      </div>
    </div>
  );
}

export { CourseAnalyticsChart };
