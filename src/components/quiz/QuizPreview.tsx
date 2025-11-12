'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface Choice {
  id: string;
  label: string;
  text: string;
  correct: boolean;
}

interface Question {
  id: string;
  text: string;
  imageUrl?: string;
  order: number;
  choices: Choice[];
}

interface Quiz {
  id: string;
  title: string;
  duration?: number;
  attemptsAllowed: number;
  questions: Question[];
}

interface QuizPreviewProps {
  quiz: Quiz;
  onClose?: () => void;
}

export function QuizPreview({ quiz, onClose }: QuizPreviewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(quiz.duration || 0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  const handleAnswerChange = (questionId: string, choiceId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: choiceId
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    setShowResults(true);
    setIsTimerRunning(false);
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
    setTimeRemaining(quiz.duration || 0);
    setIsTimerRunning(false);
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.questions.forEach(question => {
      const selectedChoiceId = answers[question.id];
      if (selectedChoiceId) {
        const selectedChoice = question.choices.find(c => c.id === selectedChoiceId);
        if (selectedChoice?.correct) {
          correct++;
        }
      }
    });
    return {
      correct,
      total: quiz.questions.length,
      percentage: Math.round((correct / quiz.questions.length) * 100)
    };
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (showResults) {
    const score = calculateScore();
    
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Eye className="mr-2 h-5 w-5" />
              Sınav Sonuçları - {quiz.title}
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleRestart}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Tekrar Dene
              </Button>
              {onClose && (
                <Button variant="outline" onClick={onClose}>
                  Kapat
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">
              {score.percentage}%
            </div>
            <p className="text-muted-foreground">
              {score.correct} / {score.total} doğru cevap
            </p>
          </div>

          <div className="space-y-4">
            {quiz.questions.map((question, index) => {
              const selectedChoiceId = answers[question.id];
              const selectedChoice = question.choices.find(c => c.id === selectedChoiceId);
              const correctChoice = question.choices.find(c => c.correct);
              const isCorrect = selectedChoice?.correct || false;

              return (
                <Card key={question.id} className={`border-l-4 ${
                  isCorrect ? 'border-l-green-500' : 'border-l-red-500'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium">
                        {index + 1}. {question.text}
                      </h4>
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    
                    {question.imageUrl && (
                      <img 
                        src={question.imageUrl} 
                        alt="Soru görseli"
                        className="max-w-sm mb-3 rounded"
                      />
                    )}

                    <div className="space-y-2">
                      {question.choices.map((choice) => (
                        <div 
                          key={choice.id}
                          className={`p-2 rounded border ${
                            choice.correct 
                              ? 'bg-green-50 border-green-200' 
                              : selectedChoiceId === choice.id && !choice.correct
                              ? 'bg-red-50 border-red-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{choice.label})</span>
                            <span>{choice.text}</span>
                            {choice.correct && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            {selectedChoiceId === choice.id && !choice.correct && (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Eye className="mr-2 h-5 w-5" />
            Sınav Önizleme - {quiz.title}
          </CardTitle>
          <div className="flex items-center space-x-4">
            {quiz.duration && (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span className="font-mono">
                  {formatTime(timeRemaining)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                >
                  {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              </div>
            )}
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Kapat
              </Button>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Soru {currentQuestionIndex + 1} / {quiz.questions.length}</span>
            <span>{Math.round(progress)}% tamamlandı</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            {currentQuestionIndex + 1}. {currentQuestion.text}
          </h3>
          
          {currentQuestion.imageUrl && (
            <div className="flex justify-center">
              <img 
                src={currentQuestion.imageUrl} 
                alt="Soru görseli"
                className="max-w-md rounded-lg shadow-sm"
              />
            </div>
          )}

          <RadioGroup
            value={answers[currentQuestion.id] || ''}
            onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
          >
            <div className="space-y-3">
              {currentQuestion.choices.map((choice) => (
                <div key={choice.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={choice.id} id={choice.id} />
                  <Label htmlFor={choice.id} className="flex-1 cursor-pointer">
                    <span className="font-medium mr-2">{choice.label})</span>
                    {choice.text}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-between items-center pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Önceki
          </Button>

          <div className="flex space-x-2">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium ${
                  index === currentQuestionIndex
                    ? 'bg-blue-500 text-white'
                    : answers[quiz.questions[index].id]
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <Button onClick={handleFinish}>
              Sınavı Bitir
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Sonraki
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}