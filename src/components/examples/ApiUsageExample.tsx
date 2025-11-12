'use client';

import { useEffect } from 'react';
import { useCourseStore, useAuthStore, useQuizStore } from '@/store';
import { useErrorHandler, useGlobalLoadingState } from '@/hooks';

// Bu component, yeni API ve state management sisteminin nasıl kullanılacağını gösterir
export function ApiUsageExample() {
  const { handleError, handleSuccess } = useErrorHandler();
  const isGlobalLoading = useGlobalLoadingState();
  
  // Auth store
  const { 
    user, 
    isAuthenticated, 
    login, 
    logout, 
    isLoggingIn,
    error: authError 
  } = useAuthStore();
  
  // Course store
  const {
    courses,
    enrolledCourses,
    isLoadingCourses,
    fetchCourses,
    fetchEnrolledCourses,
    enrollInCourse,
    isEnrolling,
    error: courseError
  } = useCourseStore();
  
  // Quiz store
  const {
    availableQuizzes,
    fetchAvailableQuizzes,
    startQuizAttempt,
    isStartingAttempt,
    error: quizError
  } = useQuizStore();

  // Component mount'ta veri yükleme
  useEffect(() => {
    if (isAuthenticated) {
      fetchCourses();
      fetchEnrolledCourses();
      fetchAvailableQuizzes();
    }
  }, [isAuthenticated, fetchCourses, fetchEnrolledCourses, fetchAvailableQuizzes]);

  // Error handling
  useEffect(() => {
    if (authError) {
      handleError(authError);
    }
  }, [authError, handleError]);

  useEffect(() => {
    if (courseError) {
      handleError(courseError);
    }
  }, [courseError, handleError]);

  useEffect(() => {
    if (quizError) {
      handleError(quizError);
    }
  }, [quizError, handleError]);

  // Login handler
  const handleLogin = async () => {
    const success = await login({
      email: 'test@example.com',
      password: 'password123'
    });
    
    if (success) {
      handleSuccess('Başarıyla giriş yapıldı!');
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await logout();
    handleSuccess('Başarıyla çıkış yapıldı!');
  };

  // Course enrollment handler
  const handleEnrollment = async (courseId: string) => {
    const enrollment = await enrollInCourse(courseId);
    if (enrollment) {
      handleSuccess('Kursa başarıyla kayıt oldunuz!');
    }
  };

  // Quiz start handler
  const handleStartQuiz = async (quizId: string) => {
    const attempt = await startQuizAttempt(quizId);
    if (attempt) {
      handleSuccess('Quiz başlatıldı!');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Giriş Yapın</h2>
        <button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isLoggingIn ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Global loading indicator */}
      {isGlobalLoading && (
        <div className="bg-blue-100 p-2 rounded">
          Global yükleme aktif...
        </div>
      )}

      {/* User info */}
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-xl font-bold mb-2">Kullanıcı Bilgileri</h2>
        <p>Merhaba, {user?.name}!</p>
        <p>Email: {user?.email}</p>
        <p>Rol: {user?.role}</p>
        <button
          onClick={handleLogout}
          className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
        >
          Çıkış Yap
        </button>
      </div>

      {/* Courses */}
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-xl font-bold mb-2">Kurslar</h2>
        {isLoadingCourses ? (
          <p>Kurslar yükleniyor...</p>
        ) : (
          <div className="space-y-2">
            <h3 className="font-semibold">Tüm Kurslar ({courses.length})</h3>
            {courses.slice(0, 3).map(course => (
              <div key={course.id} className="flex justify-between items-center bg-white p-2 rounded">
                <span>{course.title}</span>
                <button
                  onClick={() => handleEnrollment(course.id)}
                  disabled={isEnrolling}
                  className="bg-green-500 text-white px-2 py-1 rounded text-sm disabled:opacity-50"
                >
                  {isEnrolling ? 'Kaydediliyor...' : 'Kayıt Ol'}
                </button>
              </div>
            ))}
            
            <h3 className="font-semibold mt-4">Kayıtlı Kurslarım ({enrolledCourses.length})</h3>
            {enrolledCourses.slice(0, 3).map(course => (
              <div key={course.id} className="bg-white p-2 rounded">
                <span>{course.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quizzes */}
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-xl font-bold mb-2">Quizler</h2>
        <div className="space-y-2">
          {availableQuizzes.slice(0, 3).map(quiz => (
            <div key={quiz.id} className="flex justify-between items-center bg-white p-2 rounded">
              <span>{quiz.title}</span>
              <button
                onClick={() => handleStartQuiz(quiz.id)}
                disabled={isStartingAttempt}
                className="bg-purple-500 text-white px-2 py-1 rounded text-sm disabled:opacity-50"
              >
                {isStartingAttempt ? 'Başlatılıyor...' : 'Quiz Başlat'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Loading states */}
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-xl font-bold mb-2">Yükleme Durumları</h2>
        <div className="space-y-1 text-sm">
          <p>Kurslar yükleniyor: {isLoadingCourses ? 'Evet' : 'Hayır'}</p>
          <p>Giriş yapılıyor: {isLoggingIn ? 'Evet' : 'Hayır'}</p>
          <p>Kayıt olunuyor: {isEnrolling ? 'Evet' : 'Hayır'}</p>
          <p>Quiz başlatılıyor: {isStartingAttempt ? 'Evet' : 'Hayır'}</p>
        </div>
      </div>
    </div>
  );
}