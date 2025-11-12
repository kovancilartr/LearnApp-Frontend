'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks';
import { AuthGuard } from '@/components/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { registerSchema, RegisterFormData } from '@/lib/validations';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff, UserPlus, User, GraduationCap, Users, Shield } from 'lucide-react';

const roleOptions = [
  { value: 'STUDENT', label: 'Student', icon: GraduationCap, description: 'Learn from courses and take quizzes' },
  { value: 'TEACHER', label: 'Teacher', icon: User, description: 'Create and manage courses' },
  { value: 'PARENT', label: 'Parent', icon: Users, description: 'Monitor your child\'s progress' },
  { value: 'ADMIN', label: 'Admin', icon: Shield, description: 'Manage the entire platform' },
] as const;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'STUDENT',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    const { confirmPassword: _, ...registerData } = data;
    const result = await registerUser(registerData);
    
    if (result.success) {
      // Redirect will be handled by the AuthGuard and home page
      router.push('/');
    } else {
      setError('root', {
        type: 'manual',
        message: result.error || 'Registration failed',
      });
    }
  };

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Create your account
            </CardTitle>
            <p className="text-gray-600">
              Join LearnApp and start your learning journey
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {errors.root && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {errors.root.message}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  className={errors.name ? 'border-red-300 focus:border-red-500' : ''}
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className={errors.email ? 'border-red-300 focus:border-red-500' : ''}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Role
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {roleOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <label
                        key={option.value}
                        className={`relative flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedRole === option.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          value={option.value}
                          className="sr-only"
                          {...register('role')}
                        />
                        <Icon className="h-5 w-5 mb-1" />
                        <span className="text-xs font-medium">{option.label}</span>
                      </label>
                    );
                  })}
                </div>
                {selectedRole && (
                  <p className="text-xs text-gray-500 mt-1">
                    {roleOptions.find(r => r.value === selectedRole)?.description}
                  </p>
                )}
                {errors.role && (
                  <p className="text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    className={errors.password ? 'border-red-300 focus:border-red-500 pr-10' : 'pr-10'}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    className={errors.confirmPassword ? 'border-red-300 focus:border-red-500 pr-10' : 'pr-10'}
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}