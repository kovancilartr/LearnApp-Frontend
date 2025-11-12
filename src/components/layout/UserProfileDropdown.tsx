"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  Shield,
  BookOpen,
  Users,
  GraduationCap,
  Heart,
} from "lucide-react";

export function UserProfileDropdown() {
  const { user, logout, isLoggingOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "teacher":
        return <GraduationCap className="h-4 w-4" />;
      case "student":
        return <BookOpen className="h-4 w-4" />;
      case "parent":
        return <Heart className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "teacher":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "student":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "parent":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const handleLogout = async () => {
    setIsOpen(false);

    // Show loading toast
    toast.loading(
      "Çıkış yapılıyor... Lütfen bekleyin, oturumunuz sonlandırılıyor."
    );

    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);

      // Show error toast
      toast.error(
        "Çıkış yapılırken hata oluştu - Yine de oturumunuz sonlandırılacak."
      );

      // Force redirect even if logout fails
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center space-x-2 mr-2"
        >
          <span className="hidden md:block">{user.name}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64" align="end" forceMount>
        {/* User Info Section */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-3">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getRoleIcon(user.role)}
              <Badge
                variant="secondary"
                className={`text-xs ${getRoleColor(user.role)}`}
              >
                {user.role === "ADMIN"
                  ? "Yönetici"
                  : user.role === "TEACHER"
                  ? "Öğretmen"
                  : user.role === "STUDENT"
                  ? "Öğrenci"
                  : user.role === "PARENT"
                  ? "Veli"
                  : user.role}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Profile & Settings */}
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profil</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Ayarlar</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Role-specific menu items */}
        {user.role === "TEACHER" && (
          <>
            <DropdownMenuItem className="cursor-pointer">
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Kurslarım</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Users className="mr-2 h-4 w-4" />
              <span>Öğrencilerim</span>
            </DropdownMenuItem>
          </>
        )}

        {user.role === "STUDENT" && (
          <>
            <DropdownMenuItem className="cursor-pointer">
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Kurslarım</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <GraduationCap className="mr-2 h-4 w-4" />
              <span>İlerleme</span>
            </DropdownMenuItem>
          </>
        )}

        {user.role === "PARENT" && (
          <DropdownMenuItem className="cursor-pointer">
            <Heart className="mr-2 h-4 w-4" />
            <span>Çocuklarım</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Theme Toggle */}
        <DropdownMenuItem className="cursor-pointer" onClick={toggleTheme}>
          {theme === "light" ? (
            <>
              <Moon className="mr-2 h-4 w-4" />
              <span>Koyu Tema</span>
            </>
          ) : (
            <>
              <Sun className="mr-2 h-4 w-4" />
              <span>Açık Tema</span>
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? "Çıkış yapılıyor..." : "Çıkış Yap"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
