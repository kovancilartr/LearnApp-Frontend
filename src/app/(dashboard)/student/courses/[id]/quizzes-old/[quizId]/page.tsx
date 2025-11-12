"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RoleGuard } from "@/components/auth";
import { QuizComponent } from "@/components/course/QuizComponent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuizStore } from "@/store";
import { toast } from "react-hot-toast";
import {
  ChevronLeft,
  Home,
  ChevronRight,
  Award,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

export default function StudentQuizPage() {
  const params = useParams();


  const courseId = params.id as string;
  const quizId = params.quizId as string;

  const { selectedQuiz, setSelectedQuiz, resetQuizState } = useQuizStore();
  const [quizResult, setQuizResult] = useState<any>(null);

  // Use real quiz data from store or fetch from API
  const quiz = selectedQuiz;

  // TODO: Fetch quiz data if not available in store
  useEffect(() => {
    if (!quiz && quizId) {
      // Fetch quiz data from API
      // This should be implemented when quiz detail API is ready
      console.log("TODO: Fetch quiz data for ID:", quizId);
    }
  }, [quiz, quizId]);

  const course = {
    id: courseId,
    title: "React ve Next.js ile Modern Web Geliştirme",
  };

  useEffect(() => {
    if (!selectedQuiz) {
      setSelectedQuiz(quiz);
    }
  }, [selectedQuiz, setSelectedQuiz, quiz]);

  useEffect(() => {
    // Reset quiz state when component mounts
    return () => {
      resetQuizState();
    };
  }, [resetQuizState]);

  const handleQuizComplete = (attempt: unknown) => {
    setQuizResult(attempt);
    toast.success(`Quiz Tamamlandı! Puanınız: ${(attempt as any)?.score || 0}%`);
  };

  const handleRetakeQuiz = () => {
    setQuizResult(null);
    resetQuizState();
    toast.success("Quiz Sıfırlandı - Quiz'i tekrar alabilirsiniz.");
  };

  // Show quiz result if completed
  if (quizResult) {
    const score = quizResult.score || 0;
    const isPassed = score >= 70; // Assuming 70% is passing grade

    return (
      <RoleGuard allowedRoles={["STUDENT"]}>
        <div className="space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/student" className="hover:text-foreground">
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/student/courses" className="hover:text-foreground">
              Kurslarım
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              href={`/student/courses/${courseId}`}
              className="hover:text-foreground"
            >
              {course.title}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{quiz.title}</span>
          </div>

          {/* Quiz Result */}
          <Card>
            <CardHeader className="text-center">
              <div
                className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  isPassed ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <Award
                  className={`h-8 w-8 ${
                    isPassed ? "text-green-600" : "text-red-600"
                  }`}
                />
              </div>
              <CardTitle className="text-2xl">
                {isPassed ? "Tebrikler!" : "Quiz Tamamlandı"}
              </CardTitle>
              <p className="text-muted-foreground">
                {isPassed
                  ? "Quiz'i başarıyla tamamladınız!"
                  : "Quiz tamamlandı, ancak geçme notuna ulaşamadınız."}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score Display */}
              <div className="text-center">
                <div
                  className={`text-6xl font-bold mb-2 ${
                    isPassed ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {score}%
                </div>
                <p className="text-muted-foreground">
                  {quiz.questions?.length || 0} sorudan{" "}
                  {Math.round((score / 100) * (quiz.questions?.length || 0))}{" "}
                  doğru
                </p>
              </div>

              {/* Quiz Stats */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {quiz.questions?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Toplam Soru
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round((score / 100) * (quiz.questions?.length || 0))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Doğru Cevap
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 justify-center">
                <Button asChild variant="outline">
                  <Link href={`/student/courses/${courseId}`}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Kursa Dön
                  </Link>
                </Button>

                {!isPassed && (
                  <Button onClick={handleRetakeQuiz}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Tekrar Dene
                  </Button>
                )}

                <Button asChild>
                  <Link href="/student/progress">
                    <Award className="h-4 w-4 mr-2" />
                    İlerleme Raporu
                  </Link>
                </Button>
              </div>

              {/* Performance Message */}
              <div
                className={`p-4 rounded-lg ${
                  isPassed
                    ? "bg-green-50 border border-green-200"
                    : "bg-yellow-50 border border-yellow-200"
                }`}
              >
                <p
                  className={`text-sm ${
                    isPassed ? "text-green-800" : "text-yellow-800"
                  }`}
                >
                  {isPassed
                    ? "Harika! Quiz'i başarıyla geçtiniz. Bir sonraki konuya geçebilirsiniz."
                    : "Geçme notu %70'dir. Konuları tekrar gözden geçirip quiz'i tekrar deneyebilirsiniz."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["STUDENT"]}>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/student" className="hover:text-foreground">
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/student/courses" className="hover:text-foreground">
            Kurslarım
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            href={`/student/courses/${courseId}`}
            className="hover:text-foreground"
          >
            {course.title}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{quiz.title}</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <p className="text-muted-foreground">{course.title}</p>
          </div>
          <Button asChild variant="outline">
            <Link href={`/student/courses/${courseId}`}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Kursa Dön
            </Link>
          </Button>
        </div>

        {/* Quiz Component */}
        <QuizComponent quiz={quiz} onComplete={handleQuizComplete} />
      </div>
    </RoleGuard>
  );
}
