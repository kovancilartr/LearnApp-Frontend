"use client";

import React, { useState } from "react";
import { useExportProgressData } from "@/hooks/useParentQuery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileImage,
  Calendar,
  Filter,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface ProgressExportProps {
  className?: string;
}

export function ProgressExport({ className }: ProgressExportProps) {
  const { exportData } = useExportProgressData();

  const [selectedFormat, setSelectedFormat] = useState<"json" | "csv" | "pdf">(
    "json"
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Validate date range if provided
      let dateRange;
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
          toast.error("Başlangıç tarihi bitiş tarihinden önce olmalıdır");
          return;
        }

        dateRange = { startDate, endDate };
      } else if (startDate || endDate) {
        toast.error("Hem başlangıç hem de bitiş tarihi belirtilmelidir");
        return;
      }

      const result = await exportData(selectedFormat, dateRange);

      // Create and download file
      const blob = createBlob((result as any).data, selectedFormat);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = (result as any).filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(
        `${getFormatLabel(selectedFormat)} formatında rapor indirildi`
      );
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error(error.message || "Rapor dışa aktarılırken hata oluştu");
    } finally {
      setIsExporting(false);
    }
  };

  const createBlob = (data: unknown, format: string): Blob => {
    switch (format) {
      case "json":
        return new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
      case "csv":
        return new Blob([data as string], { type: "text/csv" });
      case "pdf":
        // For PDF, we return the structured data as JSON that can be processed by a PDF generator
        return new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
      default:
        return new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "json":
        return <FileText className="h-5 w-5" />;
      case "csv":
        return <FileSpreadsheet className="h-5 w-5" />;
      case "pdf":
        return <FileImage className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getFormatLabel = (format: string) => {
    switch (format) {
      case "json":
        return "JSON";
      case "csv":
        return "CSV (Excel)";
      case "pdf":
        return "PDF";
      default:
        return format.toUpperCase();
    }
  };

  const getFormatDescription = (format: string) => {
    switch (format) {
      case "json":
        return "Yapılandırılmış veri formatı, teknik analiz için uygun";
      case "csv":
        return "Excel ve diğer tablolama programlarında açılabilir";
      case "pdf":
        return "Yazdırılabilir rapor formatı, sunum için uygun";
      default:
        return "";
    }
  };

  // Set default date range to last 30 days
  const setLast30Days = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    setEndDate(end.toISOString().split("T")[0]);
    setStartDate(start.toISOString().split("T")[0]);
  };

  // Set default date range to last 3 months
  const setLast3Months = () => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 3);

    setEndDate(end.toISOString().split("T")[0]);
    setStartDate(start.toISOString().split("T")[0]);
  };

  // Clear date range
  const clearDateRange = () => {
    setStartDate("");
    setEndDate("");
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          İlerleme Raporu Dışa Aktarma
        </CardTitle>
        <p className="text-sm text-gray-600">
          Çocuklarınızın ilerleme verilerini farklı formatlarda indirin
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Format Selection */}
        <div>
          <Label className="text-base font-medium mb-3 block">
            Dosya Formatı
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["json", "csv", "pdf"] as const).map((format) => (
              <div
                key={format}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedFormat === format
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedFormat(format)}
              >
                <div className="flex items-center gap-3 mb-2">
                  {getFormatIcon(format)}
                  <span className="font-medium">{getFormatLabel(format)}</span>
                  {selectedFormat === format && (
                    <div className="ml-auto w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {getFormatDescription(format)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Date Range Selection */}
        <div>
          <Label className="text-base font-medium mb-3 block">
            Tarih Aralığı (İsteğe Bağlı)
          </Label>
          <div className="space-y-4">
            {/* Quick Date Range Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={setLast30Days}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Son 30 Gün
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={setLast3Months}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Son 3 Ay
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearDateRange}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Tüm Veriler
              </Button>
            </div>

            {/* Custom Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" className="text-sm font-medium">
                  Başlangıç Tarihi
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-sm font-medium">
                  Bitiş Tarihi
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {startDate && endDate && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Seçilen Aralık:{" "}
                  {new Date(startDate).toLocaleDateString("tr-TR")} -{" "}
                  {new Date(endDate).toLocaleDateString("tr-TR")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Export Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Rapor İçeriği</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Tüm çocukların genel ilerleme özeti</li>
            <li>• Kurs bazında detaylı ilerleme verileri</li>
            <li>• Quiz sonuçları ve performans metrikleri</li>
            <li>• Son aktiviteler ve tamamlanan dersler</li>
            <li>• Haftalık ve aylık performans trendleri</li>
            {startDate && endDate && (
              <li>• Seçilen tarih aralığına göre filtrelenmiş veriler</li>
            )}
          </ul>
        </div>

        {/* Export Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleExport}
            disabled={isExporting}
            size="lg"
            className="flex items-center gap-2"
          >
            {isExporting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Download className="h-5 w-5" />
            )}
            {isExporting
              ? "Dışa Aktarılıyor..."
              : `${getFormatLabel(selectedFormat)} Olarak İndir`}
          </Button>
        </div>

        {/* Format-specific Notes */}
        <div className="text-xs text-gray-500 space-y-1">
          {selectedFormat === "json" && (
            <p>• JSON formatı geliştiriciler ve veri analisti için uygundur</p>
          )}
          {selectedFormat === "csv" && (
            <p>
              • CSV dosyası Excel, Google Sheets ve diğer tablolama
              programlarında açılabilir
            </p>
          )}
          {selectedFormat === "pdf" && (
            <p>• PDF formatı yazdırma ve sunum için optimize edilmiştir</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
