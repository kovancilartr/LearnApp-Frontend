"use client";

import { useAuthStore } from "@/store";
import { Card } from "@/components/ui/card";
import { StatsOverview } from "@/components/admin";
import Link from "next/link";
import {
  Users,
  BookOpen,
  BarChart3,
  UserPlus,
} from "lucide-react";

export function AdminDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Hoş geldiniz, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Admin dashboard'unuzdan tüm sistemi yönetebilir ve istatistikleri
          görüntüleyebilirsiniz.
        </p>
      </div>

      {/* Analytics İstatistikleri */}
      <StatsOverview />

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Hızlı İşlemler
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/users"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Users className="h-5 w-5 text-blue-600 mr-3" />
            <span className="text-sm font-medium text-blue-900">
              Kullanıcı Yönetimi
            </span>
          </Link>

          <Link
            href="/admin/courses"
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <BookOpen className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-sm font-medium text-green-900">
              Kurs Yönetimi
            </span>
          </Link>

          <Link
            href="/admin/analytics"
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <BarChart3 className="h-5 w-5 text-purple-600 mr-3" />
            <span className="text-sm font-medium text-purple-900">
              Analitik
            </span>
          </Link>

          <Link
            href="/admin/enrollment-requests"
            className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <UserPlus className="h-5 w-5 text-orange-600 mr-3" />
            <span className="text-sm font-medium text-orange-900">
              Kayıt Talepleri
            </span>
          </Link>
        </div>
      </div>

      {/* Management Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Son Eklenen Kullanıcılar
          </h2>
          <div className="space-y-3">
            <div className="text-center py-8 text-gray-500">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Son kullanıcı verileri yükleniyor...</p>
              <p className="text-xs mt-1">TODO: Backend'den son eklenen kullanıcıları çek</p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/admin/users"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Tüm kullanıcıları görüntüle →
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Son Oluşturulan Kurslar
          </h2>
          <div className="space-y-3">
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Son kurs verileri yükleniyor...</p>
              <p className="text-xs mt-1">TODO: Backend'den son oluşturulan kursları çek</p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/admin/courses"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Tüm kursları görüntüle →
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Son Aktiviteler
        </h2>
        <div className="space-y-3">
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Son aktivite verileri yükleniyor...</p>
            <p className="text-xs mt-1">TODO: Backend'den sistem aktivitelerini çek</p>
          </div>
        </div>
      </div>
    </div>
  );
}
