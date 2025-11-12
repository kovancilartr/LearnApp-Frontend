'use client';

import React, { useState } from 'react';
import { useProgressNotifications } from '@/hooks/useParentQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Trophy, 
  Target, 
  AlertTriangle, 
  Clock,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Filter,
  Users
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface ProgressNotificationsProps {
  className?: string;
}

export function ProgressNotifications({ className }: ProgressNotificationsProps) {

  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  
  const { 
    data: notificationsData, 
    isLoading, 
    error, 
    refetch 
  } = useProgressNotifications();

  const handleRefresh = () => {
    refetch();
    toast.success('Bildirimler yenilendi');
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Bildirimler yükleniyor...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Bell className="h-12 w-12 mx-auto text-red-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Bildirimler Yüklenemedi
            </h3>
            <p className="text-gray-600 mb-4">
              İlerleme bildirimleri yüklenirken bir hata oluştu.
            </p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tekrar Dene
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!notificationsData) {
    return null;
  }

  const { notifications, summary } = notificationsData;

  // Filter notifications based on selected criteria
  const filteredNotifications = notifications.filter(notification => {
    const priorityMatch = selectedPriority === 'all' || notification.priority === selectedPriority;
    const typeMatch = selectedType === 'all' || notification.type === selectedType;
    return priorityMatch && typeMatch;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="h-5 w-5 text-yellow-600" />;
      case 'milestone':
        return <Target className="h-5 w-5 text-blue-600" />;
      case 'reminder':
        return <Clock className="h-5 w-5 text-orange-600" />;
      case 'concern':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'Başarı';
      case 'milestone':
        return 'Kilometre Taşı';
      case 'reminder':
        return 'Hatırlatma';
      case 'concern':
        return 'Dikkat';
      default:
        return type;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Yüksek';
      case 'medium':
        return 'Orta';
      case 'low':
        return 'Düşük';
      default:
        return priority;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                İlerleme Bildirimleri
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Çocuklarınızın öğrenme sürecindeki önemli gelişmeler
              </p>
            </div>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenile
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Bell className="h-6 w-6 mx-auto text-blue-600 mb-1" />
              <div className="text-lg font-bold text-blue-900">
                {summary.totalNotifications}
              </div>
              <div className="text-xs text-blue-700">Toplam</div>
            </div>
            
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-6 w-6 mx-auto text-red-600 mb-1" />
              <div className="text-lg font-bold text-red-900">
                {summary.highPriority}
              </div>
              <div className="text-xs text-red-700">Yüksek Öncelik</div>
            </div>
            
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <Clock className="h-6 w-6 mx-auto text-yellow-600 mb-1" />
              <div className="text-lg font-bold text-yellow-900">
                {summary.mediumPriority}
              </div>
              <div className="text-xs text-yellow-700">Orta Öncelik</div>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 mx-auto text-green-600 mb-1" />
              <div className="text-lg font-bold text-green-900">
                {summary.lowPriority}
              </div>
              <div className="text-xs text-green-700">Düşük Öncelik</div>
            </div>
            
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <ExternalLink className="h-6 w-6 mx-auto text-purple-600 mb-1" />
              <div className="text-lg font-bold text-purple-900">
                {summary.actionRequired}
              </div>
              <div className="text-xs text-purple-700">Eylem Gerekli</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filtreler:</span>
            </div>
            
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Tüm Öncelikler</option>
              <option value="high">Yüksek Öncelik</option>
              <option value="medium">Orta Öncelik</option>
              <option value="low">Düşük Öncelik</option>
            </select>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Tüm Türler</option>
              <option value="achievement">Başarılar</option>
              <option value="milestone">Kilometre Taşları</option>
              <option value="reminder">Hatırlatmalar</option>
              <option value="concern">Dikkat Gereken</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Bildirimler ({filteredNotifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Bildirim Bulunamadı
              </h3>
              <p className="text-gray-600">
                Seçilen filtrelere uygun bildirim bulunmuyor.
              </p>
            </div>
          ) : (
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">
                  Tümü ({filteredNotifications.length})
                </TabsTrigger>
                <TabsTrigger value="action-required">
                  Eylem Gerekli ({filteredNotifications.filter(n => n.actionRequired).length})
                </TabsTrigger>
                <TabsTrigger value="achievements">
                  Başarılar ({filteredNotifications.filter(n => n.type === 'achievement').length})
                </TabsTrigger>
                <TabsTrigger value="concerns">
                  Dikkat ({filteredNotifications.filter(n => n.type === 'concern').length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <NotificationsList notifications={filteredNotifications} />
              </TabsContent>

              <TabsContent value="action-required" className="space-y-4">
                <NotificationsList 
                  notifications={filteredNotifications.filter(n => n.actionRequired)} 
                />
              </TabsContent>

              <TabsContent value="achievements" className="space-y-4">
                <NotificationsList 
                  notifications={filteredNotifications.filter(n => n.type === 'achievement')} 
                />
              </TabsContent>

              <TabsContent value="concerns" className="space-y-4">
                <NotificationsList 
                  notifications={filteredNotifications.filter(n => n.type === 'concern')} 
                />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface NotificationsListProps {
  notifications: any[];
}

function NotificationsList({ notifications }: NotificationsListProps) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="h-5 w-5 text-yellow-600" />;
      case 'milestone':
        return <Target className="h-5 w-5 text-blue-600" />;
      case 'reminder':
        return <Clock className="h-5 w-5 text-orange-600" />;
      case 'concern':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'Başarı';
      case 'milestone':
        return 'Kilometre Taşı';
      case 'reminder':
        return 'Hatırlatma';
      case 'concern':
        return 'Dikkat';
      default:
        return type;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Yüksek';
      case 'medium':
        return 'Orta';
      case 'low':
        return 'Düşük';
      default:
        return priority;
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8">
        <Bell className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-600">Bu kategoride bildirim bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`border rounded-lg p-4 ${
            notification.priority === 'high' ? 'border-red-200 bg-red-50' :
            notification.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
            'border-gray-200 bg-white'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              {getNotificationIcon(notification.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">
                      {notification.title}
                    </h4>
                    <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                      {getPriorityLabel(notification.priority)}
                    </Badge>
                    <Badge variant="secondary">
                      {getTypeLabel(notification.type)}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {notification.childName}
                    </div>
                    {notification.courseTitle && (
                      <div>
                        Kurs: {notification.courseTitle}
                      </div>
                    )}
                    <div>
                      {new Date(notification.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                </div>
                
                {notification.actionRequired && notification.actionUrl && (
                  <Link href={notification.actionUrl}>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      İncele
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}