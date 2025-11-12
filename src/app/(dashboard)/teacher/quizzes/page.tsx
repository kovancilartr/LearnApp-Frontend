'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RoleGuard } from '@/components/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useQuizStore } from '@/store/quizStore';
import { 
  FileText, 
  Search, 
  Edit, 
  Eye,
  Calendar,
  Clock,
  Users,
  Award
} from 'lucide-react';

export default function TeacherQuizzesPage() {
  const { 
    quizzes, 
    isLoadingQuizzes, 
    fetchQuizzes 
  } = useQuizStore();
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const filteredQuizzes = (quizzes || []).filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <RoleGuard allowedRoles={['TEACHER']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Sınavlarım</h2>
            <p className="text-muted-foreground">
              Oluşturduğunuz sınavları yönetin ve sonuçları görüntüleyin
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Sınav ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {isLoadingQuizzes ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'Sınav bulunamadı' : 'Henüz sınav oluşturmadınız'}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm 
                  ? 'Arama kriterlerinize uygun sınav bulunamadı.'
                  : 'Öğrencilerinizi değerlendirmek için sınavlar oluşturun.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredQuizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span className="line-clamp-2">{quiz.title}</span>
                    <Badge variant="secondary" className="ml-2">
                      {quiz.questions?.length || 0} soru
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="mr-1 h-4 w-4" />
                        {quiz.duration ? `${Math.floor(quiz.duration / 60)} dk` : 'Sınırsız'}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Award className="mr-1 h-4 w-4" />
                        {quiz.attemptsAllowed} deneme
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Users className="mr-1 h-4 w-4" />
                        {quiz.attempts?.length || 0} deneme
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="mr-1 h-4 w-4" />
                        {new Date(quiz.createdAt).toLocaleDateString('tr-TR')}
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Link href={`/teacher/quizzes/${quiz.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="mr-2 h-4 w-4" />
                          Görüntüle
                        </Button>
                      </Link>
                      <Link href={`/teacher/quizzes/${quiz.id}/edit`} className="flex-1">
                        <Button size="sm" className="w-full">
                          <Edit className="mr-2 h-4 w-4" />
                          Düzenle
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}