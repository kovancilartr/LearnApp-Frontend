'use client';

import { useState } from 'react';
import { useErrorHandler } from '@/hooks';
import { 
  useCreateSection, 
  useUpdateSection, 
  useDeleteSection,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson
} from '@/hooks/useCourseQuery';
import { Course, Section, Lesson } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  FileText,
  Video,
  ChevronDown,
  ChevronRight,
  Save,
  X
} from 'lucide-react';

interface TeacherCourseManagementProps {
  course: Course;
}

export function TeacherCourseManagement({ course }: TeacherCourseManagementProps) {
  const { handleError } = useErrorHandler();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
  // Section states
  const [showCreateSection, setShowCreateSection] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [newSection, setNewSection] = useState({ title: '', order: 0 });

  // Lesson states
  const [showCreateLesson, setShowCreateLesson] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [newLesson, setNewLesson] = useState({
    title: '',
    content: '',
    videoUrl: '',
    pdfUrl: '',
    order: 0
  });

  // Mutations
  const createSectionMutation = useCreateSection();
  const updateSectionMutation = useUpdateSection();
  const deleteSectionMutation = useDeleteSection();
  const createLessonMutation = useCreateLesson();
  const updateLessonMutation = useUpdateLesson();
  const deleteLessonMutation = useDeleteLesson();

  // Section handlers
  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSectionMutation.mutateAsync({
        courseId: course.id,
        sectionData: newSection
      });
      setNewSection({ title: '', order: 0 });
      setShowCreateSection(false);
    } catch (error) {
      handleError(error, 'Bölüm oluşturulurken hata oluştu');
    }
  };

  const handleUpdateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;

    try {
      await updateSectionMutation.mutateAsync({
        sectionId: editingSection.id,
        updates: {
          title: editingSection.title,
          order: editingSection.order
        }
      });
      setEditingSection(null);
    } catch (error) {
      handleError(error, 'Bölüm güncellenirken hata oluştu');
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Bu bölümü silmek istediğinizden emin misiniz?')) return;

    try {
      await deleteSectionMutation.mutateAsync(sectionId);
    } catch (error) {
      handleError(error, 'Bölüm silinirken hata oluştu');
    }
  };

  // Lesson handlers
  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCreateLesson) return;

    try {
      await createLessonMutation.mutateAsync({
        sectionId: showCreateLesson,
        lessonData: newLesson
      });
      setNewLesson({
        title: '',
        content: '',
        videoUrl: '',
        pdfUrl: '',
        order: 0
      });
      setShowCreateLesson(null);
    } catch (error) {
      handleError(error, 'Ders oluşturulurken hata oluştu');
    }
  };

  const handleUpdateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson) return;

    try {
      await updateLessonMutation.mutateAsync({
        lessonId: editingLesson.id,
        updates: {
          title: editingLesson.title,
          content: editingLesson.content,
          videoUrl: editingLesson.videoUrl,
          pdfUrl: editingLesson.pdfUrl,
          order: editingLesson.order
        }
      });
      setEditingLesson(null);
    } catch (error) {
      handleError(error, 'Ders güncellenirken hata oluştu');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Bu dersi silmek istediğinizden emin misiniz?')) return;

    try {
      await deleteLessonMutation.mutateAsync(lessonId);
    } catch (error) {
      handleError(error, 'Ders silinirken hata oluştu');
    }
  };

  const toggleSectionExpansion = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Kurs İçeriği</h2>
        </div>
        <Button 
          onClick={() => setShowCreateSection(true)}
          disabled={createSectionMutation.isPending}
        >
          <Plus className="h-4 w-4 mr-2" />
          Bölüm Ekle
        </Button>
      </div>

      {/* Create Section Form */}
      {showCreateSection && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Yeni Bölüm Oluştur</h3>
          <form onSubmit={handleCreateSection} className="space-y-4">
            <div>
              <Label htmlFor="section-title">Bölüm Başlığı</Label>
              <Input
                id="section-title"
                value={newSection.title}
                onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                required
                placeholder="Bölüm başlığını girin..."
              />
            </div>
            <div>
              <Label htmlFor="section-order">Sıra</Label>
              <Input
                id="section-order"
                type="number"
                value={newSection.order}
                onChange={(e) => setNewSection({ ...newSection, order: parseInt(e.target.value) || 0 })}
                min="0"
                placeholder="Bölüm sırası (0 = otomatik)"
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                type="submit" 
                disabled={createSectionMutation.isPending}
              >
                {createSectionMutation.isPending ? 'Oluşturuluyor...' : 'Oluştur'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateSection(false)}
              >
                İptal
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Edit Section Form */}
      {editingSection && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Bölüm Düzenle</h3>
          <form onSubmit={handleUpdateSection} className="space-y-4">
            <div>
              <Label htmlFor="edit-section-title">Bölüm Başlığı</Label>
              <Input
                id="edit-section-title"
                value={editingSection.title}
                onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-section-order">Sıra</Label>
              <Input
                id="edit-section-order"
                type="number"
                value={editingSection.order}
                onChange={(e) => setEditingSection({ ...editingSection, order: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                type="submit" 
                disabled={updateSectionMutation.isPending}
              >
                {updateSectionMutation.isPending ? 'Güncelleniyor...' : 'Güncelle'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditingSection(null)}
              >
                İptal
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Create Lesson Form */}
      {showCreateLesson && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Yeni Ders Oluştur</h3>
          <form onSubmit={handleCreateLesson} className="space-y-4">
            <div>
              <Label htmlFor="lesson-title">Ders Başlığı</Label>
              <Input
                id="lesson-title"
                value={newLesson.title}
                onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                required
                placeholder="Ders başlığını girin..."
              />
            </div>
            <div>
              <Label htmlFor="lesson-content">İçerik</Label>
              <Textarea
                id="lesson-content"
                value={newLesson.content}
                onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
                className="min-h-[100px]"
                placeholder="Ders içeriğini girin..."
              />
            </div>
            <div>
              <Label htmlFor="lesson-video">Video URL (YouTube)</Label>
              <Input
                id="lesson-video"
                value={newLesson.videoUrl}
                onChange={(e) => setNewLesson({ ...newLesson, videoUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            <div>
              <Label htmlFor="lesson-pdf">PDF URL</Label>
              <Input
                id="lesson-pdf"
                value={newLesson.pdfUrl}
                onChange={(e) => setNewLesson({ ...newLesson, pdfUrl: e.target.value })}
                placeholder="PDF dosyası URL'si..."
              />
            </div>
            <div>
              <Label htmlFor="lesson-order">Sıra</Label>
              <Input
                id="lesson-order"
                type="number"
                value={newLesson.order}
                onChange={(e) => setNewLesson({ ...newLesson, order: parseInt(e.target.value) || 0 })}
                min="0"
                placeholder="Ders sırası (0 = otomatik)"
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                type="submit" 
                disabled={createLessonMutation.isPending}
              >
                {createLessonMutation.isPending ? 'Oluşturuluyor...' : 'Oluştur'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateLesson(null)}
              >
                İptal
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Edit Lesson Form */}
      {editingLesson && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Ders Düzenle</h3>
          <form onSubmit={handleUpdateLesson} className="space-y-4">
            <div>
              <Label htmlFor="edit-lesson-title">Ders Başlığı</Label>
              <Input
                id="edit-lesson-title"
                value={editingLesson.title}
                onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-lesson-content">İçerik</Label>
              <Textarea
                id="edit-lesson-content"
                value={editingLesson.content || ''}
                onChange={(e) => setEditingLesson({ ...editingLesson, content: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
            <div>
              <Label htmlFor="edit-lesson-video">Video URL (YouTube)</Label>
              <Input
                id="edit-lesson-video"
                value={editingLesson.videoUrl || ''}
                onChange={(e) => setEditingLesson({ ...editingLesson, videoUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            <div>
              <Label htmlFor="edit-lesson-pdf">PDF URL</Label>
              <Input
                id="edit-lesson-pdf"
                value={editingLesson.pdfUrl || ''}
                onChange={(e) => setEditingLesson({ ...editingLesson, pdfUrl: e.target.value })}
                placeholder="PDF dosyası URL'si..."
              />
            </div>
            <div>
              <Label htmlFor="edit-lesson-order">Sıra</Label>
              <Input
                id="edit-lesson-order"
                type="number"
                value={editingLesson.order}
                onChange={(e) => setEditingLesson({ ...editingLesson, order: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                type="submit" 
                disabled={updateLessonMutation.isPending}
              >
                {updateLessonMutation.isPending ? 'Güncelleniyor...' : 'Güncelle'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditingLesson(null)}
              >
                İptal
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Sections List */}
      <div className="space-y-4">
        {course.sections && course.sections.length > 0 ? (
          course.sections.map((section) => (
            <Card key={section.id} className="overflow-hidden">
              {/* Section Header */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSectionExpansion(section.id)}
                    >
                      {expandedSections.has(section.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{section.title}</h4>
                      <p className="text-sm text-gray-600">
                        {section.lessons?.length || 0} ders
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowCreateLesson(section.id)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ders Ekle
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingSection(section)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteSection(section.id)}
                      className="text-red-600 hover:text-red-700"
                      disabled={deleteSectionMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Expanded Section Content */}
              {expandedSections.has(section.id) && (
                <div className="p-4">
                  {section.lessons && section.lessons.length > 0 ? (
                    <div className="space-y-3">
                      {section.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Video className="h-4 w-4 text-green-600" />
                            <div>
                              <h5 className="font-medium text-gray-900">{lesson.title}</h5>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                {lesson.videoUrl && (
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Video</span>
                                )}
                                {lesson.pdfUrl && (
                                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded">PDF</span>
                                )}
                                {lesson.content && (
                                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">İçerik</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingLesson(lesson)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteLesson(lesson.id)}
                              className="text-red-600 hover:text-red-700"
                              disabled={deleteLessonMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Video className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>Bu bölümde henüz ders yok</p>
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() => setShowCreateLesson(section.id)}
                      >
                        İlk Dersi Ekle
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))
        ) : (
          <Card className="p-8">
            <div className="text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Henüz bölüm eklenmemiş</p>
              <p className="mb-4">Kursunuza içerik eklemek için ilk bölümü oluşturun.</p>
              <Button onClick={() => setShowCreateSection(true)}>
                <Plus className="h-4 w-4 mr-2" />
                İlk Bölümü Ekle
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}