'use client';

import { useState } from 'react';
import { NotificationDropdown } from './NotificationDropdown';
import { NotificationList } from './NotificationList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Test component now uses real API data from NotificationDropdown and NotificationList components

export function NotificationTest() {
  const [showList, setShowList] = useState(false);

  return (
    <div className="p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bildirim Bileşenleri Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Bildirim Dropdown:</span>
              <NotificationDropdown />
            </div>
            
            <Button 
              onClick={() => setShowList(!showList)}
              variant="outline"
            >
              {showList ? 'Listeyi Gizle' : 'Listeyi Göster'}
            </Button>
          </div>

          {showList && (
            <Card>
              <CardContent className="p-0">
                <NotificationList />
              </CardContent>
            </Card>
          )}

          <div className="text-sm text-gray-600">
            <p><strong>Not:</strong> Bu bileşenler gerçek API verilerini kullanır. Bildirimler backend'den çekilir.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}