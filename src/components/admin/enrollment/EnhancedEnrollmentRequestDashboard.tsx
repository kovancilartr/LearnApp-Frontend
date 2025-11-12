'use client';

import { useState, useMemo } from 'react';
import { useEnrollmentRequests, useBulkApproveRequests, useBulkRejectRequests } from '@/hooks/useEnrollmentRequests';
import { useCourses } from '@/hooks/useCourses';
import { EnrollmentRequestTable } from './EnrollmentRequestTable';
import { EnrollmentRequestFilters } from './EnrollmentRequestFilters';
import { EnrollmentRequestActions } from './EnrollmentRequestActions';
import { EnrollmentRequestStats } from './EnrollmentRequestStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { EnrollmentRequestFilters as FilterType } from '@/types/enrollment.types';
import { Download, FileSpreadsheet, RefreshCw, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function EnhancedEnrollmentRequestDashboard() {
  const [filters, setFilters] = useState<FilterType>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

  const { data: requestsData, isLoading, refetch } = useEnrollmentRequests(filters);
  const { courses: coursesData } = useCourses();
  
  const bulkApprove = useBulkApproveRequests();
  const bulkReject = useBulkRejectRequests();

  const handleFilterChange = (key: keyof FilterType, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset to first page when filtering
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setSelectedRequests([]);
  };

  const handleSort = (field: string) => {
    const newOrder = filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: newOrder
    }));
  };

  const handleBulkAction = async (action: 'approve' | 'reject', adminNote?: string) => {
    try {
      if (action === 'approve') {
        await bulkApprove.mutateAsync({ requestIds: selectedRequests, adminNote });
      } else {
        await bulkReject.mutateAsync({ requestIds: selectedRequests, adminNote });
      }
      setSelectedRequests([]);
      refetch();
    } catch (error) {
      console.error('Bulk action error:', error);
    }
  };

  const handleExport = () => {
    if (!requestsData?.requests) return;

    const csvContent = [
      ['Öğrenci Adı', 'Email', 'Kurs', 'Durum', 'Talep Tarihi', 'Mesaj', 'Admin Notu'].join(','),
      ...requestsData.requests.map(request => [
        request.student.user.name,
        request.student.user.email,
        request.course.title,
        request.status,
        new Date(request.createdAt).toLocaleDateString('tr-TR'),
        request.message || '',
        request.adminNote || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `enrollment-requests-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Veriler başarıyla dışa aktarıldı');
  };

  const stats = useMemo(() => {
    if (!requestsData?.requests) return { total: 0, pending: 0, approved: 0, rejected: 0 };
    
    const requests = requestsData.requests;
    return {
      total: requestsData.total || requests.length,
      pending: requests.filter(r => r.status === 'PENDING').length,
      approved: requests.filter(r => r.status === 'APPROVED').length,
      rejected: requests.filter(r => r.status === 'REJECTED').length
    };
  }, [requestsData]);

  return (
    <div className="space-y-6">
      {/* Başlık ve Hızlı Aksiyonlar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kayıt Talepleri Yönetimi</h1>
          <p className="text-gray-600">Öğrenci kurs kayıt taleplerini yönetin ve onaylayın</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
          
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={!requestsData?.requests?.length}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Dışa Aktar
          </Button>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-800">{stats.total}</div>
            <div className="text-sm text-blue-600">Toplam Talep</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold text-yellow-800">{stats.pending}</div>
            <div className="text-sm text-yellow-600">Bekleyen</div>
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
      <EnrollmentRequestFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        courses={coursesData}
        isLoading={isLoading}
      />

      {/* Toplu İşlemler */}
      <EnrollmentRequestActions
        selectedRequests={selectedRequests}
        onBulkAction={handleBulkAction}
        onExport={handleExport}
        onClearSelection={() => setSelectedRequests([])}
        isProcessing={bulkApprove.isPending || bulkReject.isPending}
      />

      {/* Tablo */}
      <EnrollmentRequestTable
        requests={requestsData?.requests || []}
        selectedRequests={selectedRequests}
        onSelectionChange={setSelectedRequests}
        isLoading={isLoading}
        sortBy={filters.sortBy}
        sortOrder={filters.sortOrder}
        onSort={handleSort}
      />

      {/* Pagination */}
      {requestsData && requestsData.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleFilterChange('page', Math.max(1, (filters.page || 1) - 1))}
            disabled={filters.page === 1}
          >
            Önceki
          </Button>
          
          <div className="flex items-center gap-1">
            {[...Array(Math.min(requestsData.totalPages, 5))].map((_, i) => {
              const page = i + 1;
              const currentPage = filters.page || 1;
              
              // Show pages around current page
              let pageToShow = page;
              if (requestsData.totalPages > 5) {
                if (currentPage <= 3) {
                  pageToShow = page;
                } else if (currentPage >= requestsData.totalPages - 2) {
                  pageToShow = requestsData.totalPages - 4 + page;
                } else {
                  pageToShow = currentPage - 2 + page;
                }
              }
              
              return (
                <Button
                  key={pageToShow}
                  variant={currentPage === pageToShow ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange('page', pageToShow)}
                  className="w-10"
                >
                  {pageToShow}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            onClick={() => handleFilterChange('page', Math.min(requestsData.totalPages, (filters.page || 1) + 1))}
            disabled={filters.page === requestsData.totalPages}
          >
            Sonraki
          </Button>
        </div>
      )}

      {/* Sayfa Bilgisi */}
      {requestsData && (
        <div className="text-center text-sm text-gray-500">
          Toplam {requestsData.total} talepten {((filters.page || 1) - 1) * (filters.limit || 20) + 1}-
          {Math.min((filters.page || 1) * (filters.limit || 20), requestsData.total)} arası gösteriliyor
        </div>
      )}
    </div>
  );
}