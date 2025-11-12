import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User } from "@/types";
import { getRoleColor, getRoleText } from "@/types/user.types";
import { Edit, Trash2, UserPlus, Users } from "lucide-react";
import React from "react";

interface UserPageTablesProps {
  filteredUsers: User[];
  handleShowUserDetails: (user: User) => void;
  setEditingUser: (user: User) => void;
  setUserToDelete: (user: User) => void;
  handleOpenStudentAssignment: (parent: User) => void;
  debouncedSearchTerm: string;
  showSearchLoading: boolean;
}

const UserPageTables = ({
  filteredUsers,
  handleShowUserDetails,
  setEditingUser,
  setUserToDelete,
  handleOpenStudentAssignment,
  debouncedSearchTerm,
  showSearchLoading,
}: UserPageTablesProps) => {
  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Kullanıcılar ({filteredUsers.length})
            {debouncedSearchTerm && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                - "{debouncedSearchTerm}" için sonuçlar
              </span>
            )}
          </h2>
          {showSearchLoading && (
            <div className="flex items-center text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600 mr-2"></div>
              Aranıyor...
            </div>
          )}
        </div>
        <div className="overflow-x-auto relative">
          {showSearchLoading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
                <span className="text-sm text-gray-600">Aranıyor...</span>
              </div>
            </div>
          )}
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Ad Soyad</th>
                <th className="text-left py-3 px-4">E-posta</th>
                <th className="text-left py-3 px-4">Rol</th>
                <th className="text-left py-3 px-4">Kayıt Tarihi</th>
                <th className="text-left py-3 px-4">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user: User) => (
                <tr
                  key={user?.id || Math.random()}
                  className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => handleShowUserDetails(user)}
                >
                  <td className="py-3 px-4 font-medium">
                    {user?.name || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                    {user?.email || "N/A"}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                        user?.role || ""
                      )}`}
                    >
                      {getRoleText(user?.role || "")}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("tr-TR")
                      : "N/A"}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingUser(user);
                        }}
                        disabled={!user?.id}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {user?.role === "PARENT" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenStudentAssignment(user);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                          disabled={!user?.id}
                          title="Öğrenci Ata"
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUserToDelete(user);
                        }}
                        className="text-red-600 hover:text-red-700"
                        disabled={!user?.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {debouncedSearchTerm
                  ? "Arama sonucu bulunamadı"
                  : "Henüz kullanıcı yok"}
              </h3>
              <p className="text-gray-500">
                {debouncedSearchTerm
                  ? `"${debouncedSearchTerm}" için sonuç bulunamadı. Farklı bir arama terimi deneyin.`
                  : "Yeni kullanıcı eklemek için yukarıdaki butonu kullanın."}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default UserPageTables;
