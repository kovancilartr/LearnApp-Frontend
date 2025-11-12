'use client';

import { useUIStore } from '@/store';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';

interface NavigationProps {
  children: React.ReactNode;
}

export function Navigation({ children }: NavigationProps) {
  const { sidebarCollapsed, sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <div className="layout-container bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Main Layout Container - Ters L şekli için */}
      <div className="layout-main">
        {/* Desktop Sidebar - Tam yükseklik */}
        <div 
          className={cn(
            'layout-sidebar border-r border-gray-200 dark:border-gray-700',
            sidebarCollapsed ? 'w-16' : 'w-64'
          )}
        >
          <Sidebar />
        </div>

        {/* Right Side Container - Header + Content */}
        <div className="layout-right-container">
          {/* Header - Sidebar'dan sonra başlar */}
          <div className="layout-header border-b border-gray-200 dark:border-gray-700">
            <Header />
          </div>

          {/* Main Content Area */}
          <main className="layout-content">
            <div className="p-6">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </div>
          </main>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="mobile-sidebar-overlay lg:hidden">
            {/* Backdrop */}
            <div 
              className="mobile-sidebar-backdrop"
              onClick={toggleSidebar}
            />
            {/* Mobile Sidebar */}
            <div className={cn(
              'mobile-sidebar-panel',
              sidebarOpen && 'open'
            )}>
              <Sidebar />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}