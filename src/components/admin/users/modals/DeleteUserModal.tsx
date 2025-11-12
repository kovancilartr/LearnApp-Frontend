"use client";

import { Button } from "@/components/ui/button";
import { Trash2, X, User as UserIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useDeleteUserMutation } from "@/hooks/useUserQueries";
import { User } from "@/types";
import { getRoleColor, getRoleText } from "@/types/user.types";

interface DeleteUserModalProps {
  user: User | null;
  onClose: () => void;
}

export function DeleteUserModal({ user, onClose }: DeleteUserModalProps) {
  const deleteUserMutation = useDeleteUserMutation();

  const handleConfirmDelete = async () => {
    if (!user) return;

    const loadingToast = toast.loading("Kullanıcı siliniyor...");

    try {
      await deleteUserMutation.mutateAsync(user.id);

      toast.dismiss(loadingToast);
      toast.success("Kullanıcı başarıyla silindi!");
      onClose();
    } catch (error) {
      console.error("Kullanıcı silinirken hata oluştu:", error);
      toast.dismiss(loadingToast);
      toast.error("Kullanıcı silinirken hata oluştu");
    }
  };

  if (!user) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container-md">
        {/* Modal Header */}
        <div className="modal-header-danger px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="modal-header-icon">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Kullanıcı Sil</h2>
                <p className="text-red-100 text-sm mt-1">
                  Bu işlem geri alınamaz
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="modal-close-btn"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center space-x-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                <UserIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  {user.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.email}
                </p>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getRoleColor(
                    user.role
                  )}`}
                >
                  {getRoleText(user.role)}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5">
                  ⚠️
                </div>
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                    Dikkat!
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem
                    geri alınamaz ve kullanıcının tüm verileri kalıcı olarak
                    silinecektir.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose} className="px-6">
              İptal
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="px-6 bg-red-600 hover:bg-red-700 text-white"
            >
              Evet, Sil
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
