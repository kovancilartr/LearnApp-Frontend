'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  Download, 
  Share2, 
  Calendar,
  User,
  BookOpen,
  Star,
  Trophy
} from 'lucide-react';
import { ProgressCertificate } from '@/lib/services';
import { cn } from '@/lib/utils';

interface CertificateCardProps {
  certificate: ProgressCertificate;
  onDownload?: (certificate: ProgressCertificate) => void;
  onShare?: (certificate: ProgressCertificate) => void;
  isDownloading?: boolean;
  className?: string;
}

export function CertificateCard({
  certificate,
  onDownload,
  onShare,
  isDownloading = false,
  className
}: CertificateCardProps) {
  const {
    courseTitle,
    studentName,
    completionDate,
    completionPercentage,
    certificateId
  } = certificate;

  const formattedDate = new Date(completionDate).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Card className={cn(
      'relative overflow-hidden bg-gradient-to-br from-yellow-50 via-white to-yellow-50 border-2 border-yellow-200',
      className
    )}>
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-bl-full opacity-20" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-yellow-200 to-yellow-300 rounded-tr-full opacity-20" />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Trophy className="h-6 w-6 text-yellow-600" />
            Tamamlama Sertifikası
          </CardTitle>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Award className="h-3 w-3 mr-1" />
            Onaylandı
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-6">
        {/* Certificate Content */}
        <div className="text-center space-y-4 p-6 bg-white/50 rounded-lg border border-yellow-200">
          {/* Header */}
          <div className="space-y-2">
            <div className="text-2xl font-bold text-yellow-800">
              🏆 Başarı Sertifikası
            </div>
            <div className="text-sm text-yellow-600">
              Bu sertifika aşağıdaki kişinin başarısını onaylar
            </div>
          </div>

          {/* Student Name */}
          <div className="space-y-1">
            <div className="text-lg font-semibold text-gray-800 flex items-center justify-center gap-2">
              <User className="h-5 w-5 text-yellow-600" />
              {studentName}
            </div>
          </div>

          {/* Course Info */}
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              aşağıdaki kursu başarıyla tamamlamıştır:
            </div>
            <div className="text-xl font-bold text-blue-800 flex items-center justify-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              {courseTitle}
            </div>
          </div>

          {/* Completion Stats */}
          <div className="flex justify-center items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-green-600">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-semibold">{completionPercentage}% Tamamlama</span>
            </div>
            <div className="flex items-center gap-1 text-blue-600">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Certificate ID */}
          <div className="text-xs text-gray-500 font-mono">
            Sertifika No: {certificateId}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {onDownload && (
            <Button
              onClick={() => onDownload(certificate)}
              disabled={isDownloading}
              className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800"
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  İndiriliyor...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  PDF İndir
                </>
              )}
            </Button>
          )}

          {onShare && (
            <Button
              onClick={() => onShare(certificate)}
              variant="outline"
              className="flex-1 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Paylaş
            </Button>
          )}
        </div>

        {/* Certificate Preview */}
        <div className="text-center text-xs text-gray-500">
          Bu sertifika dijital olarak onaylanmış ve geçerlidir.
        </div>
      </CardContent>
    </Card>
  );
}

// Certificate Gallery Component
interface CertificateGalleryProps {
  certificates: ProgressCertificate[];
  onDownload?: (certificate: ProgressCertificate) => void;
  onShare?: (certificate: ProgressCertificate) => void;
  isDownloading?: boolean;
}

export function CertificateGallery({
  certificates,
  onDownload,
  onShare,
  isDownloading = false
}: CertificateGalleryProps) {
  if (certificates.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Henüz Sertifikanız Yok
          </h3>
          <p className="text-gray-500">
            Kursları tamamladığınızda sertifikalarınız burada görünecek.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-600" />
          Sertifikalarım ({certificates.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {certificates.map((certificate) => (
          <CertificateCard
            key={certificate.certificateId}
            certificate={certificate}
            onDownload={onDownload}
            onShare={onShare}
            isDownloading={isDownloading}
          />
        ))}
      </div>
    </div>
  );
}