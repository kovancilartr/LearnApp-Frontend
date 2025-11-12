"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Download } from "lucide-react";

interface EnrollmentRequestActionsProps {
  selectedRequests: string[];
  onBulkAction: (action: "approve" | "reject", adminNote?: string) => void;
  onExport: () => void;
  onClearSelection: () => void;
  isProcessing: boolean;
}

export function EnrollmentRequestActions({
  selectedRequests,
  onBulkAction,
  onExport,
  onClearSelection,
  isProcessing,
}: EnrollmentRequestActionsProps) {
  const [bulkDialog, setBulkDialog] = useState<{
    isOpen: boolean;
    action: "approve" | "reject" | null;
  }>({ isOpen: false, action: null });
  const [adminNote, setAdminNote] = useState("");

  const handleBulkAction = () => {
    if (bulkDialog.action) {
      onBulkAction(bulkDialog.action, adminNote);
      setBulkDialog({ isOpen: false, action: null });
      setAdminNote("");
    }
  };

  if (selectedRequests.length === 0) return null;

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{selectedRequests.length} talep seçildi</Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-gray-600"
          >
            Seçimi temizle
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Dışa Aktar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBulkDialog({ isOpen: true, action: "reject" })}
            disabled={isProcessing}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <XCircle className="h-4 w-4" />
            Toplu Reddet
          </Button>
          
          <Button
            size="sm"
            onClick={() => setBulkDialog({ isOpen: true, action: "approve" })}
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Toplu Onayla
          </Button>
        </div>
      </div>

      <Dialog
        open={bulkDialog.isOpen}
        onOpenChange={(open) => setBulkDialog({ isOpen: open, action: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bulkDialog.action === "approve" ? "Toplu Onaylama" : "Toplu Reddetme"}
            </DialogTitle>
            <DialogDescription>
              {selectedRequests.length} adet kayıt talebini{" "}
              {bulkDialog.action === "approve" ? "onaylamak" : "reddetmek"} istediğinizden emin misiniz?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Admin Notu (Opsiyonel)</label>
              <Textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Bu işlem için bir not ekleyebilirsiniz..."
                className="mt-1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkDialog({ isOpen: false, action: null })}
            >
              İptal
            </Button>
            <Button
              onClick={handleBulkAction}
              disabled={isProcessing}
              variant={bulkDialog.action === "approve" ? "default" : "destructive"}
            >
              {isProcessing ? "İşleniyor..." : bulkDialog.action === "approve" ? "Onayla" : "Reddet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}