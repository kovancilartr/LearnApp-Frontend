"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enrollmentService } from "@/lib/services/enrollment.service";
import { useErrorHandler } from "@/hooks";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { EnrollmentRequest } from "@/types/enrollment.types";

import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Checkbox } from "../../ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Textarea } from "../../ui/textarea";
import { Label } from "../../ui/label";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  BookOpen,
  Calendar,
  MessageSquare,
  Eye,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface EnrollmentRequestTableProps {
  requests: EnrollmentRequest[];
  selectedRequests: string[];
  onSelectionChange: (requestIds: string[]) => void;
  isLoading?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

export function EnrollmentRequestTable({
  requests,
  selectedRequests,
  onSelectionChange,
  isLoading = false,
  sortBy,
  sortOrder,
  onSort,
}: EnrollmentRequestTableProps) {
  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean;
    request: EnrollmentRequest | null;
    action: "approve" | "reject" | null;
  }>({
    open: false,
    request: null,
    action: null,
  });
  const [adminNote, setAdminNote] = useState("");

  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  // Single request review mutation
  const reviewMutation = useMutation({
    mutationFn: ({
      requestId,
      action,
      adminNote,
    }: {
      requestId: string;
      action: "approve" | "reject";
      adminNote?: string;
    }) => {
      return enrollmentService.reviewEnrollmentRequest(requestId, {
        action,
        adminNote,
      });
    },
    onSuccess: (_, { action }) => {
      toast.success(
        action === "approve" ? "Talep onaylandı" : "Talep reddedildi"
      );
      setReviewDialog({ open: false, request: null, action: null });
      setAdminNote("");
      queryClient.invalidateQueries({ queryKey: ["enrollment-requests"] });
      queryClient.invalidateQueries({ queryKey: ["enrollment-statistics"] });
    },
    onError: (error) => {
      handleError(error, "Talep işlenirken hata oluştu");
    },
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(requests.map((req) => req.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRequest = (requestId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedRequests, requestId]);
    } else {
      onSelectionChange(selectedRequests.filter((id) => id !== requestId));
    }
  };

  const handleReviewClick = (
    request: EnrollmentRequest,
    action: "approve" | "reject"
  ) => {
    setReviewDialog({ open: true, request, action });
    setAdminNote("");
  };

  const handleReviewSubmit = () => {
    if (!reviewDialog.request || !reviewDialog.action) return;

    reviewMutation.mutate({
      requestId: reviewDialog.request.id,
      action: reviewDialog.action,
      adminNote: adminNote.trim() || undefined,
    });
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const handleSort = (field: string) => {
    if (onSort) {
      onSort(field);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Bekliyor
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Onaylandı
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Reddedildi
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!requests.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Kayıt talebi bulunamadı
            </h3>
            <p className="text-gray-500">
              Henüz hiç kayıt talebi gelmemiş veya filtrelere uygun talep yok.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Kayıt Talepleri ({requests.length})</span>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={
                  selectedRequests.length === requests.length &&
                  requests.length > 0
                }
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-gray-500">Tümünü Seç</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <span className="sr-only">Seç</span>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                      onClick={() => handleSort('studentName')}
                    >
                      Öğrenci
                      {getSortIcon('studentName')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                      onClick={() => handleSort('courseTitle')}
                    >
                      Kurs
                      {getSortIcon('courseTitle')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                      onClick={() => handleSort('status')}
                    >
                      Durum
                      {getSortIcon('status')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                      onClick={() => handleSort('createdAt')}
                    >
                      Talep Tarihi
                      {getSortIcon('createdAt')}
                    </Button>
                  </TableHead>
                  <TableHead>Mesaj</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRequests.includes(request.id)}
                        onCheckedChange={(checked) =>
                          handleSelectRequest(request.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {request.student.user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.student.user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {request.course.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {formatDistanceToNow(new Date(request.createdAt), { 
                              addSuffix: true, 
                              locale: tr 
                            })}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(request.createdAt).toLocaleDateString("tr-TR")}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.message ? (
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 truncate max-w-32">
                            {request.message}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Mesaj yok</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {request.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() =>
                                handleReviewClick(request, "approve")
                              }
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Onayla
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() =>
                                handleReviewClick(request, "reject")
                              }
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reddet
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog
        open={reviewDialog.open}
        onOpenChange={(open) =>
          setReviewDialog({ open, request: null, action: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewDialog.action === "approve"
                ? "Talebi Onayla"
                : "Talebi Reddet"}
            </DialogTitle>
            <DialogDescription>
              {reviewDialog.request && (
                <>
                  <strong>{reviewDialog.request.student.user.name}</strong> adlı
                  öğrencinin{" "}
                  <strong>{reviewDialog.request.course.title}</strong> kursuna
                  kayıt talebini{" "}
                  {reviewDialog.action === "approve"
                    ? "onaylamak"
                    : "reddetmek"}{" "}
                  istediğinizden emin misiniz?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="admin-note">Admin Notu (Opsiyonel)</Label>
              <Textarea
                id="admin-note"
                placeholder="Bu kararla ilgili bir not ekleyebilirsiniz..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setReviewDialog({ open: false, request: null, action: null })
              }
            >
              İptal
            </Button>
            <Button
              onClick={handleReviewSubmit}
              disabled={reviewMutation.isPending}
              className={
                reviewDialog.action === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {reviewMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : reviewDialog.action === "approve" ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              {reviewDialog.action === "approve" ? "Onayla" : "Reddet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
