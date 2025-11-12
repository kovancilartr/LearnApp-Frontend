import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { userKeys } from "@/hooks/useUserQueries";
import { useQueryClient } from "@tanstack/react-query";
import { Filter, Search } from "lucide-react";
import React from "react";
import toast from "react-hot-toast";

interface UserPageFiltersProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  selectedRole: string;
  setSelectedRole: React.Dispatch<React.SetStateAction<string>>;
  showSearchLoading: boolean;
  loading: boolean;
  refetchUsers: () => any;
}

const UserPageFilters = ({
  searchTerm,
  setSearchTerm,
  selectedRole,
  setSelectedRole,
  showSearchLoading,
  loading,
  refetchUsers,
}: UserPageFiltersProps) => {
  const queryClient = useQueryClient();

  return (
    <Card className="p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            {showSearchLoading ? (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
            ) : (
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            )}
            <Input
              placeholder="Kullanıcı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center space-x-2 min-w-0">
            <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full sm:min-w-[140px] border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
            >
              <option value="ALL">Tüm Roller</option>
              <option value="ADMIN">Admin</option>
              <option value="TEACHER">Öğretmen</option>
              <option value="STUDENT">Öğrenci</option>
              <option value="PARENT">Veli</option>
            </select>
          </div>
          <Button
            onClick={async () => {
              const refreshToast = toast.loading("Veriler yenileniyor...");

              try {
                // Tüm kullanıcı verilerini cache'den temizle ve yeniden yükle
                queryClient.invalidateQueries({ queryKey: userKeys.all });
                await refetchUsers();

                toast.dismiss(refreshToast);
                toast.success("Veriler başarıyla yenilendi!");
              } catch (error) {
                console.error(error);
                toast.dismiss(refreshToast);
                toast.error("Veriler yenilenirken hata oluştu");
              }
            }}
            variant="outline"
            className="flex items-center justify-center space-x-2 px-4 py-2 w-full sm:w-auto"
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
            ) : (
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            )}
            <span>Yenile</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default UserPageFilters;
