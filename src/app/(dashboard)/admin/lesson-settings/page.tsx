"use client";

import { RoleGuard } from "@/components/auth";
import { LessonFocusSettings } from "@/components/admin/LessonFocusSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, BookOpen, Users, BarChart3 } from "lucide-react";

export default function LessonSettingsPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <div className="container mx-auto py-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Ders Ayarları</h1>
            <p className="text-muted-foreground">
              Öğrenci ders deneyimini yönetin ve özelleştirin
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Öğrenciler</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                +12% geçen aydan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Ders</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">456</div>
              <p className="text-xs text-muted-foreground">
                +8 yeni ders bu hafta
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tamamlanma Oranı</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <p className="text-xs text-muted-foreground">
                +5% geçen aydan
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Lesson Focus Settings */}
        <LessonFocusSettings />

        {/* Additional Settings Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Diğer Ders Ayarları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Video Oynatma Ayarları</h4>
                <p className="text-sm text-muted-foreground">
                  Otomatik oynatma, hız kontrolü ve kalite ayarları (Yakında)
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">İlerleme Takibi</h4>
                <p className="text-sm text-muted-foreground">
                  Ders tamamlama kriterleri ve progress tracking ayarları (Yakında)
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Bildirim Ayarları</h4>
                <p className="text-sm text-muted-foreground">
                  Ders hatırlatmaları ve tamamlama bildirimleri (Yakında)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}