"use client";

import { useState, useMemo, useEffect } from "react";
import { useErrorHandler } from "@/hooks";
import {
  CreateUserModal,
  EditUserModal,
  DeleteUserModal,
  AssignStudentModal,
  UserDetailsModal,
} from "./modals";
import { useUsersQuery } from "@/hooks/useUserQueries";
import { useDebounce } from "@/hooks/useDebounce";
import { User } from "@/types";
import UserPageHeader from "./UserPageHeader";
import UserPageFilters from "./UserPageFilters";
import UserPageTables from "./UserPageTables";

export function UserManagement() {
  const { handleError } = useErrorHandler();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [assigningStudentToParent, setAssigningStudentToParent] =
    useState<User | null>(null);
  const [selectedUserForDetails, setSelectedUserForDetails] =
    useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Debounced search term to prevent excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Query parameters
  const queryParams = useMemo(
    () => ({
      search: debouncedSearchTerm || undefined,
      role: selectedRole === "ALL" ? undefined : selectedRole,
      page: 1,
      limit: 100, // Backend maksimum 100'e izin veriyor
    }),
    [debouncedSearchTerm, selectedRole]
  );

  // React Query hooks
  const {
    data: usersResponse,
    isLoading: loadingUsers,
    error: usersError,
    refetch: refetchUsers,
  } = useUsersQuery(queryParams);

  // Derived state - usersResponse should have items property
  const users = (usersResponse as any)?.items || [];

  const loading = loadingUsers;

  // Show loading only for initial load or when there's no cached data
  const showMainLoading = loading && !usersResponse;

  // Show search loading when searching but we have existing data
  const showSearchLoading = loading && usersResponse && debouncedSearchTerm;

  // Handle errors from React Query
  useEffect(() => {
    if (usersError) {
      handleError(usersError, "Kullanıcılar yüklenirken hata oluştu");
    }
  }, [usersError, handleError]);

  const handleOpenStudentAssignment = (parent: User) => {
    setAssigningStudentToParent(parent);
  };

  const handleShowUserDetails = (user: User) => {
    setSelectedUserForDetails(user);
  };

  // Since we're using backend search, no need for frontend filtering by search
  // Just filter by role if needed (role filtering is instant)
  const filteredUsers = (users || []).filter((user: User) => {
    if (!user) return false;
    const matchesRole = selectedRole === "ALL" || user.role === selectedRole;
    return matchesRole;
  });

  if (showMainLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        <div className="text-lg">Kullanıcılar yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <UserPageHeader setShowCreateModal={setShowCreateModal} />

      {/* Filters */}
      <UserPageFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        showSearchLoading={showSearchLoading}
        loading={loading}
        refetchUsers={refetchUsers}
      />

      {/* Users Table */}
      <UserPageTables
        filteredUsers={filteredUsers}
        handleShowUserDetails={handleShowUserDetails}
        setEditingUser={setEditingUser}
        setUserToDelete={setUserToDelete}
        handleOpenStudentAssignment={handleOpenStudentAssignment}
        debouncedSearchTerm={debouncedSearchTerm}
        showSearchLoading={showSearchLoading}
      />

      <UserDetailsModal
        user={selectedUserForDetails}
        onClose={() => setSelectedUserForDetails(null)}
      />

      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <EditUserModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onUserChange={setEditingUser}
      />

      <DeleteUserModal
        user={userToDelete}
        onClose={() => setUserToDelete(null)}
      />

      <AssignStudentModal
        parent={assigningStudentToParent}
        onClose={() => setAssigningStudentToParent(null)}
      />
    </div>
  );
}
