'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { AuthGuard } from '@/components/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginSchema, LoginFormData } from '@/lib/validations';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  LogIn, 
  BookOpen, 
  Users, 
  GraduationCap, 
  Award,
  ArrowRight,
  CheckCircle,
  Loader2
} from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoggingIn } = useAuth();

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    const result = await login(data);
    
    if (result.success) {
      toast.success('Başarıyla giriş yaptınız! Yönlendiriliyorsunuz...');
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } else {
      toast.error(result.error || 'Giriş yapılırken hata oluştu');
      setError('root', {
        type: 'manual',
        message: result.error || 'Giriş yapılırken hata oluştu',
      });
    }
  };

  const features = [
    {
      icon: BookOpen,
      title: 'İnteraktif Kurslar',
      description: 'Video dersler, quizler ve ödevlerle zenginleştirilmiş eğitim içerikleri'
    },
    {
      icon: Users,
      title: 'Uzman Eğitmenler',
      description: 'Alanında uzman eğitmenlerden kaliteli eğitim alın'
    },
    {
      icon: GraduationCap,
      title: 'Sertifika Programları',
      description: 'Tamamladığınız kurslar için geçerli sertifikalar kazanın'
    },
    {
      icon: Award,
      title: 'İlerleme Takibi',
      description: 'Öğrenme sürecinizi detaylı raporlarla takip edin'
    }
  ];

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen flex">
        {/* Left Side - Visual/Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-40 right-20 w-24 h-24 bg-purple-300/20 rounded-full blur-lg animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-blue-300/20 rounded-full blur-md animate-pulse delay-500" />
          
          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
            {/* Logo */}
            <div className="flex items-center space-x-3 mb-12">
              <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">LearnApp</h1>
                <p className="text-blue-100 text-sm">Eğitimde Yeni Nesil Platform</p>
              </div>
            </div>

            {/* Main Message */}
            <div className="mb-12">
              <h2 className="text-4xl font-bold mb-4 leading-tight">
                Öğrenmenin
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                  Geleceği Burada
                </span>
              </h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                Uzaktan eğitimde yeni standartları belirleyen platformumuzla 
                öğrenme deneyiminizi bir üst seviyeye taşıyın.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-start space-x-4 group hover:bg-white/10 p-4 rounded-lg transition-all duration-300"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                    <p className="text-blue-100 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">1000+</div>
                <div className="text-blue-200 text-sm">Aktif Öğrenci</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">50+</div>
                <div className="text-blue-200 text-sm">Uzman Eğitmen</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">200+</div>
                <div className="text-blue-200 text-sm">Kurs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center">
              <div className="inline-flex items-center space-x-2 mb-6">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">L</span>
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">LearnApp</span>
              </div>
            </div>

            {/* Form Header */}
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Tekrar Hoş Geldiniz
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Hesabınıza giriş yaparak eğitime devam edin
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {errors.root && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0" />
                  <span>{errors.root.message}</span>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  E-posta Adresi
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  className={`h-12 ${errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-300 dark:border-gray-600'} transition-colors`}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                    <span>⚠️</span>
                    <span>{errors.email.message}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Şifre
                  </Label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    Şifremi Unuttum
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Şifrenizi girin"
                    className={`h-12 pr-12 ${errors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-300 dark:border-gray-600'} transition-colors`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                    <span>⚠️</span>
                    <span>{errors.password.message}</span>
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Giriş yapılıyor...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-2" />
                    Giriş Yap
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  veya
                </span>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Henüz hesabınız yok mu?{' '}
                <Link 
                  href="/register" 
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors inline-flex items-center"
                >
                  Hesap Oluştur
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </p>
            </div>

            {/* Demo Accounts */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Demo Hesapları
              </h4>
              <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <div>👨‍🏫 Admin: admin@egitimplatformu.com / sifre123</div>
                <div>👨‍🏫 Öğretmen: ahmet.ogretmen@egitimplatformu.com / sifre123</div>
                <div>👨‍🎓 Öğrenci: elif.ogrenci@egitimplatformu.com / sifre123</div>
                <div>👨‍👩‍👧‍👦 Veli: veli@egitimplatformu.com / sifre123</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}