"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, X } from "lucide-react";
import toast from "react-hot-toast";
import { useUpdateUserMutation } from "@/hooks/useUserQueries";
import { User } from "@/types";
import { getRoleText } from "@/types/user.types";

interface EditUserModalProps {
  user: User | null;
  onClose: () => void;
  onUserChange: (user: User) => void;
}

export function EditUserModal({
  user,
  onClose,
  onUserChange,
}: EditUserModalProps) {
  const updateUserMutation = useUpdateUserMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const loadingToast = toast.loading("Kullanıcı güncelleniyor...");

    try {
      await updateUserMutation.mutateAsync({
        id: user.id,
        updates: {
          name: user.name,
          email: user.email,
        },
      });

      toast.dismiss(loadingToast);
      toast.success("Kullanıcı başarıyla güncellendi!");
      onClose();
    } catch (error) {
      console.error("Kullanıcı güncellenirken hata oluştu:", error);
      toast.dismiss(loadingToast);
      toast.error("Kullanıcı güncellenirken hata oluştu");
    }
  };

  if (!user) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        {/* Modal Header */}
        <div className="modal-header-success px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="modal-header-icon">
                <Edit className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Kullanıcı Düzenle</h2>
                <p className="text-white text-sm mt-1">
                  {user.name} bilgilerini güncelle
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="edit-name"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Ad Soyad
                </Label>
                <Input
                  id="edit-name"
                  value={user.name}
                  onChange={(e) =>
                    onUserChange({ ...user, name: e.target.value })
                  }
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label
                  htmlFor="edit-email"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  E-posta
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={user.email}
                  onChange={(e) =>
                    onUserChange({ ...user, email: e.target.value })
                  }
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Kullanıcı Bilgileri
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Rol:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                    {getRoleText(user.role)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Kayıt Tarihi:
                  </span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                    {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-600">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-6"
              >
                İptal
              </Button>
              <Button type="submit" className="px-6 modal-close-btn-purple">
                Güncelle
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
