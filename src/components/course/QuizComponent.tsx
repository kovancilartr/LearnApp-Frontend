'use client';

import { useState, useEffect } from 'react';
import { Quiz, Question, Choice, Attempt } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useQuizStore } from '@/store';
import { toast } from 'react-hot-toast';

interface QuizComponentProps {
  quiz: Quiz;
  onComplete?: (attempt: Attempt) => void;
}

export function QuizComponent({ quiz, onComplete }: QuizComponentProps) {

  const {
    currentAttempt,
    currentQuestionIndex,
    responses,
    timeRemaining,
    isQuizActive,
    isStartingAttempt,
    isFinishingAttempt,
    startQuizAttempt,
    setResponse,
    nextQuestion,
    previousQuestion,
    finishQuizAttempt,
    setTimeRemaining,
    resetQuizState
  } = useQuizStore();

  const [selectedChoice, setSelectedChoice] = useState<string>('');

  const currentQuestion = quiz.questions?.[currentQuestionIndex];
  const totalQuestions = quiz.questions?.length || 0;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  // Timer effect
  useEffect(() => {
    if (isQuizActive && timeRemaining && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (isQuizActive && timeRemaining === 0) {
      // Time's up, auto-submit
      handleFinishQuiz();
    }
  }, [isQuizActive, timeRemaining, setTimeRemaining]);

  // Load current response when question changes
  useEffect(() => {
    if (currentQuestion) {
      const currentResponse = responses[currentQuestion.id];
      setSelectedChoice(currentResponse || '');
    }
  }, [currentQuestion, responses]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStartQuiz = async () => {
    try {
      const attempt = await startQuizAttempt(quiz.id);
      if (attempt) {
        toast.success("Quiz Başlatıldı - Quiz başarıyla başlatıldı. İyi şanslar!");
      }
    } catch (error) {
      toast.error("Hata - Quiz başlatılırken bir hata oluştu.");
    }
  };

  const handleChoiceSelect = (choiceId: string) => {
    if (!currentQuestion) return;
    
    setSelectedChoice(choiceId);
    setResponse(currentQuestion.id, choiceId);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      nextQuestion();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      previousQuestion();
    }
  };

  const handleFinishQuiz = async () => {
    try {
      const finishedAttempt = await finishQuizAttempt();
      if (finishedAttempt) {
        toast.success(`Quiz Tamamlandı - Quiz başarıyla tamamlandı. Puanınız: ${finishedAttempt.score || 0}`);
        onComplete?.(finishedAttempt);
      }
    } catch (error) {
      toast.error("Hata - Quiz tamamlanırken bir hata oluştu.");
    }
  };

  const getAnsweredQuestionsCount = () => {
    return Object.keys(responses).length;
  };

  // Quiz not started yet
  if (!isQuizActive && !currentAttempt) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">{quiz.title}</CardTitle>
          <p className="text-muted-foreground">Quiz'e başlamaya hazır mısınız?</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quiz Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalQuestions}</div>
              <div className="text-sm text-blue-800">Soru</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {quiz.duration ? formatTime(quiz.duration) : '∞'}
              </div>
              <div className="text-sm text-purple-800">Süre</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{quiz.attemptsAllowed}</div>
              <div className="text-sm text-orange-800">Deneme Hakkı</div>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">📋 Quiz Talimatları</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Her soru için sadece bir seçenek işaretleyebilirsiniz</li>
              <li>• Sorular arasında ileri-geri geçiş yapabilirsiniz</li>
              {quiz.duration && <li>• Süre dolduğunda quiz otomatik olarak tamamlanır</li>}
              <li>• Quiz'i tamamladıktan sonra sonuçlarınızı görebilirsiniz</li>
            </ul>
          </div>

          {/* Start Button */}
          <div className="pt-4">
            <Button 
              onClick={handleStartQuiz}
              disabled={isStartingAttempt}
              className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {isStartingAttempt ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Quiz Başlatılıyor...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Quiz'i Başlat
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Quiz in progress
  if (isQuizActive && currentQuestion) {
    return (
      <div className="space-y-6">
        {/* Quiz Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{quiz.title}</CardTitle>
              {timeRemaining !== null && (
                <Badge variant={timeRemaining < 300 ? "destructive" : "secondary"}>
                  <Clock className="h-4 w-4 mr-1" />
                  {formatTime(timeRemaining)}
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Soru {currentQuestionIndex + 1} / {totalQuestions}</span>
                <span>{getAnsweredQuestionsCount()} / {totalQuestions} cevaplanmış</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>
        </Card>

        {/* Current Question */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                Soru {currentQuestionIndex + 1} / {totalQuestions}
              </CardTitle>
              <Badge variant="outline" className="text-sm">
                {selectedChoice ? 'Cevaplanmış' : 'Cevaplanmamış'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-lg font-medium leading-relaxed p-4 bg-gray-50 rounded-lg">
              {currentQuestion.text}
            </div>
            
            {currentQuestion.imageUrl && (
              <div className="flex justify-center">
                <img 
                  src={currentQuestion.imageUrl} 
                  alt="Soru görseli"
                  className="max-w-full max-h-96 rounded-lg shadow-md"
                />
              </div>
            )}

            <div className="space-y-3">
              {currentQuestion.choices?.map((choice: Choice, index: number) => (
                <div
                  key={choice.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedChoice === choice.id
                      ? 'border-blue-500 bg-blue-50 shadow-md transform scale-[1.02]'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                  }`}
                  onClick={() => handleChoiceSelect(choice.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedChoice === choice.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedChoice === choice.id && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-1">
                      <span className={`font-bold text-lg ${
                        selectedChoice === choice.id ? 'text-blue-700' : 'text-gray-600'
                      }`}>
                        {choice.label})
                      </span>
                      <span className={`text-base ${
                        selectedChoice === choice.id ? 'text-blue-900 font-medium' : 'text-gray-800'
                      }`}>
                        {choice.text}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card className="max-w-4xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="h-12 px-6"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Önceki Soru
              </Button>

              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  {getAnsweredQuestionsCount()} / {totalQuestions} cevaplanmış
                </div>
                
                {currentQuestionIndex === totalQuestions - 1 ? (
                  <Button
                    onClick={handleFinishQuiz}
                    disabled={isFinishingAttempt}
                    className="h-12 px-8 bg-green-600 hover:bg-green-700 text-lg font-semibold"
                  >
                    {isFinishingAttempt ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Tamamlanıyor...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Quiz'i Bitir
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === totalQuestions - 1}
                    className="h-12 px-6"
                  >
                    Sonraki Soru
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Overview */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Soru Navigasyonu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
              {Array.from({ length: totalQuestions }, (_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    // Allow jumping to questions
                    useQuizStore.getState().setCurrentQuestionIndex(index);
                  }}
                  className={`w-10 h-10 rounded-lg text-sm font-bold transition-all duration-200 ${
                    index === currentQuestionIndex
                      ? 'bg-blue-600 text-white shadow-lg transform scale-110'
                      : responses[quiz.questions[index]?.id]
                      ? 'bg-green-100 text-green-800 border-2 border-green-300 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 border-2 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded-lg" />
                <span className="font-medium">Mevcut Soru</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded-lg" />
                <span className="font-medium">Cevaplanmış</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded-lg" />
                <span className="font-medium">Cevaplanmamış</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}