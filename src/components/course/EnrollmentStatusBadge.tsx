'use client';

import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { EnrollmentStatus } from '@/types/enrollment.types';

interface EnrollmentStatusBadgeProps {
  status: EnrollmentStatus;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function EnrollmentStatusBadge({ 
  status, 
  className = "",
  showIcon = true,
  size = 'md'
}: EnrollmentStatusBadgeProps) {
  
  const getStatusConfig = (status: EnrollmentStatus) => {
    switch (status) {
      case 'PENDING':
        return {
          variant: 'outline' as const,
          className: 'border-yellow-300 text-yellow-700 bg-yellow-50',
          icon: Clock,
          text: 'Onay Bekliyor',
          description: 'Başvurunuz admin onayı bekliyor'
        };
      case 'APPROVED':
        return {
          variant: 'secondary' as const,
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          text: 'Onaylandı',
          description: 'Başvurunuz onaylandı'
        };
      case 'REJECTED':
        return {
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          text: 'Reddedildi',
          description: 'Başvurunuz reddedildi'
        };
      default:
        return {
          variant: 'outline' as const,
          className: 'border-gray-300 text-gray-700 bg-gray-50',
          icon: AlertCircle,
          text: 'Bilinmeyen',
          description: 'Durum bilinmiyor'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  };

  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${sizeClasses[size]} ${className}`}
      title={config.description}
    >
      {showIcon && <Icon className={`${iconSizes[size]} mr-1`} />}
      {config.text}
    </Badge>
  );
}

// Özel durum bileşenleri
export function PendingEnrollmentBadge({ className = "", size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  return <EnrollmentStatusBadge status="PENDING" className={className} size={size} />;
}

export function ApprovedEnrollmentBadge({ className = "", size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  return <EnrollmentStatusBadge status="APPROVED" className={className} size={size} />;
}

export function RejectedEnrollmentBadge({ className = "", size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  return <EnrollmentStatusBadge status="REJECTED" className={className} size={size} />;
}