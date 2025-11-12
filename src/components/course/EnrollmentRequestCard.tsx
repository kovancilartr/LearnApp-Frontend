'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EnrollmentRequest } from '@/types/enrollment.types';
import { EnrollmentStatusBadge } from './EnrollmentStatusBadge';
import { BookOpen, Calendar, MessageSquare, User, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import Link from 'next/link';

interface EnrollmentRequestCardProps {
  request: EnrollmentRequest;
  showCourseLink?: boolean;
  className?: string;
}

export function EnrollmentRequestCard({ 
  request, 
  showCourseLink = true,
  className = ""
}: EnrollmentRequestCardProps) {
  
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: tr 
      });
    } catch {
      return new Date(dateString).toLocaleDateString('tr-TR');
    }
  };

  const getStatusIcon = () => {
    switch (request.status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusMessage = () => {
    switch (request.status) {
      case 'PENDING':
        return 'Başvurunuz admin onayı bekliyor. Sonuç için lütfen bekleyiniz.';
      case 'APPROVED':
        return 'Tebrikler! Başvurunuz onaylandı. Artık kursa erişebilirsiniz.';
      case 'REJECTED':
        return 'Başvurunuz reddedildi. Detaylar için admin notunu inceleyebilirsiniz.';
      default:
        return 'Başvuru durumu bilinmiyor.';
    }
  };

  return (
    <Card className={`hover:shadow-md transition-shadow duration-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              {request.course.title}
            </CardTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(request.createdAt)}
              </div>
              {request.reviewedAt && (
                <div className="flex items-center gap-1">
                  {getStatusIcon()}
                  {formatDate(request.reviewedAt)}
                </div>
              )}
            </div>
          </div>
          <EnrollmentStatusBadge status={request.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Durum Mesajı */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            {getStatusMessage()}
          </p>
        </div>

        {/* Kurs Açıklaması */}
        {request.course.description && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Kurs Hakkında</h4>
            <p className="text-sm text-gray-600 line-clamp-2">
              {request.course.description}
            </p>
          </div>
        )}

        {/* Başvuru Mesajı */}
        {request.message && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              Başvuru Mesajınız
            </h4>
            <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <p className="text-sm text-blue-800">
                "{request.message}"
              </p>
            </div>
          </div>
        )}

        {/* Admin Notu */}
        {request.adminNote && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
              <User className="h-4 w-4" />
              Admin Notu
            </h4>
            <div className={`p-3 rounded-lg border-l-4 ${
              request.status === 'APPROVED' 
                ? 'bg-green-50 border-green-400' 
                : request.status === 'REJECTED'
                ? 'bg-red-50 border-red-400'
                : 'bg-gray-50 border-gray-400'
            }`}>
              <p className={`text-sm ${
                request.status === 'APPROVED' 
                  ? 'text-green-800' 
                  : request.status === 'REJECTED'
                  ? 'text-red-800'
                  : 'text-gray-800'
              }`}>
                "{request.adminNote}"
              </p>
              {request.reviewedBy && (
                <p className="text-xs text-gray-500 mt-1">
                  - {request.reviewedBy}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Aksiyon Butonları */}
        <div className="flex gap-2 pt-2">
          {showCourseLink && (
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={`/student/courses/${request.courseId}`}>
                <BookOpen className="h-4 w-4 mr-2" />
                Kurs Detayı
              </Link>
            </Button>
          )}
          
          {request.status === 'APPROVED' && (
            <Button asChild size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
              <Link href={`/student/courses/${request.courseId}`}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Kursa Git
              </Link>
            </Button>
          )}
        </div>

        {/* Başvuru ID */}
        <div className="text-xs text-gray-400 border-t pt-2">
          Başvuru ID: {request.id}
        </div>
      </CardContent>
    </Card>
  );
}