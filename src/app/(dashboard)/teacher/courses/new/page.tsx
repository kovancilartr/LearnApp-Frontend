"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RoleGuard } from "@/components/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCourse } from "@/hooks/useCourseQuery";
import { useErrorHandler } from "@/hooks";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewCoursePage() {
  const router = useRouter();
  const { handleError } = useErrorHandler();
  const createCourseMutation = useCreateCourse();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Kurs başlığı gereklidir";
    } else if (formData.title.length < 3) {
      newErrors.title = "Kurs başlığı en az 3 karakter olmalıdır";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Açıklama en fazla 500 karakter olabilir";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const course = await createCourseMutation.mutateAsync({
        title: formData.title.trim(),
        description: formData.description.trim() || '',
      });

      router.push(`/dashboard/teacher/courses/${course.id}`);
    } catch (error) {
      handleError(error, "Kurs oluşturulurken bir hata oluştu");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <RoleGuard allowedRoles={["TEACHER"]}>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/teacher/courses">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Yeni Kurs Oluştur
            </h2>
            <p className="text-muted-foreground">
              Öğrencileriniz için yeni bir kurs oluşturun
            </p>
          </div>
        </div>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Kurs Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Kurs Başlığı <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Örn: React ile Web Geliştirme"
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Kurs Açıklaması</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Kursunuz hakkında kısa bir açıklama yazın..."
                    rows={4}
                    className={errors.description ? "border-red-500" : ""}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    {errors.description && (
                      <p className="text-red-500">{errors.description}</p>
                    )}
                    <p className="ml-auto">{formData.description.length}/500</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Link href="/dashboard/teacher/courses">
                    <Button type="button" variant="outline">
                      İptal
                    </Button>
                  </Link>
                  <Button type="submit" disabled={createCourseMutation.isPending}>
                    {createCourseMutation.isPending ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Oluşturuluyor...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Kursu Oluştur
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
