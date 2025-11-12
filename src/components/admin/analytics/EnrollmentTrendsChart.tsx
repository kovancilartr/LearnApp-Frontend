"use client";

import { useEnrollmentTrends } from "@/hooks";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  TrendingUp,
  AlertCircle,
  Calendar,
  Users,
  BookOpen,
} from "lucide-react";
import { EnrollmentTrends } from "@/types";

interface EnrollmentTrendsChartProps {
  className?: string;
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
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function EnrollmentTrendsChart({ className }: EnrollmentTrendsChartProps) {
  const { data: trends, isLoading, error, refetch } = useEnrollmentTrends();

  if (error) {
    return (
      <div className={className}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Kayıt trendleri yüklenirken hata oluştu: {error.message}</span>
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

  if (!trends || trends.monthly.length === 0) {
    return (
      <div className={className}>
        <Card className="p-8 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Henüz trend verisi yok
          </h3>
          <p className="text-gray-600">
            Kayıt işlemleri gerçekleştikçe trend verileri burada görünecek.
          </p>
        </Card>
      </div>
    );
  }

  // Aylık trend verilerini formatla
  const monthlyData = trends.monthly.map(item => ({
    ay: item.month,
    kayıtlar: item.enrollments,
    tamamlamalar: item.completions,
    talepler: item.requests,
  }));

  // Popüler kursları formatla
  const popularCoursesData = trends.popular.slice(0, 8).map(course => ({
    name: course.title.length > 20 ? course.title.substring(0, 20) + '...' : course.title,
    fullName: course.title,
    kayıtSayısı: course.enrollmentCount,
  }));

  // Özet istatistikler
  const totalEnrollments = trends.monthly.reduce((sum, item) => sum + item.enrollments, 0);
  const totalCompletions = trends.monthly.reduce((sum, item) => sum + item.completions, 0);
  const totalRequests = trends.monthly.reduce((sum, item) => sum + item.requests, 0);
  const completionRate = totalEnrollments > 0 ? (totalCompletions / totalEnrollments * 100).toFixed(1) : 0;

  return (
    <div className={className}>
      {/* Başlık */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
          Kayıt Trendleri
        </h2>
        <Badge variant="outline">
          {trends.monthly.length} ay verisi
        </Badge>
      </div>

      {/* Özet İstatistikler */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {totalEnrollments}
          </div>
          <div className="text-sm text-blue-700">Toplam Kayıt</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {totalCompletions}
          </div>
          <div className="text-sm text-green-700">Tamamlanan</div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {totalRequests}
          </div>
          <div className="text-sm text-purple-700">Toplam Talep</div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            %{completionRate}
          </div>
          <div className="text-sm text-orange-700">Tamamlanma Oranı</div>
        </div>
      </div>

      {/* Ana Grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Aylık Trend Grafiği */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Aylık Kayıt Trendleri
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ay" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="kayıtlar"
                stackId="1"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.6}
                name="Kayıtlar"
              />
              <Area
                type="monotone"
                dataKey="tamamlamalar"
                stackId="1"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.6}
                name="Tamamlamalar"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Kayıt vs Talep Karşılaştırması */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Kayıt vs Talep Karşılaştırması
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ay" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="talepler"
                stroke="#8B5CF6"
                strokeWidth={3}
                name="Talepler"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="kayıtlar"
                stroke="#3B82F6"
                strokeWidth={3}
                name="Kayıtlar"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Popüler Kurslar */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-green-600" />
          En Popüler Kurslar
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={popularCoursesData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{ fontSize: 12 }}
              width={150}
            />
            <Tooltip 
              content={({ active, payload }: { active?: boolean; payload?: any[] }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                      <p className="font-medium text-gray-900">{data.fullName}</p>
                      <p className="text-sm text-blue-600">
                        Kayıt Sayısı: {data.kayıtSayısı}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="kayıtSayısı" fill="#10B981" name="Kayıt Sayısı" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Popüler Kurslar Listesi */}
      {trends.popular.length > 0 && (
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Popüler Kurslar Detayı
          </h3>
          <div className="space-y-3">
            {trends.popular.slice(0, 5).map((course, index) => (
              <div key={course.courseId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{course.title}</h4>
                    <p className="text-sm text-gray-600">Kurs ID: {course.courseId}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="font-semibold text-gray-900">{course.enrollmentCount}</span>
                  <span className="text-sm text-gray-600 ml-1">kayıt</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export { EnrollmentTrendsChart };