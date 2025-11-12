# Lesson Focus Mode System

Bu sistem, öğrencilerin ders sayfalarında farklı görünüm modları arasında seçim yapabilmelerini sağlar.

## 🎯 Özellikler

### 1. **İki Farklı Ders Görünümü**
- **Modern Tasarım**: Tam ekran, sinema benzeri deneyim (siyah tema, minimal UI)
- **Klasik Tasarım**: Geleneksel sidebar ve header ile standart layout

### 2. **Admin Kontrollü Sistem**
- Admin panelinden varsayılan mod ayarlanabilir
- Kullanıcıların kendi tercihlerini seçip seçemeyeceği kontrol edilebilir
- Sistem genelinde tutarlı deneyim sağlanabilir

### 3. **Kullanıcı Tercihleri**
- Öğrenciler kendi tercih ettikleri görünümü seçebilir (admin izin verirse)
- Tercihler localStorage'da saklanır
- Anında görünüm değişikliği

## 🏗️ Teknik Yapı

### Modüler Mimari
```
src/
├── hooks/
│   └── useLessonData.ts          # Ortak lesson data hook'u
├── components/lesson/
│   ├── ModernLessonView.tsx      # Modern tasarım component'i
│   ├── ClassicLessonView.tsx     # Klasik tasarım component'i
│   └── LessonFocusModeSelector.tsx # Mod seçici component'i
├── store/
│   └── lessonFocusStore.ts       # Focus mode state management
└── components/admin/
    └── LessonFocusSettings.tsx   # Admin ayarları component'i
```

### Shared Hook (useLessonData)
- Tüm lesson verilerini tek yerden yönetir
- Progress tracking
- Loading states
- Error handling
- Lesson navigation

### Focus Mode Store (Zustand)
```typescript
interface LessonFocusState {
  focusMode: 'modern' | 'classic' | 'auto';
  userPreference: LessonFocusMode | null;
  adminDefaultMode: LessonFocusMode;
  allowUserChoice: boolean;
}
```

## 🚀 Kullanım

### Admin Paneli Ayarları
```tsx
import { LessonFocusSettings } from "@/components/admin/LessonFocusSettings";

// Admin sayfasında
<LessonFocusSettings />
```

### Kullanıcı Mod Seçici
```tsx
import { LessonFocusModeSelector } from "@/components/lesson/LessonFocusModeSelector";

// Header veya toolbar'da
<LessonFocusModeSelector 
  variant="ghost" 
  size="sm" 
  className="custom-styles" 
/>
```

### Lesson Sayfası Entegrasyonu
```tsx
// Ana lesson sayfası
const lessonData = useLessonData(courseId, lessonId);
const { getCurrentMode } = useLessonFocusStore();
const currentMode = getCurrentMode();

return (
  <RoleGuard allowedRoles={["STUDENT"]}>
    {currentMode === 'classic' ? (
      <ClassicLessonView lessonData={lessonData} courseId={courseId} lessonId={lessonId} />
    ) : (
      <ModernLessonView lessonData={lessonData} courseId={courseId} lessonId={lessonId} />
    )}
  </RoleGuard>
);
```

## 🎨 Görünüm Modları

### Modern Tasarım
- **Tam ekran video/içerik alanı**
- **Siyah tema** (sinema deneyimi)
- **Minimal UI** (sadece gerekli kontroller)
- **Sidebar toggle** (isteğe bağlı)
- **Backdrop blur** efektleri

### Klasik Tasarım
- **Geleneksel layout** (header + sidebar + content)
- **Açık tema**
- **Detaylı navigasyon**
- **Progress bar**
- **Mevcut LessonPlayer, LessonSidebar, LessonHeader component'leri**

## 🔧 Konfigürasyon

### Admin Ayarları
1. **Varsayılan Mod**: `modern`, `classic`, veya `auto`
2. **Kullanıcı Seçimi**: Öğrencilerin kendi tercihlerini seçip seçemeyeceği

### Kullanıcı Tercihleri
- **Sistem Varsayılanı**: Admin ayarını kullan
- **Modern**: Her zaman modern tasarım
- **Klasik**: Her zaman klasik tasarım
- **Otomatik**: Admin ayarına göre

## 📱 Responsive Tasarım
- Mobil cihazlarda optimized görünüm
- Tablet ve desktop için farklı layout'lar
- Touch-friendly kontroller

## 🔄 Geçiş Sistemi
- **Anında geçiş**: Sayfa yenilenmeden mod değişikliği
- **Smooth transitions**: CSS animasyonları
- **State preservation**: Progress ve form verileri korunur

## 🎯 Gelecek Geliştirmeler
- [ ] Daha fazla tema seçeneği
- [ ] Kullanıcı özel tema oluşturma
- [ ] A/B testing entegrasyonu
- [ ] Analytics ve kullanım istatistikleri
- [ ] Accessibility improvements

## 🐛 Troubleshooting

### Mod Değişmiyor
- localStorage'ı temizleyin
- Admin ayarlarını kontrol edin
- Browser console'da hata mesajlarını kontrol edin

### Performance Sorunları
- Component lazy loading kullanın
- Gereksiz re-render'ları önleyin
- useMemo ve useCallback kullanın

### Styling Sorunları
- CSS specificity kontrolü yapın
- Theme provider'ı kontrol edin
- Browser compatibility test edin