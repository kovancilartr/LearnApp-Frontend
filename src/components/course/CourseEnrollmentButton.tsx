'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useCreateEnrollmentRequest, useMyEnrollmentRequests } from '@/hooks/useEnrollmentRequests';
import { useAuth } from '@/hooks/useAuth';
import { EnrollmentStatus } from '@/types/enrollment.types';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface CourseEnrollmentButtonProps {
  courseId: string;
  courseTitle: string;
  isEnrolled?: boolean;
  className?: string;
}

export function CourseEnrollmentButton({ 
  courseId, 
  courseTitle, 
  isEnrolled = false,
  className = ""
}: CourseEnrollmentButtonProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [showMessageInput, setShowMessageInput] = useState(false);
  
  // Öğrencinin kendi kayıt taleplerini getir
  const { data: myRequests } = useMyEnrollmentRequests({ 
    courseId,
    limit: 1 
  });
  
  const createEnrollmentRequest = useCreateEnrollmentRequest();

  // Bu kurs için mevcut kayıt talebini bul
  const existingRequest = myRequests?.requests?.find(
    request => request.courseId === courseId
  );

  const handleEnrollmentRequest = async () => {
    if (!user) {
      toast.error('Kayıt olmak için giriş yapmalısınız');
      return;
    }

    if (showMessageInput && !message.trim()) {
      toast.error('Lütfen bir mesaj yazın');
      return;
    }

    try {
      await createEnrollmentRequest.mutateAsync({
        courseId,
        message: message.trim() || undefined
      });
      
      setMessage('');
      setShowMessageInput(false);
      toast.success('Kayıt talebiniz başarıyla gönderildi!');
    } catch (error) {
      console.error('Enrollment request error:', error);
    }
  };

  // Eğer kullanıcı zaten kayıtlıysa
  if (isEnrolled) {
    return (
      <Badge variant="secondary" className={`bg-green-100 text-green-800 ${className}`}>
        <CheckCircle className="h-4 w-4 mr-2" />
        Kayıtlı
      </Badge>
    );
  }

  // Eğer bekleyen bir talep varsa
  if (existingRequest) {
    const getStatusBadge = (status: EnrollmentStatus) => {
      switch (status) {
        case 'PENDING':
          return (
            <Badge variant="outline" className={`border-yellow-300 text-yellow-700 bg-yellow-50 ${className}`}>
              <Clock className="h-4 w-4 mr-2" />
              Başvurunuz onay bekliyor
            </Badge>
          );
        case 'REJECTED':
          return (
            <Badge variant="destructive" className={`${className}`}>
              <AlertCircle className="h-4 w-4 mr-2" />
              Başvuru reddedildi
            </Badge>
          );
        default:
          return null;
      }
    };

    return getStatusBadge(existingRequest.status);
  }

  // Kayıt ol butonu
  if (!showMessageInput) {
    return (
      <div className="space-y-2">
        <Button 
          onClick={() => setShowMessageInput(true)}
          className={`bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 ${className}`}
          disabled={createEnrollmentRequest.isPending}
        >
          {createEnrollmentRequest.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Gönderiliyor...
            </>
          ) : (
            <>
              <BookOpen className="h-4 w-4 mr-2" />
              Kursa Kayıt Ol
            </>
          )}
        </Button>
      </div>
    );
  }

  // Mesaj girişi formu
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="enrollment-message" className="block text-sm font-medium text-gray-700 mb-1">
          Kayıt mesajı (isteğe bağlı)
        </label>
        <textarea
          id="enrollment-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`${courseTitle} kursuna neden katılmak istiyorsunuz?`}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          rows={3}
          maxLength={500}
        />
        <div className="text-xs text-gray-500 mt-1">
          {message.length}/500 karakter
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button 
          onClick={handleEnrollmentRequest}
          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
          disabled={createEnrollmentRequest.isPending}
        >
          {createEnrollmentRequest.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Gönderiliyor...
            </>
          ) : (
            <>
              <BookOpen className="h-4 w-4 mr-2" />
              Başvuru Gönder
            </>
          )}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => {
            setShowMessageInput(false);
            setMessage('');
          }}
          disabled={createEnrollmentRequest.isPending}
        >
          İptal
        </Button>
      </div>
    </div>
  );
}