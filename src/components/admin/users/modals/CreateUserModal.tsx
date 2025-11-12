"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, X } from "lucide-react";
import toast from "react-hot-toast";
import { useCreateUserMutation } from "@/hooks/useUserQueries";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const translateValidationError = (message: string): string => {
  const translations: Record<string, string> = {
    "Format is invalid": "Format geçersiz",
    "Password must be at least 8 characters long": "Şifre en az 8 karakter olmalı",
    "Password must contain at least one uppercase letter": "Şifre en az bir büyük harf içermeli",
    "Password must contain at least one lowercase letter": "Şifre en az bir küçük harf içermeli",
    "Password must contain at least one number": "Şifre en az bir rakam içermeli",
    "Password must contain at least one special character": "Şifre en az bir özel karakter içermeli",
    "Password cannot contain whitespace characters": "Şifre boşluk karakteri içeremez",
    "Password cannot be a very common password": "Şifre çok yaygın bir şifre olamaz",
    "Name can only contain letters, spaces, hyphens, apostrophes, and dots": "İsim sadece harf, boşluk, tire, kesme işareti ve nokta içerebilir",
    "Name can only contain letters (including Turkish characters), spaces, hyphens, apostrophes, and dots": "İsim sadece harf (Türkçe karakterler dahil), boşluk, tire, kesme işareti ve nokta içerebilir",
    "Name must be at least 2 characters long": "İsim en az 2 karakter olmalı",
    "Name cannot be empty": "İsim boş olamaz",
    "Email is required": "E-posta gerekli",
    "Please enter a valid email address": "Geçerli bir e-posta adresi girin",
    "Email cannot be empty": "E-posta boş olamaz",
    "Password is required": "Şifre gerekli",
    "Password cannot be empty": "Şifre boş olamaz",
    "Role must be one of: ADMIN, TEACHER, STUDENT, PARENT": "Rol ADMIN, TEACHER, STUDENT, PARENT'tan biri olmalı",
  };
  return translations[message] || message;
};

export function CreateUserModal({ isOpen, onClose }: CreateUserModalProps) {
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT" as const,
  });

  const createUserMutation = useCreateUserMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const loadingToast = toast.loading("Kullanıcı oluşturuluyor...");

    try {
      await createUserMutation.mutateAsync({
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
      });

      toast.dismiss(loadingToast);
      toast.success("Kullanıcı başarıyla oluşturuldu!");

      setNewUser({ name: "", email: "", password: "", role: "STUDENT" });
      onClose();
    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error("Create user error:", error);

      if (error?.response?.data?.error?.details?.errors) {
        const errors = error.response.data.error.details.errors;
        const translatedMessages = errors.map((err: any) =>
          translateValidationError(err.message)
        );
        const uniqueMessages = [...new Set(translatedMessages)];
        toast.error(`Validation hatası: ${uniqueMessages.join(", ")}`);
      } else {
        toast.error("Kullanıcı oluşturulurken hata oluştu");
      }
    }
  };

  const handleClose = () => {
    setNewUser({ name: "", email: "", password: "", role: "STUDENT" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        {/* Modal Header */}
        <div className="modal-header-primary px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="modal-header-icon">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Yeni Kullanıcı Oluştur</h2>
                <p className="text-blue-100 text-sm mt-1">
                  Sisteme yeni kullanıcı ekleyin
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="modal-close-btn"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ad Soyad
                </Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  className="mt-1"
                  placeholder="Kullanıcının tam adını girin"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  E-posta
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="mt-1"
                  placeholder="ornek@email.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Şifre
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="mt-1"
                  placeholder="Güçlü bir şifre oluşturun"
                  required
                />
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                  En az 8 karakter, büyük/küçük harf, rakam ve özel karakter içermeli
                </p>
              </div>
              <div>
                <Label htmlFor="role" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rol
                </Label>
                <select
                  id="role"
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value as any })
                  }
                  className="w-full mt-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-colors"
                  required
                >
                  <option value="STUDENT">Öğrenci</option>
                  <option value="TEACHER">Öğretmen</option>
                  <option value="PARENT">Veli</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5">
                  💡
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Rol Açıklamaları</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                    <li><strong>Öğrenci:</strong> Kurslara katılabilir, ödevleri yapabilir</li>
                    <li><strong>Öğretmen:</strong> Kurs oluşturabilir, öğrencileri yönetebilir</li>
                    <li><strong>Veli:</strong> Öğrenci ilerlemesini takip edebilir</li>
                    <li><strong>Admin:</strong> Tüm sistem yönetimi yetkilerine sahiptir</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-600">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="px-6"
              >
                İptal
              </Button>
              <Button type="submit" className="px-6 bg-blue-600 hover:bg-blue-700">
                Oluştur
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}