import { Button } from "@/components/ui/button";
import { UserPlus, Users } from "lucide-react";
import React from "react";

interface UserPageHeaderProps {
  setShowCreateModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const UserPageHeader = ({ setShowCreateModal }: UserPageHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Users className="h-8 w-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Kullanıcı Yönetimi
        </h1>
      </div>
      <Button
        onClick={() => setShowCreateModal(true)}
        className="flex items-center space-x-2"
      >
        <UserPlus className="h-4 w-4" />
        <span>Yeni Kullanıcı Ekle</span>
      </Button>
    </div>
  );
};

export default UserPageHeader;
