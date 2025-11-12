"use client";

import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { UserPlus, X, UserIcon, AlertCircle } from "lucide-react";
import {
  useStudentsWithoutParentQuery,
  useLinkStudentToParentMutation,
} from "@/hooks/useUserQueries";
import toast from "react-hot-toast";

interface AssignStudentModalProps {
  parent: User | null;
  onClose: () => void;
}

export function AssignStudentModal({
  parent,
  onClose,
}: AssignStudentModalProps) {
  const {
    data: studentsWithoutParent,
    isLoading: loadingStudentsWithoutParent,
  } = useStudentsWithoutParentQuery(!!parent);

  const linkStudentToParentMutation = useLinkStudentToParentMutation();

  const handleAssignStudentToParent = async (studentId: string) => {
    if (!parent) return;

    console.log("🎯 Assigning student:", studentId, "to parent:", parent.id);
    const loadingToast = toast.loading("Öğrenci veliye atanıyor...");

    try {
      await linkStudentToParentMutation.mutateAsync({
        studentId,
        parentId: parent.id,
      });

      toast.dismiss(loadingToast);
      toast.success("Öğrenci başarıyla veliye atandı!");
      onClose();
    } catch (error) {
      console.error("Error assigning student to parent:", error);
      toast.dismiss(loadingToast);
      toast.error("Öğrenci atanırken hata oluştu");
    }
  };

  if (!parent) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <UserPlus className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Öğrenci Ata</h2>
                <p className="text-indigo-100 text-sm">
                  {parent.name} velisine öğrenci atayın
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {loadingStudentsWithoutParent ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">
                Öğrenciler yükleniyor...
              </span>
            </div>
          ) : studentsWithoutParent && studentsWithoutParent.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Velisi olmayan öğrencilerden birini seçin:
              </p>
              {studentsWithoutParent.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{student.user?.name}</div>
                      <div className="text-sm text-gray-500">
                        {student.user?.email}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAssignStudentToParent(student.id)}
                    disabled={linkStudentToParentMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {linkStudentToParentMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      "Ata"
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Atanabilir öğrenci yok
              </h3>
              <p className="text-gray-500">
                Şu anda velisi olmayan öğrenci bulunmuyor.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t dark:border-gray-700">
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose} className="px-6">
              İptal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
