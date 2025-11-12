'use client';

import React, { useState } from 'react';
import { useParentChildren, useParentStats } from '@/hooks/useParentQuery';
import { useAuthStore } from '@/store';
import { toast } from 'react-hot-toast';
import { 
  ChildSelector, 
  ChildProgress, 
  QuizResults, 
  CourseEnrollments 
} from '@/components/parent';
import { DetailedProgressReport } from '@/components/parent/DetailedProgressReport';
import { ChildrenProgressComparison } from '@/components/parent/ChildrenProgressComparison';
import { ProgressNotifications } from '@/components/parent/ProgressNotifications';
import { ProgressExport } from '@/components/parent/ProgressExport';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Award,
  BarChart3,
  Activity,
  RefreshCw,
  Bell,
  FileText
} from 'lucide-react';
import Link from 'next/link';

export function ParentDashboard() {
  const { user } = useAuthStore();

  const [selectedChildId, setSelectedChildId] = useState<string>('');

  // Fetch parent data
  const { 
    data: children = [], 
    isLoading: childrenLoading, 
    error: childrenError,
    refetch: refetchChildren 
  } = useParentChildren();

  const { 
    data: stats, 
    isLoading: statsLoading,
    refetch: refetchStats 
  } = useParentStats();

  // Handle errors with useEffect
  React.useEffect(() => {
    if (childrenError) {
      toast.error('Çocuk bilgileri yüklenirken hata oluştu');
    }
  }, [childrenError, toast]);

  // Auto-select first child if none selected
  if (!selectedChildId && children.length > 0) {
    setSelectedChildId(children[0].id);
  }

  const selectedChild = children.find(child => child.id === selectedChildId);

  const handleRefresh = () => {
    refetchChildren();
    refetchStats();
    toast.success('Veriler yenilendi');
  };

  if (childrenError) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">
                <Users className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Veri Yükleme Hatası
              </h3>
              <p className="text-gray-600 mb-4">
                Çocuk bilgileri yüklenirken bir hata oluştu.
              </p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tekrar Dene
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Veli Dashboard'u
          </h1>
          <p className="text-gray-600 mt-1">
            Hoş geldiniz, {user?.name}! Çocuklarınızın eğitim ilerlemesini takip edin.
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Yenile
        </Button>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Çocuk Sayısı</p>
                <p className="text-2xl font-bold text-gray-900">
                  {childrenLoading ? '...' : children.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Kurs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? '...' : stats?.totalCourses || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Ortalama İlerleme</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? '...' : `%${Math.round(stats?.averageProgress || 0)}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tamamlanan Ders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? '...' : stats?.completedLessons || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Child Selector */}
      <ChildSelector
        childrenList={children}
        selectedChildId={selectedChildId}
        onChildSelect={setSelectedChildId}
        loading={childrenLoading}
      />

      {/* Child Details */}
      {selectedChild && (
        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              İlerleme
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Kurslar
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Quiz Sonuçları
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Aktivite
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Raporlar
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Bildirimler
            </TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-6">
            <ChildProgressTab childId={selectedChildId} />
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <CourseEnrollmentsTab 
              childId={selectedChildId} 
              childName={selectedChild.user.name} 
            />
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-6">
            <QuizResultsTab childId={selectedChildId} />
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <ActivityTab childId={selectedChildId} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <EnhancedReportsTab />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationsTab />
          </TabsContent>
        </Tabs>
      )}

      {/* Quick Actions */}
      {children.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Hızlı İşlemler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/courses">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Tüm Kursları İncele
                </Button>
              </Link>
              
              <Button variant="outline" className="w-full justify-start" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Verileri Yenile
              </Button>
              
              <Link href="/dashboard/parent/reports">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Detaylı Rapor
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Tab Components
function ChildProgressTab({ childId }: { childId: string }) {
  // This would use useChildProgress hook
  // For now, showing placeholder
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center py-8 text-gray-500">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>İlerleme verileri yükleniyor...</p>
          <p className="text-sm text-gray-400 mt-2">
            Bu özellik backend API bağlantısı tamamlandığında aktif olacak.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function CourseEnrollmentsTab({ childId, childName }: { childId: string; childName: string }) {
  // This would use useChildCourses hook
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center py-8 text-gray-500">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>{childName} - Kurs kayıtları yükleniyor...</p>
          <p className="text-sm text-gray-400 mt-2">
            Bu özellik backend API bağlantısı tamamlandığında aktif olacak.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuizResultsTab({ childId }: { childId: string }) {
  // This would use useChildQuizResults hook
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center py-8 text-gray-500">
          <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Quiz sonuçları yükleniyor...</p>
          <p className="text-sm text-gray-400 mt-2">
            Bu özellik backend API bağlantısı tamamlandığında aktif olacak.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityTab({ childId }: { childId: string }) {
  // This would use useChildActivity hook
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center py-8 text-gray-500">
          <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Son aktiviteler yükleniyor...</p>
          <p className="text-sm text-gray-400 mt-2">
            Bu özellik backend API bağlantısı tamamlandığında aktif olacak.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function EnhancedReportsTab() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="detailed-report" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="detailed-report" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Detaylı Rapor
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Karşılaştırma
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Dışa Aktarma
          </TabsTrigger>
        </TabsList>

        <TabsContent value="detailed-report">
          <DetailedProgressReport />
        </TabsContent>

        <TabsContent value="comparison">
          <ChildrenProgressComparison />
        </TabsContent>

        <TabsContent value="export">
          <ProgressExport />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationsTab() {
  return (
    <ProgressNotifications />
  );
}