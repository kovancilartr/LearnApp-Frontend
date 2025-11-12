import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Plus } from "lucide-react";

interface EmptyStateProps {
  onCreateCourse: () => void;
}

export function EmptyState({ onCreateCourse }: EmptyStateProps) {
  return (
    <Card className="p-12 text-center">
      <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Henüz kurs bulunmuyor
      </h3>
      <p className="text-gray-500 mb-6">İlk kursunuzu oluşturarak başlayın</p>
      <Button onClick={onCreateCourse}>
        <Plus className="h-4 w-4 mr-2" />
        İlk Kursunuzu Oluşturun
      </Button>
    </Card>
  );
}
