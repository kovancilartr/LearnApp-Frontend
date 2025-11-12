"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "react-hot-toast";
import { useLessonFocusStore, LessonFocusMode } from "@/store/lessonFocusStore";
import { Monitor, Palette, Zap, Settings } from "lucide-react";

export function LessonFocusSettings() {
  const {
    adminDefaultMode,
    allowUserChoice,
    setAdminSettings,
  } = useLessonFocusStore();

  const [defaultMode, setDefaultMode] = useState<LessonFocusMode>(adminDefaultMode);
  const [userChoice, setUserChoice] = useState(allowUserChoice);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Update the store
      setAdminSettings(defaultMode, userChoice);
      
      // Here you would typically also save to your backend
      // await adminService.updateLessonFocusSettings({ defaultMode, allowUserChoice: userChoice });
      
      toast.success("Ders görünüm ayarları başarıyla güncellendi!");
    } catch (error) {
      console.error("Error saving lesson focus settings:", error);
      toast.error("Ayarlar kaydedilirken bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  const modeOptions = [
    {
      value: 'modern' as LessonFocusMode,
      label: 'Modern Tasarım',
      description: 'Tam ekran, sinema benzeri deneyim',
      icon: Monitor,
    },
    {
      value: 'classic' as LessonFocusMode,
      label: 'Klasik Tasarım',
      description: 'Geleneksel sidebar ve header ile',
      icon: Palette,
    },
    {
      value: 'auto' as LessonFocusMode,
      label: 'Otomatik',
      description: 'Sistem varsayılanını kullan',
      icon: Zap,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Ders Görünüm Ayarları
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Default Mode Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Varsayılan Ders Görünümü</Label>
          <RadioGroup
            value={defaultMode}
            onValueChange={(value) => setDefaultMode(value as LessonFocusMode)}
            className="space-y-3"
          >
            {modeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div key={option.value} className="flex items-center space-x-3">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <div className="flex items-center space-x-3 flex-1">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <Label htmlFor={option.value} className="font-medium cursor-pointer">
                        {option.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        {/* User Choice Toggle */}
        <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
          <div className="space-y-1">
            <Label htmlFor="user-choice" className="text-base font-medium">
              Kullanıcı Seçimine İzin Ver
            </Label>
            <p className="text-sm text-muted-foreground">
              Öğrencilerin kendi tercih ettikleri görünümü seçmelerine izin verir
            </p>
          </div>
          <Switch
            id="user-choice"
            checked={userChoice}
            onCheckedChange={setUserChoice}
          />
        </div>

        {/* Current Settings Preview */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Mevcut Ayarlar</h4>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">Varsayılan Mod:</span>{" "}
              {modeOptions.find(opt => opt.value === adminDefaultMode)?.label}
            </p>
            <p>
              <span className="font-medium">Kullanıcı Seçimi:</span>{" "}
              {allowUserChoice ? "İzin veriliyor" : "İzin verilmiyor"}
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="min-w-[120px]"
          >
            {isSaving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}