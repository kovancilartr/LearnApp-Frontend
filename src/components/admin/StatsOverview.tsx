"use client";

import { useDashboardStats } from "@/hooks";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  BookOpen,
  GraduationCap,
  UserCheck,
  FileText,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple" | "orange" | "red" | "gray";
  growth?: number;
  loading?: boolean;
}

function StatCard({
  title,
  value,
  icon,
  color,
  growth,
  loading,
}: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
    red: "bg-red-100 text-red-600",
    gray: "bg-gray-100 text-gray-600",
  };

  const getGrowthIcon = () => {
    if (growth === undefined || growth === 0)
      return <Minus className="h-3 w-3" />;
    return growth > 0 ? (
      <TrendingUp className="h-3 w-3 text-green-600" />
    ) : (
      <TrendingDown className="h-3 w-3 text-red-600" />
    );
  };

  const getGrowthColor = () => {
    if (growth === undefined || growth === 0) return "text-gray-500";
    return growth > 0 ? "text-green-600" : "text-red-600";
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="ml-4 flex-1">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
        {growth !== undefined && (
          <div className="mt-4 flex items-center">
            <Skeleton className="h-3 w-3 mr-1" />
            <Skeleton className="h-3 w-12" />
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className={cn("p-3 rounded-lg", colorClasses[color])}>{icon}</div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">
            {value.toLocaleString("tr-TR")}
          </p>
        </div>
      </div>
      {growth !== undefined && (
        <div className="mt-4 flex items-center">
          {getGrowthIcon()}
          <span className={cn("text-xs font-medium ml-1", getGrowthColor())}>
            {growth === 0
              ? "Değişim yok"
              : `%${Math.abs(growth)} ${growth > 0 ? "artış" : "azalış"}`}
          </span>
          <span className="text-xs text-gray-500 ml-1">bu ay</span>
        </div>
      )}
    </Card>
  );
}

interface StatsOverviewProps {
  className?: string;
}

export function StatsOverview({ className }: StatsOverviewProps) {
  const { data: stats, isLoading, error, refetch } = useDashboardStats();

  if (error) {
    return (
      <div className={className}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>İstatistikler yüklenirken hata oluştu: {error.message}</span>
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

  return (
    <div className={className}>
      {/* Ana İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Toplam Kurs"
          value={stats?.totalCourses || 0}
          icon={<BookOpen className="h-6 w-6" />}
          color="blue"
          growth={stats?.monthlyGrowth.courses}
          loading={isLoading}
        />

        <StatCard
          title="Toplam Öğrenci"
          value={stats?.totalStudents || 0}
          icon={<GraduationCap className="h-6 w-6" />}
          color="green"
          growth={stats?.monthlyGrowth.students}
          loading={isLoading}
        />

        <StatCard
          title="Toplam Öğretmen"
          value={stats?.totalTeachers || 0}
          icon={<Users className="h-6 w-6" />}
          color="purple"
          loading={isLoading}
        />

        <StatCard
          title="Toplam Veli"
          value={stats?.totalParents || 0}
          icon={<Users className="h-6 w-6" />}
          color="orange"
          loading={isLoading}
        />
      </div>

      {/* İkincil İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Toplam Ders"
          value={stats?.totalLessons || 0}
          icon={<FileText className="h-6 w-6" />}
          color="blue"
          loading={isLoading}
        />

        <StatCard
          title="Toplam Quiz"
          value={stats?.totalQuizzes || 0}
          icon={<HelpCircle className="h-6 w-6" />}
          color="purple"
          loading={isLoading}
        />

        <StatCard
          title="Aktif Kayıt"
          value={stats?.activeEnrollments || 0}
          icon={<UserCheck className="h-6 w-6" />}
          color="green"
          growth={stats?.monthlyGrowth.enrollments}
          loading={isLoading}
        />
      </div>

      {/* Bekleyen Talepler */}
      {(stats?.pendingRequests || 0) > 0 && (
        <div className="mt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>{stats?.pendingRequests}</strong> kayıt talebi onay
              bekliyor.{" "}
              <a
                href="/admin/enrollment-requests"
                className="underline hover:no-underline font-medium"
              >
                Talepleri görüntüle →
              </a>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
