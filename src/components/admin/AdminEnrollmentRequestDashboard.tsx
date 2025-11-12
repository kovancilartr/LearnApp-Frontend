"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enrollmentService } from "@/lib/services/enrollment.service";
import { courseService } from "@/lib/services";
import { useErrorHandler } from "@/hooks";
import { toast } from "react-hot-toast";
import type {
  EnrollmentRequest,
  EnrollmentRequestFilters,
  EnrollmentRequestStatistics,
  EnrollmentRequestsResponse,
} from "@/types/enrollment.types";

import { EnrollmentRequestStats } from "./enrollment/EnrollmentRequestStats";
import { EnrollmentRequestFilters as Filters } from "./enrollment/EnrollmentRequestFilters";
import { EnrollmentRequestActions } from "./enrollment/EnrollmentRequestActions";
import { EnrollmentRequestTable } from "./enrollment/EnrollmentRequestTable";

const DEFAULT_FILTERS: EnrollmentRequestFilters = {
  page: 1,
  limit: 10,
  sortBy: "createdAt",
  sortOrder: "desc",
};

export default function AdminEnrollmentRequestDashboard() {
  const [filters, setFilters] =
    useState<EnrollmentRequestFilters>(DEFAULT_FILTERS);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  // Queries
  const { data: statistics, isLoading: statisticsLoading } =
    useQuery<EnrollmentRequestStatistics>({
      queryKey: ["enrollment-statistics"],
      queryFn: enrollmentService.getEnrollmentRequestStatistics,
    });

  const { data: requestsData, isLoading: requestsLoading } =
    useQuery<EnrollmentRequestsResponse>({
      queryKey: ["enrollment-requests", filters],
      queryFn: () => enrollmentService.getEnrollmentRequests(filters),
    });

  const { data: courses } = useQuery({
    queryKey: ["courses-for-filter"],
    queryFn: () => courseService.getCourses({ limit: 100 }),
  });

  // Mutations
  const bulkProcessMutation = useMutation({
    mutationFn: ({
      requestIds,
      action,
      adminNote,
    }: {
      requestIds: string[];
      action: "approve" | "reject";
      adminNote?: string;
    }) => {
      return enrollmentService.bulkProcessEnrollmentRequests({
        requestIds,
        action,
        adminNote,
      });
    },
    onSuccess: (result) => {
      toast.success(`${result.successCount} talep başarıyla işlendi`);
      if (result.failureCount > 0) {
        toast.error(`${result.failureCount} talep işlenemedi`);
      }
      setSelectedRequests([]);
      queryClient.invalidateQueries({ queryKey: ["enrollment-requests"] });
      queryClient.invalidateQueries({ queryKey: ["enrollment-statistics"] });
    },
    onError: (error) => {
      handleError(error, "Toplu işlem sırasında hata oluştu");
    },
  });

  // Handlers
  const handleFilterChange = (
    key: keyof EnrollmentRequestFilters,
    value: any
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value,
    }));
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSelectedRequests([]);
  };

  const handleBulkAction = (
    action: "approve" | "reject",
    adminNote?: string
  ) => {
    bulkProcessMutation.mutate({
      requestIds: selectedRequests,
      action,
      adminNote,
    });
  };

  const handleExport = () => {
    if (!requestsData?.requests?.length) return;

    const csvContent = [
      ["Öğrenci Adı", "Email", "Kurs", "Durum", "Talep Tarihi", "Mesaj"].join(
        ","
      ),
      ...requestsData.requests
        .filter((req) => selectedRequests.includes(req.id))
        .map((request) =>
          [
            `"${request.student.user.name}"`,
            `"${request.student.user.email}"`,
            `"${request.course.title}"`,
            `"${request.status}"`,
            `"${new Date(request.createdAt).toLocaleDateString("tr-TR")}"`,
            `"${request.message || ""}"`,
          ].join(",")
        ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `enrollment-requests-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Veriler başarıyla dışa aktarıldı");
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "a" &&
        selectedRequests.length === 0
      ) {
        event.preventDefault();
        if (requestsData?.requests?.length) {
          setSelectedRequests(requestsData.requests.map((req) => req.id));
          toast.success(`${requestsData.requests.length} talep seçildi`);
        }
      }

      if (event.key === "Escape" && selectedRequests.length > 0) {
        setSelectedRequests([]);
        toast.success("Seçim temizlendi");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedRequests, requestsData?.requests]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Kayıt Talepleri</h1>
      </div>

      <EnrollmentRequestStats
        statistics={statistics}
        isLoading={statisticsLoading}
      />

      <Filters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        courses={courses?.data}
        isLoading={requestsLoading}
      />

      <EnrollmentRequestActions
        selectedRequests={selectedRequests}
        onBulkAction={handleBulkAction}
        onExport={handleExport}
        onClearSelection={() => setSelectedRequests([])}
        isProcessing={bulkProcessMutation.isPending}
      />

      <EnrollmentRequestTable
        requests={requestsData?.requests || []}
        selectedRequests={selectedRequests}
        onSelectionChange={setSelectedRequests}
        isLoading={requestsLoading}
      />
    </div>
  );
}
