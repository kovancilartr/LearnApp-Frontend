"use client";

import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Home,
  BookOpen,
  Users,
  GraduationCap,
  Settings,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  FileText,
  Award,
  Heart,
  Shield,
  Clock,
} from "lucide-react";

const navigation = {
  ADMIN: [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Kullanıcılar", href: "/admin/users", icon: Users },
    { name: "Kurslar", href: "/admin/courses", icon: BookOpen },
    {
      name: "Kayıt Talepleri",
      href: "/admin/enrollment-requests",
      icon: Clock,
    },
    { name: "Analitik", href: "/admin/analytics", icon: BarChart3 },
    { name: "Ayarlar", href: "/admin/settings", icon: Settings },
  ],
  TEACHER: [
    { name: "Dashboard", href: "/teacher", icon: Home },
    { name: "Kurslarım", href: "/teacher/courses", icon: BookOpen },
    { name: "Öğrencilerim", href: "/teacher/students", icon: GraduationCap },
    { name: "Quiz'ler", href: "/teacher/quizzes", icon: FileText },
    { name: "Analitik", href: "/teacher/analytics", icon: BarChart3 },
  ],
  STUDENT: [
    { name: "Dashboard", href: "/student", icon: Home },
    { name: "Kurslarım", href: "/student/courses", icon: BookOpen },
    { name: "Başvurularım", href: "/student/enrollment-requests", icon: Clock }, // KALDIRILACAK
    { name: "Kurs Ara", href: "/courses", icon: PlusCircle },
    { name: "İlerleme", href: "/student/progress", icon: Award },
  ],
  PARENT: [
    { name: "Dashboard", href: "/parent", icon: Home },
    { name: "Çocuklarım", href: "/parent/children", icon: Heart },
    { name: "İlerleme", href: "/parent/progress", icon: BarChart3 },
  ],
};

interface SidebarItemProps {
  item: {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  };
  isActive: boolean;
  isCollapsed: boolean;
}

function SidebarItem({ item, isActive, isCollapsed }: SidebarItemProps) {
  const content = (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
        "hover:scale-105 hover:shadow-lg",
        isActive
          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
          : "text-gray-300 hover:bg-white/10 hover:text-white",
        isCollapsed ? "justify-center px-2" : ""
      )}
    >
      <item.icon
        className={cn(
          "flex-shrink-0 transition-transform duration-200",
          isActive ? "scale-110" : "group-hover:scale-110",
          isCollapsed ? "h-6 w-6" : "h-5 w-5"
        )}
      />
      {!isCollapsed && (
        <span className="truncate transition-opacity duration-200">
          {item.name}
        </span>
      )}
      {isActive && !isCollapsed && (
        <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse" />
      )}
    </Link>
  );

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="ml-2">
            <p>{item.name}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

export function Sidebar() {
  const { user } = useAuth();
  const { sidebarCollapsed, toggleSidebarCollapse } = useUIStore();
  const pathname = usePathname();

  if (!user) return null;

  const userNavigation = navigation[user.role as keyof typeof navigation] || [];

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return Shield;
      case "teacher":
        return GraduationCap;
      case "student":
        return BookOpen;
      case "parent":
        return Heart;
      default:
        return Users;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "Yönetici";
      case "teacher":
        return "Öğretmen";
      case "student":
        return "Öğrenci";
      case "parent":
        return "Veli";
      default:
        return role;
    }
  };

  const RoleIcon = getRoleIcon(user.role);

  return (
    <aside
      className={cn(
        "bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white h-full transition-all duration-300 ease-in-out backdrop-blur-sm",
        "flex flex-col"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between p-4 border-b border-gray-700/50 flex-shrink-0",
          sidebarCollapsed ? "px-2" : "px-4"
        )}
      >
        {!sidebarCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <div>
              <h2 className="text-lg font-bold">LearnApp</h2>
              <p className="text-xs text-gray-400">Eğitim Platformu</p>
            </div>
          </div>
        )}

        {/* Collapse Toggle - Hidden on mobile */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebarCollapse}
          className={cn(
            "hidden lg:flex text-gray-400 hover:text-white hover:bg-white/10 transition-colors",
            sidebarCollapsed ? "w-full justify-center" : ""
          )}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* User Info */}
      <div
        className={cn(
          "p-4 border-b border-gray-700/50 flex-shrink-0",
          sidebarCollapsed ? "px-2" : "px-4"
        )}
      >
        {sidebarCollapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <RoleIcon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="ml-2">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-gray-400">
                    {getRoleLabel(user.role)}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <RoleIcon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-400">{getRoleLabel(user.role)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav
        className={cn(
          "flex-1 p-4 space-y-2 overflow-y-auto",
          sidebarCollapsed ? "px-2" : "px-4"
        )}
      >
        {userNavigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <SidebarItem
              key={item.name}
              item={item}
              isActive={isActive}
              isCollapsed={sidebarCollapsed}
            />
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className={cn(
          "p-4 border-t border-gray-700/50 flex-shrink-0",
          sidebarCollapsed ? "px-2" : "px-4"
        )}
      >
        {sidebarCollapsed ? (
          <TooltipProvider>
            <Link href="/settings">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center text-gray-400 hover:text-white hover:bg-white/10"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                  <p>Ayarlar</p>
                </TooltipContent>
              </Tooltip>
            </Link>
          </TooltipProvider>
        ) : (
          <Link href="/settings">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10"
            >
              <Settings className="h-4 w-4 mr-2" />
              Ayarlar
            </Button>
          </Link>
        )}
      </div>
    </aside>
  );
}
