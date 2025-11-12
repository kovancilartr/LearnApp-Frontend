'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Wifi, WifiOff } from 'lucide-react';
import { NotificationList } from './NotificationList';
import { useUnreadCount } from '@/hooks/useNotifications';
import { useNotificationContext } from '@/providers/notification-provider';

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadCount();
  const { connectionStatus, isRealtimeConnected } = useNotificationContext();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative hover:bg-gray-100 dark:hover:bg-gray-800 h-10 w-10 p-0"
          title={`Bildirimler - ${connectionStatus === 'connected' ? 'Canlı bağlantı' : connectionStatus === 'polling' ? 'Periyodik güncelleme' : 'Bağlantı yok'}`}
        >
          <Bell className="h-5 w-5" />
          
          {/* Unread count badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium min-w-[20px]">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          
          {/* Connection status indicator */}
          <span className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
            connectionStatus === 'connected' ? 'bg-green-500' :
            connectionStatus === 'polling' ? 'bg-yellow-500' :
            connectionStatus === 'connecting' ? 'bg-blue-500 animate-pulse' :
            'bg-gray-400'
          }`} />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 p-0 max-h-[500px] overflow-hidden"
        sideOffset={8}
      >
        <NotificationList />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}