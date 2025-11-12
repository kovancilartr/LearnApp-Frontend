'use client';

import { useState, useEffect } from 'react';
import { RoleGuard } from '@/components/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMyEnrollmentRequests, useCreateEnrollmentRequest } from '@/hooks/useEnrollmentRequests';
import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';
import { CheckCircle, XCircle, Clock, BookOpen, Plus, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentEnrollmentRequestsPage() {
  const { user } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get student's enrollment requests
  const { data: requestsData, isLoading, refetch } = useMyEnrollmentRequests({
    limit: 50
  });

  // Create enrollment request mutation
  const createEnrollmentRequest = useCreateEnrollmentRequest();

  // Get available courses for enrollment
  const { courses, fetchCourses } = useCourses();
  
  // Ensure courses is always an array
  const coursesArray = Array.isArray(courses) ? courses : [];
  
  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleCreateRequest = async () => {
    if (!selectedCourseId) return;

    setIsSubmitting(true);
    try {
      await createEnrollmentRequest.mutateAsync({
        courseId: selectedCourseId,
        message: message.trim() || undefined
      });

      setShowCreateDialog(false);
      setSelectedCourseId('');
      setMessage('');
    } catch (error) {
      // Error is handled by the mutation hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Beklemede</Badge>;
      case 'APPROVED':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Onaylandı</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Reddedildi</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Talebiniz inceleniyor. Sonuç için bekleyiniz.';
      case 'APPROVED':
        return 'Tebrikler! Kursa kaydınız onaylandı. Artık derslere erişebilirsiniz.';
      case 'REJECTED':
        return 'Maalesef talebiniz reddedildi. Detaylar için admin notunu kontrol edin.';
      default:
        return '';
    }
  };

  const filteredRequests = requestsData?.requests?.filter(request =>
    searchTerm === '' || 
    request.course.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Get courses that student hasn't requested yet
  const availableCourses = coursesArray.filter(course => {
    const hasRequest = requestsData?.requests?.some(req => req.courseId === course.id);
    return !hasRequest;
  });

  return (
    <RoleGuard allowedRoles={['STUDENT']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Kayıt Taleplerim</h1>
            <p className="text-muted-foreground">Kurs kayıt taleplerinizi görüntüleyin ve yeni talep oluşturun</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Talep
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Kurs ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
        </Card>

        {/* Requests List */}
        <Card>
          <CardHeader>
            <CardTitle>Kayıt Taleplerim</CardTitle>
            <CardDescription>
              Gönderdiğiniz kurs kayıt taleplerinin durumunu takip edin
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Kayıt talepleri yükleniyor...</div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Henüz kayıt talebiniz bulunmuyor</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowCreateDialog(true)}
                >
                  İlk talebinizi oluşturun
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{request.course.title}</h3>
                          {getStatusBadge(request.status)}
                        </div>
                        
                        {request.course.description && (
                          <p className="text-sm text-muted-foreground">{request.course.description}</p>
                        )}
                        
                        <p className="text-sm text-muted-foreground">
                          {getStatusDescription(request.status)}
                        </p>
                        
                        {request.message && (
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                            <p className="text-sm"><strong>Mesajınız:</strong> {request.message}</p>
                          </div>
                        )}
                        
                        {request.adminNote && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                            <p className="text-sm"><strong>Admin Notu:</strong> {request.adminNote}</p>
                          </div>
                        )}
                        
                        <p className="text-xs text-muted-foreground">
                          Talep tarihi: {format(new Date(request.createdAt), 'dd MMM yyyy HH:mm')}
                        </p>
                        
                        {request.updatedAt !== request.createdAt && (
                          <p className="text-xs text-muted-foreground">
                            Güncelleme: {format(new Date(request.updatedAt), 'dd MMM yyyy HH:mm')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Request Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Kayıt Talebi</DialogTitle>
              <DialogDescription>
                Kaydolmak istediğiniz kursu seçin ve isteğe bağlı bir mesaj ekleyin.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Kurs Seçin</label>
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Bir kurs seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCourses.length === 0 ? (
                      <SelectItem value="" disabled>
                        Kayıt yapabileceğiniz kurs bulunmuyor
                      </SelectItem>
                    ) : (
                      availableCourses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Mesaj (İsteğe Bağlı)</label>
                <Textarea
                  placeholder="Neden bu kursa kaydolmak istiyorsunuz? (İsteğe bağlı)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                İptal
              </Button>
              <Button 
                onClick={handleCreateRequest}
                disabled={!selectedCourseId || isSubmitting || availableCourses.length === 0}
              >
                {isSubmitting ? 'Gönderiliyor...' : 'Talep Gönder'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}