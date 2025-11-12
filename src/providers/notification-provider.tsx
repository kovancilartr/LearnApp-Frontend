'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useNotificationPolling } from '@/hooks/useNotificationPolling';
import { useAuth } from '@/hooks/useAuth';

interface NotificationContextType {
  isRealtimeConnected: boolean;
  isPollingActive: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'polling';
}

const NotificationContext = createContext<NotificationContextType>({
  isRealtimeConnected: false,
  isPollingActive: false,
  connectionStatus: 'disconnected'
});

export function useNotificationContext() {
  return useContext(NotificationContext);
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting' | 'polling'>('disconnected');
  
  // WebSocket bağlantısını dene
  const { 
    isConnected: isRealtimeConnected, 
    reconnectAttempts 
  } = useRealtimeNotifications();
  
  // WebSocket başarısız olursa polling'e geç
  const { 
    isPolling: isPollingActive 
  } = useNotificationPolling({
    enabled: user !== null && !isRealtimeConnected && reconnectAttempts >= 3, // 3 deneme sonrası polling'e geç
    interval: 30000 // 30 saniye
  });

  useEffect(() => {
    if (!user) {
      setConnectionStatus('disconnected');
    } else if (isRealtimeConnected) {
      setConnectionStatus('connected');
    } else if (isPollingActive) {
      setConnectionStatus('polling');
    } else if (reconnectAttempts > 0) {
      setConnectionStatus('connecting');
    } else {
      setConnectionStatus('disconnected');
    }
  }, [user, isRealtimeConnected, isPollingActive, reconnectAttempts]);

  const contextValue: NotificationContextType = {
    isRealtimeConnected,
    isPollingActive,
    connectionStatus
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}