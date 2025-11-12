import { NotificationTestPanel } from '@/components/notifications/NotificationTestPanel';

export default function NotificationTestPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bildirim Sistemi Test Paneli</h1>
        <p className="text-gray-600">
          Bildirim sisteminin durumunu kontrol edin ve test bildirimleri gönderin.
        </p>
      </div>
      
      <NotificationTestPanel />
    </div>
  );
}