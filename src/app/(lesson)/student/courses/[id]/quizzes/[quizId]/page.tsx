"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RoleGuard } from "@/components/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store";
import { courseService } from "@/lib/services";
import { Course, Quiz, Question } from "@/types";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle,
  X,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const courseId = params.id as string;
  const quizId = params.quizId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch course details
        const courseData = await courseService.getCourse(courseId);
        setCourse(courseData);

        // Find the specific quiz
        const foundQuiz = courseData.quizzes?.find(q => q.id === quizId);
        
        if (!foundQuiz) {
          toast.error("Quiz bulunamadı.");
          router.push(`/student/courses/${courseId}`);
          return;
        }

        setQuiz(foundQuiz);
        
        // Set timer if quiz has duration
        if (foundQuiz.duration) {
          setTimeLeft(foundQuiz.duration);
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
        toast.error("Quiz yüklenirken bir hata oluştu.");
        router.push(`/student/courses/${courseId}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [courseId, quizId, router]);

  // Timer effect
  useEffect(() => {
    if (!quizStarted || timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, timeLeft]);

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitQuiz = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Here you would submit the quiz answers to your API
      // const result = await quizService.submitQuiz(quizId, answers);
      
      toast.success("Quiz başarıyla gönderildi!");
      router.push(`/student/courses/${courseId}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error("Quiz gönderilirken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const currentQuestion = quiz?.questions?.[currentQuestionIndex];
  const totalQuestions = quiz?.questions?.length || 0;
  const answeredQuestions = Object.keys(answers).length;
  const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  if (isLoading) {
    return (
      <RoleGuard allowedRoles={["STUDENT"]}>
        <div className="flex items-center justify-center h-screen bg-black text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <div className="text-lg">Quiz yükleniyor...</div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  if (!quiz || !course) {
    return (
      <RoleGuard allowedRoles={["STUDENT"]}>
        <div className="flex items-center justify-center h-screen bg-black text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Quiz Bulunamadı</h2>
            <Button asChild variant="outline">
              <Link href={`/student/courses/${courseId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kursa Dön
              </Link>
            </Button>
          </div>
        </div>
      </RoleGuard>
    );
  }

  if (!quizStarted) {
    return (
      <RoleGuard allowedRoles={["STUDENT"]}>
        <div className="h-screen flex items-center justify-center bg-black text-white">
          <Card className="w-full max-w-2xl bg-gray-900 border-gray-700 text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{quiz.title}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/student/courses/${courseId}`)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>{totalQuestions} soru</span>
                  </div>
                  {quiz.duration && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{Math.floor(quiz.duration / 60)} dakika</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>{quiz.attemptsAllowed} deneme hakkı</span>
                  </div>
                </div>

                <div className="p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
                  <h3 className="font-semibold text-yellow-400 mb-2">Önemli Bilgiler:</h3>
                  <ul className="text-sm text-yellow-200 space-y-1">
                    <li>• Quiz başladıktan sonra sayfayı yenilemeyiniz</li>
                    <li>• Tüm soruları cevaplayıp "Gönder" butonuna basınız</li>
                    {quiz.duration && <li>• Süre dolduğunda quiz otomatik olarak gönderilir</li>}
                    <li>• Her soru için sadece bir cevap seçebilirsiniz</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-center">
                <Button onClick={handleStartQuiz} size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Quiz'i Başlat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["STUDENT"]}>
      <div className="h-screen flex flex-col bg-black text-white">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">{quiz.title}</h1>
            <Badge variant="outline" className="text-gray-300">
              {currentQuestionIndex + 1} / {totalQuestions}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            {timeLeft !== null && (
              <div className={`flex items-center gap-2 px-3 py-1 rounded ${
                timeLeft < 300 ? 'bg-red-900 text-red-200' : 'bg-gray-800 text-gray-300'
              }`}>
                <Clock className="h-4 w-4" />
                <span className="font-mono">{formatTime(timeLeft)}</span>
              </div>
            )}
            
            <div className="text-sm text-gray-400">
              İlerleme: %{Math.round(progressPercentage)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-4 py-2 bg-gray-900">
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Question Area */}
        <div className="flex-1 flex items-center justify-center p-8">
          {currentQuestion && (
            <Card className="w-full max-w-4xl bg-gray-900 border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="text-xl">
                  Soru {currentQuestionIndex + 1}: {currentQuestion.text}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentQuestion.choices?.map((choice, index) => (
                    <label
                      key={index}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        answers[currentQuestion.id] === choice.id
                          ? 'border-blue-500 bg-blue-900/20'
                          : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={choice.id}
                        checked={answers[currentQuestion.id] === choice.id}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                        className="mr-3"
                      />
                      <span>{choice.label}. {choice.text}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="p-4 bg-gray-900 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Önceki
            </Button>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                {answeredQuestions} / {totalQuestions} cevaplandı
              </span>
              
              {currentQuestionIndex === totalQuestions - 1 ? (
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting || answeredQuestions < totalQuestions}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? 'Gönderiliyor...' : 'Quiz\'i Gönder'}
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuestionIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
                  disabled={currentQuestionIndex === totalQuestions - 1}
                >
                  Sonraki
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}