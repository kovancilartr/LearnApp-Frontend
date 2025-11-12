'use client';

import { useAuth } from '@/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, GraduationCap, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { isAuthenticated, user, isInitialized, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !isLoading && isAuthenticated && user) {
      // Redirect to appropriate dashboard based on role
      router.push(`/${user.role.toLowerCase()}`);
    }
  }, [isAuthenticated, user, router, isInitialized, isLoading]);

  if (!isInitialized || isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to LearnApp
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A comprehensive remote education platform that connects teachers, students, and parents 
            in a seamless learning experience.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg" className="px-8">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader className="text-center">
              <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Course Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Create and manage comprehensive courses with videos, quizzes, and assignments.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <GraduationCap className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Interactive Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Engage students with interactive lessons, quizzes, and real-time progress tracking.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Multi-Role Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Support for admins, teachers, students, and parents with role-based access.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <BarChart3 className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Progress Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Comprehensive analytics and reporting for tracking learning progress.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of students and teachers already using LearnApp.
          </p>
          <Link href="/register">
            <Button size="lg" className="px-12">
              Create Your Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}