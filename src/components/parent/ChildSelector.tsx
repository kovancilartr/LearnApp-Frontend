"use client";

import { useState } from "react";
import { Student } from "@/types/auth.types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, User } from "lucide-react";

interface ChildSelectorProps {
  childrenList: Student[];
  selectedChildId?: string;
  onChildSelect: (childId: string) => void;
  loading?: boolean;
}

export function ChildSelector({
  childrenList,
  selectedChildId,
  onChildSelect,
  loading = false,
}: ChildSelectorProps) {
  const selectedChild = childrenList.find(
    (child) => child.id === selectedChildId
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Çocuk Seçimi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (childrenList.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Çocuk Seçimi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">
              Henüz çocuk hesabı bağlanmamış
            </p>
            <p className="text-sm text-gray-400">
              Çocuğunuzun hesabını bağlamak için sistem yöneticisi ile iletişime
              geçin.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Çocuk Seçimi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select value={selectedChildId} onValueChange={onChildSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Bir çocuk seçin" />
            </SelectTrigger>
            <SelectContent>
              {childrenList.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{child.user.name}</span>
                    <span className="text-sm text-gray-500">
                      ({child.user.email})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedChild && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-900">
                    {selectedChild.user.name}
                  </h3>
                  <p className="text-sm text-blue-700">
                    {selectedChild.user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {childrenList.length > 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {childrenList.map((child) => (
                <Button
                  key={child.id}
                  variant={selectedChildId === child.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => onChildSelect(child.id)}
                  className="justify-start"
                >
                  <User className="h-4 w-4 mr-2" />
                  {child.user.name}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
