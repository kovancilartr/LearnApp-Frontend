'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotificationContext } from '@/providers/notification-provider';
import { useUnreadCount } from '@/hooks/useNotifications';
import { NotificationType } from '@/types/notification.types';
import { 
  Bell, 
  Wifi, 
  WifiOff, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Send,
  TestTube
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export function NotificationTestPanel() {
  const { connectionStatus, isRealtimeConnected, isPollingActive } = useNotificationContext();
  const { data: unreadCount = 0 } = useUnreadCount();
  
  const [testNotification, setTestNotification] = useState({
    title: 'Test Kayıt Onayı',
    message: 'React Temelleri kursuna kayıt talebiniz onaylandı!',
    type: NotificationType.ENROLLMENT_APPROVED
  });

  const handleSendTestNotification = () => {
    // Gerçek uygulamada bu backend'e API çağrısı yapacak
    // Şimdilik sadece toast gösterelim
    toast.success(`${testNotification.title}\n${testNotification.message}`, {
      duration: 4000,
      icon: testNotification.type === NotificationType.ENROLLMENT_APPROVED ? '✅' : '❌'
    });
  };

  const getConnectionStatusInfo = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: <Wifi className="h-4 w-4 text-green-600" />,
          text: 'Canlı Bağlantı Aktif',
          description: 'WebSocket üzerinden anlık bildirimler alıyorsunuz',
          color: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'polling':
        return {
          icon: <Clock className="h-4 w-4 text-yellow-600" />,
          text: 'Periyodik Güncelleme',
          description: '30 saniyede bir bildirimler kontrol ediliyor',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'connecting':
        return {
          icon: <Clock className="h-4 w-4 text-blue-600 animate-pulse" />,
          text: 'Bağlanıyor...',
          description: 'WebSocket bağlantısı kuruluyor',
          color: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      default:
        return {
          icon: <WifiOff className="h-4 w-4 text-gray-600" />,
          text: 'Bağlantı Yok',
          description: 'Bildirimler manuel olarak yenilenecek',
          color: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const statusInfo = getConnectionStatusInfo();

  return (
    <div className="space-y-6">
      {/* Bağlantı Durumu */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Bildirim Sistemi Durumu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`p-3 rounded-lg border ${statusInfo.color}`}>
            <div className="flex items-center gap-2 mb-1">
              {statusInfo.icon}
              <span className="font-medium">{statusInfo.text}</span>
            </div>
            <p className="text-sm">{statusInfo.description}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-800">{unreadCount}</div>
              <div className="text-sm text-blue-600">Okunmamış</div>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-800">
                {isRealtimeConnected ? 'Aktif' : 'Pasif'}
              </div>
              <div className="text-sm text-green-600">WebSocket</div>
            </div>
            
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-lg font-bold text-yellow-800">
                {isPollingActive ? 'Aktif' : 'Pasif'}
              </div>
              <div className="text-sm text-yellow-600">Polling</div>
            </div>
            
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-800">30s</div>
              <div className="text-sm text-purple-600">Interval</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Bildirimi Gönderme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test Bildirimi Gönder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bildirim Türü</label>
            <Select
              value={testNotification.type}
              onValueChange={(value) => setTestNotification(prev => ({ 
                ...prev, 
                type: value as NotificationType 
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NotificationType.ENROLLMENT_APPROVED}>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Kayıt Onayı
                  </div>
                </SelectItem>
                <SelectItem value={NotificationType.ENROLLMENT_REJECTED}>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    Kayıt Reddi
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Başlık</label>
            <Input
              value={testNotification.title}
              onChange={(e) => setTestNotification(prev => ({ 
                ...prev, 
                title: e.target.value 
              }))}
              placeholder="Bildirim başlığı"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mesaj</label>
            <Textarea
              value={testNotification.message}
              onChange={(e) => setTestNotification(prev => ({ 
                ...prev, 
                message: e.target.value 
              }))}
              placeholder="Bildirim mesajı"
              rows={3}
            />
          </div>

          <Button 
            onClick={handleSendTestNotification}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            Test Bildirimi Gönder
          </Button>
        </CardContent>
      </Card>

      {/* Enrollment Bildirim Örnekleri */}
      <Card>
        <CardHeader>
          <CardTitle>Enrollment Bildirim Örnekleri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Kayıt Onaylandı</span>
            </div>
            <p className="text-sm text-green-700">
              "React Temelleri" kursuna kayıt talebiniz onaylandı! Artık kursa erişebilirsiniz.
            </p>
          </div>

          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-800">Kayıt Reddedildi</span>
            </div>
            <p className="text-sm text-red-700">
              "İleri Seviye JavaScript" kursuna kayıt talebiniz reddedildi. Önkoşul kursları tamamlamanız gerekiyor.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}