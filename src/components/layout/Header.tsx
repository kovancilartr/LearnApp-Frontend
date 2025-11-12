'use client';

import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/store';
import { Button } from '@/components/ui/button';
import { UserProfileDropdown } from './UserProfileDropdown';
import { NotificationDropdown } from '@/components/notifications';
import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Header() {
  const { user } = useAuth();
  const { toggleSidebar } = useUIStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setScrolled(scrollTop > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`
      sticky top-0 z-50 
      backdrop-blur-md border-b 
      px-4 py-3 flex items-center justify-between 
      transition-all duration-300 ease-in-out
      ${scrolled 
        ? 'bg-white/70 dark:bg-gray-900/70 border-gray-200/30 dark:border-gray-700/30 shadow-lg' 
        : 'bg-white/95 dark:bg-gray-900/95 border-gray-200/50 dark:border-gray-700/50 shadow-sm'
      }
    `}>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Menu className="h-5 w-5" />
        </Button>
        {/* Logo sadece mobile'da göster */}
        <div className="flex items-center space-x-2 lg:hidden">
          <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">LearnApp</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <NotificationDropdown />

        {/* User Profile Dropdown */}
        {user && <UserProfileDropdown />}
      </div>
    </header>
  );
}