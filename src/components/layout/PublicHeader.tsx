"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store";
import { Menu, X, BookOpen, User, LogOut, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserProfileDropdown } from "./UserProfileDropdown";

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LearnApp
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/courses"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Kurslar
            </Link>
            <Link
              href="/about"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Hakkımızda
            </Link>
            <Link
              href="/contact"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              İletişim
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Button asChild variant="outline" className="hidden md:flex">
                  <Link href={`/${user.role.toLowerCase()}`}>Dashboard</Link>
                </Button>

                <UserProfileDropdown />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost">
                  <Link href="/login">Giriş Yap</Link>
                </Button>
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Link href="/register">Kayıt Ol</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200/50">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/courses"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Kurslar
              </Link>
              <Link
                href="/about"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Hakkımızda
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                İletişim
              </Link>

              {user && (
                <Link
                  href={`/dashboard/${user.role.toLowerCase()}`}
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
