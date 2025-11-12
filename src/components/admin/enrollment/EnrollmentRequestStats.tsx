"use client";

import { Card } from "@/components/ui/card";
import { Users, CheckCircle, XCircle, Clock, BookOpen, Calendar } from "lucide-react";
import type { EnrollmentRequestStatistics } from "@/types/enrollment.types";

interface EnrollmentRequestStatsProps {
  statistics: EnrollmentRequestStatistics | undefined;
  isLoading: boolean;
}

export function EnrollmentRequestStats({ statistics, isLoading }: EnrollmentRequestStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (!statistics) return null;

  const stats = [
    {
      title: "Toplam Talep",
      value: statistics.totalRequests,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Bekleyen",
      value: statistics.pendingRequests,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Onaylanan",
      value: statistics.approvedRequests,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Reddedilen",
      value: statistics.rejectedRequests,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}