'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useMyEnrollmentRequests } from '@/hooks/useEnrollmentRequests';
import { EnrollmentRequestCard } from './EnrollmentRequestCard';
import { EnrollmentStatus } from '@/types/enrollment.types';
import { 
  Search, 
  Filter, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export function MyEnrollmentRequestsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatus | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const { 
    data: requestsData, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useMyEnrollmentRequests({
    page: currentPage,
    limit: pageSize,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    search: searchTerm || undefined
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value as EnrollmentStatus | 'ALL');
    setCurrentPage(1); // Reset to first page when filtering
  };

  const getStatusStats = () => {
    if (!requestsData?.requests) return { total: 0, pending: 0, approved: 0, rejected: 0 };
    
    const requests = requestsData.requests;
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'PENDING').length,
      approved: requests.filter(r => r.status === 'APPROVED').length,
      rejected: requests.filter(r => r.status === 'REJECTED').length
    };
  };

  const stats = getStatusStats();

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Hata Oluştu</h2>
            <p className="text-gray-600 mb-4">
              Başvurularınız yüklenirken bir hata oluştu.
            </p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tekrar Dene
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Başlık */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Başvurularım</h1>
        <p className="text-gray-600">
          Kurs kayıt başvurularınızı buradan takip edebilirsiniz.
        </p>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-800">{stats.total}</div>
            <div className="text-sm text-blue-600">Toplam</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold text-yellow-800">{stats.pending}</div>
            <div className="text-sm text-yellow-600">Beklemede</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-800">{stats.approved}</div>
            <div className="text-sm text-green-600">Onaylanan</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
            <div className="text-2xl font-bold text-red-800">{stats.rejected}</div>
            <div className="text-sm text-red-600">Reddedilen</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtreler */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtreler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Kurs adı ile ara..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="sm:w-48">
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tüm Durumlar</SelectItem>
                  <SelectItem value="PENDING">Beklemede</SelectItem>
                  <SelectItem value="APPROVED">Onaylanan</SelectItem>
                  <SelectItem value="REJECTED">Reddedilen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={() => refetch()} 
              variant="outline"
              disabled={isRefetching}
            >
              {isRefetching ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Başvuru Listesi */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : requestsData?.requests && requestsData.requests.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {requestsData.requests.map((request) => (
              <EnrollmentRequestCard 
                key={request.id} 
                request={request}
                showCourseLink={true}
              />
            ))}
          </div>

          {/* Pagination */}
          {requestsData.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Önceki
              </Button>
              
              <div className="flex items-center gap-1">
                {[...Array(requestsData.totalPages)].map((_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-10"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(requestsData.totalPages, prev + 1))}
                disabled={currentPage === requestsData.totalPages}
              >
                Sonraki
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'ALL' 
                ? 'Arama kriterlerinize uygun başvuru bulunamadı' 
                : 'Henüz başvuru yapmamışsınız'
              }
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'ALL'
                ? 'Farklı filtreler deneyebilir veya arama teriminizi değiştirebilirsiniz.'
                : 'Kurslar sayfasından ilginizi çeken kurslara başvuru yapabilirsiniz.'
              }
            </p>
            {(!searchTerm && statusFilter === 'ALL') && (
              <Button asChild>
                <Link href="/student/courses">
                  <Search className="h-4 w-4 mr-2" />
                  Kursları Keşfet
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}