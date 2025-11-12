'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { RoleGuard } from '@/components/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { quizService } from '@/lib/services';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Clock, 
  HelpCircle,
  Image as ImageIcon
} from 'lucide-react';

interface Question {
  id: string;
  text: string;
  imageUrl?: string;
  choices: Choice[];
}

interface Choice {
  id: string;
  label: string;
  text: string;
  correct: boolean;
}

export default function NewQuizPage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.id as string;
  
  const [formData, setFormData] = useState({
    title: '',
    duration: 0,
    attemptsAllowed: 1,
    hasTimeLimit: false
  });
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      text: '',
      choices: [
        { id: `c_${Date.now()}_1`, label: 'A', text: '', correct: false },
        { id: `c_${Date.now()}_2`, label: 'B', text: '', correct: false },
        { id: `c_${Date.now()}_3`, label: 'C', text: '', correct: false },
        { id: `c_${Date.now()}_4`, label: 'D', text: '', correct: false }
      ]
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const updateQuestion = (questionId: string, field: string, value: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ));
  };

  const updateChoice = (questionId: string, choiceId: string, field: string, value: string | boolean) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? {
            ...q,
            choices: q.choices.map(c => 
              c.id === choiceId ? { ...c, [field]: value } : c
            )
          }
        : q
    ));
  };

  const setCorrectAnswer = (questionId: string, choiceId: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? {
            ...q,
            choices: q.choices.map(c => ({ ...c, correct: c.id === choiceId }))
          }
        : q
    ));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Sınav başlığı gereklidir';
    }
    
    if (formData.hasTimeLimit && formData.duration <= 0) {
      newErrors.duration = 'Süre 0\'dan büyük olmalıdır';
    }
    
    if (formData.attemptsAllowed <= 0) {
      newErrors.attemptsAllowed = 'Deneme hakkı 0\'dan büyük olmalıdır';
    }

    if (questions.length === 0) {
      newErrors.questions = 'En az bir soru eklemelisiniz';
    }

    // Validate questions
    questions.forEach((question, index) => {
      if (!question.text.trim()) {
        newErrors[`question_${index}`] = `${index + 1}. soru metni gereklidir`;
      }
      
      const hasCorrectAnswer = question.choices.some(c => c.correct);
      if (!hasCorrectAnswer) {
        newErrors[`question_${index}_correct`] = `${index + 1}. soru için doğru cevap seçmelisiniz`;
      }

      const emptyChoices = question.choices.filter(c => !c.text.trim());
      if (emptyChoices.length > 0) {
        newErrors[`question_${index}_choices`] = `${index + 1}. soruda boş seçenekler var`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const quizData = {
        title: formData.title.trim(),
        courseId,
        duration: formData.hasTimeLimit ? formData.duration * 60 : undefined, // Convert to seconds
        attemptsAllowed: formData.attemptsAllowed,
        questions: questions.map((q, index) => ({
          text: q.text.trim(),
          imageUrl: q.imageUrl?.trim() || undefined,
          order: index,
          choices: q.choices.map(c => ({
            label: c.label,
            text: c.text.trim(),
            correct: c.correct
          }))
        }))
      };

      await quizService.createQuiz(quizData);

      toast.success('Başarılı - Sınav başarıyla oluşturuldu');
      
      router.push(`/teacher/courses/${courseId}`);
    } catch (error: any) {
      toast.error(`Hata - ${error.response?.data?.error?.message || 'Sınav oluşturulurken bir hata oluştu'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['TEACHER']}>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href={`/teacher/courses/${courseId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kursa Dön
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Yeni Sınav Oluştur</h2>
            <p className="text-muted-foreground">
              Öğrencileriniz için yeni bir sınav oluşturun
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Temel Bilgiler</TabsTrigger>
              <TabsTrigger value="questions">
                Sorular {questions.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {questions.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Sınav Ayarları</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Sınav Başlığı <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Örn: React Temel Kavramlar Sınavı"
                      className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          Süre Sınırı
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Sınav için zaman sınırı belirleyin
                        </p>
                      </div>
                      <Switch
                        checked={formData.hasTimeLimit}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, hasTimeLimit: checked }))
                        }
                      />
                    </div>

                    {formData.hasTimeLimit && (
                      <div className="space-y-2">
                        <Label htmlFor="duration">Süre (dakika)</Label>
                        <Input
                          id="duration"
                          type="number"
                          min="1"
                          value={formData.duration}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            duration: parseInt(e.target.value) || 0 
                          }))}
                          placeholder="60"
                          className={errors.duration ? 'border-red-500' : ''}
                        />
                        {errors.duration && (
                          <p className="text-sm text-red-500">{errors.duration}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="attemptsAllowed">Deneme Hakkı</Label>
                    <Input
                      id="attemptsAllowed"
                      type="number"
                      min="1"
                      value={formData.attemptsAllowed}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        attemptsAllowed: parseInt(e.target.value) || 1 
                      }))}
                      className={errors.attemptsAllowed ? 'border-red-500' : ''}
                    />
                    {errors.attemptsAllowed && (
                      <p className="text-sm text-red-500">{errors.attemptsAllowed}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Öğrencilerin kaç kez sınava girebileceğini belirler
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="questions" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Sınav Soruları</h3>
                  <p className="text-sm text-muted-foreground">
                    Sınavınız için sorular ekleyin
                  </p>
                </div>
                <Button type="button" onClick={addQuestion}>
                  <Plus className="mr-2 h-4 w-4" />
                  Soru Ekle
                </Button>
              </div>

              {errors.questions && (
                <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600">{errors.questions}</p>
                </div>
              )}

              {questions.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Henüz soru eklenmemiş</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Sınavınız için sorular ekleyerek başlayın
                    </p>
                    <Button type="button" onClick={addQuestion}>
                      <Plus className="mr-2 h-4 w-4" />
                      İlk Soruyu Ekle
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {questions.map((question, questionIndex) => (
                    <Card key={question.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            Soru {questionIndex + 1}
                          </CardTitle>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeQuestion(question.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>
                            Soru Metni <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            value={question.text}
                            onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                            placeholder="Sorunuzu buraya yazın..."
                            rows={3}
                            className={errors[`question_${questionIndex}`] ? 'border-red-500' : ''}
                          />
                          {errors[`question_${questionIndex}`] && (
                            <p className="text-sm text-red-500">{errors[`question_${questionIndex}`]}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="flex items-center">
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Görsel URL (Opsiyonel)
                          </Label>
                          <Input
                            value={question.imageUrl || ''}
                            onChange={(e) => updateQuestion(question.id, 'imageUrl', e.target.value)}
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label>
                            Seçenekler <span className="text-red-500">*</span>
                          </Label>
                          {errors[`question_${questionIndex}_correct`] && (
                            <p className="text-sm text-red-500">{errors[`question_${questionIndex}_correct`]}</p>
                          )}
                          {errors[`question_${questionIndex}_choices`] && (
                            <p className="text-sm text-red-500">{errors[`question_${questionIndex}_choices`]}</p>
                          )}
                          
                          <div className="space-y-2">
                            {question.choices.map((choice) => (
                              <div key={choice.id} className="flex items-center space-x-3">
                                <Button
                                  type="button"
                                  variant={choice.correct ? "default" : "outline"}
                                  size="sm"
                                  className="w-8 h-8 p-0"
                                  onClick={() => setCorrectAnswer(question.id, choice.id)}
                                >
                                  {choice.label}
                                </Button>
                                <Input
                                  value={choice.text}
                                  onChange={(e) => updateChoice(question.id, choice.id, 'text', e.target.value)}
                                  placeholder={`${choice.label} seçeneği...`}
                                  className="flex-1"
                                />
                              </div>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Doğru cevabı seçmek için harf butonlarına tıklayın
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Link href={`/teacher/courses/${courseId}`}>
              <Button type="button" variant="outline">
                İptal
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Sınavı Oluştur
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </RoleGuard>
  );
}