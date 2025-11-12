# LearnApp API Integration Testing

Bu doküman LearnApp frontend-backend API entegrasyonunu test etmek için oluşturulan kapsamlı test suite'ini açıklar.

## Test Script Özellikleri

### Kapsam
- ✅ Backend health check ve API endpoint'leri
- ✅ Kullanıcı kaydı ve authentication (Admin, Teacher, Student, Parent)
- ✅ Admin kullanıcı yönetimi workflow'u
- ✅ Kurs oluşturma ve öğretmen ataması
- ✅ Teacher workflow (atanan kursları görme, içerik yönetimi)
- ✅ Student workflow (kayıt, ilerleme takibi)
- ✅ Parent workflow (çocuk ilerleme takibi)
- ✅ Error handling ve güvenlik testleri

### Test Edilen API Endpoint'leri

#### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/me` - Mevcut kullanıcı bilgileri

#### User Management (Admin)
- `GET /api/users` - Tüm kullanıcıları listele
- `GET /api/users/:id` - Belirli kullanıcı detayları
- `PUT /api/users/:id` - Kullanıcı güncelleme
- `DELETE /api/users/:id` - Kullanıcı silme

#### Course Management
- `POST /api/courses` - Kurs oluşturma
- `GET /api/courses` - Kurs listesi
- `GET /api/courses/:id` - Kurs detayları
- `POST /api/courses/assign-teacher` - Öğretmen atama
- `GET /api/courses/teacher` - Öğretmenin kursları

#### Section & Lesson Management
- `POST /api/courses/sections` - Bölüm oluşturma
- `POST /api/courses/lessons` - Ders oluşturma

#### Student Enrollment & Progress
- `POST /api/courses/enroll` - Kursa kayıt
- `GET /api/courses/student/:id/enrollments` - Öğrenci kayıtları
- `POST /api/courses/lessons/:id/complete` - Ders tamamlama
- `GET /api/courses/:courseId/progress/:studentId` - İlerleme takibi

## Kullanım

### Ön Koşullar

1. **Backend sunucusunun çalışıyor olması**:
   ```bash
   cd LearnApp/Backend
   npm run dev
   ```

2. **Gerekli dependencies'lerin yüklü olması**:
   ```bash
   cd LearnApp/frontend
   npm install
   ```

### Test Çalıştırma

#### Temel Test
```bash
npm run test:api
```

#### Verbose Mode (Detaylı Loglar)
```bash
npm run test:api:verbose
```

#### Manuel Çalıştırma
```bash
node test-api-integration.js
```

### Konfigürasyon

Test script'i aşağıdaki environment variable'ları destekler:

```bash
# Backend URL (varsayılan: http://localhost:3002)
export BACKEND_URL=http://localhost:3002

# Frontend URL (varsayılan: http://localhost:3000)
export FRONTEND_URL=http://localhost:3000

# Test çalıştırma
npm run test:api
```

## Test Senaryoları

### 1. Health Check Tests
- Backend sunucusunun çalışıp çalışmadığını kontrol eder
- API endpoint'lerinin erişilebilir olduğunu doğrular

### 2. User Registration Tests
- Her rol için (Admin, Teacher, Student, Parent) kullanıcı kaydı
- Mevcut kullanıcılar için login fallback'i
- Token'ların doğru şekilde alındığını doğrular

### 3. Authentication Tests
- Her kullanıcı rolü için JWT token doğrulaması
- `/api/auth/me` endpoint'i ile kullanıcı bilgilerini alma

### 4. Admin User Management Tests
- Admin'in tüm kullanıcıları listeleyebilmesi
- Belirli kullanıcı detaylarına erişim
- Role-based access control doğrulaması

### 5. Course Management Tests
- Admin tarafından kurs oluşturma
- Öğretmen atama
- Bölüm ve ders oluşturma
- Hierarchical content structure testi

### 6. Teacher Workflow Tests
- Öğretmenin atanan kurslarını görme
- Kurs detaylarına erişim
- Content management yetkilerini doğrulama

### 7. Student Workflow Tests
- Kursa kayıt olma
- Kayıtlı kursları listeleme
- Ders tamamlama
- İlerleme takibi

### 8. Parent Workflow Tests
- Çocuğun ilerlemesini görme
- Çocuğun kayıtlı kurslarını listeleme
- Parent-specific access control

### 9. Error Handling Tests
- Unauthorized access (401)
- Invalid token handling
- Non-existent endpoint (404)
- Proper error response format

## Test Çıktısı

Test script'i renkli ve detaylı çıktı sağlar:

```
LearnApp API Integration Test Suite
=====================================

============================================================
  Health Check Tests
============================================================
[2025-01-07T...] Testing backend health endpoint...
[2025-01-07T...] ✓ Backend health check passed
[2025-01-07T...] Testing API info endpoint...
[2025-01-07T...] ✓ API info endpoint passed

============================================================
  User Registration Tests
============================================================
[2025-01-07T...] Registering admin...
[2025-01-07T...] ✓ admin registration successful
...

============================================================
  Test Summary Report
============================================================
Test Configuration:
  Backend URL: http://localhost:3002
  Frontend URL: http://localhost:3000
  Test Timeout: 30000ms
  Retry Count: 3

Test Data Created:
  Users: 4
  Courses: 1
  Sections: 1
  Lessons: 1
  Enrollments: 1

🎉 All tests completed successfully in 15.42s!
```

## Hata Ayıklama

### Yaygın Sorunlar

1. **Backend sunucusu çalışmıyor**:
   ```
   Error: connect ECONNREFUSED 127.0.0.1:3002
   ```
   **Çözüm**: Backend sunucusunu başlatın

2. **Database bağlantı sorunu**:
   ```
   Error: Database connection failed
   ```
   **Çözüm**: PostgreSQL'in çalıştığından ve migration'ların yapıldığından emin olun

3. **Authentication hatası**:
   ```
   Error: 401 Unauthorized
   ```
   **Çözüm**: JWT secret'ların doğru ayarlandığından emin olun

### Debug Mode

Detaylı hata ayıklama için:

```bash
DEBUG=* npm run test:api:verbose
```

## Test Data

Test script'i aşağıdaki test verilerini kullanır:

```javascript
const TEST_DATA = {
  admin: {
    email: 'admin@test.com',
    password: 'admin123',
    name: 'Test Admin',
    role: 'ADMIN'
  },
  teacher: {
    email: 'teacher@test.com',
    password: 'teacher123',
    name: 'Test Teacher',
    role: 'TEACHER'
  },
  // ... diğer roller
};
```

## Genişletme

Yeni test senaryoları eklemek için:

1. `test-api-integration.js` dosyasına yeni test fonksiyonu ekleyin
2. `runTests()` fonksiyonunda yeni testi çağırın
3. Gerekirse `TEST_DATA` objesini güncelleyin

## CI/CD Entegrasyonu

Bu test script'i CI/CD pipeline'ında kullanılabilir:

```yaml
# GitHub Actions örneği
- name: Run API Integration Tests
  run: |
    npm install
    npm run test:api
  env:
    BACKEND_URL: http://localhost:3002
```

## Güvenlik Notları

- Test verileri sadece test ortamında kullanılmalıdır
- Production ortamında bu script'i çalıştırmayın
- Test kullanıcıları test sonrası temizlenmelidir
- Gerçek email adresleri kullanmayın

## Katkıda Bulunma

Test script'ini geliştirmek için:

1. Yeni test senaryoları ekleyin
2. Error handling'i iyileştirin
3. Performance metrics ekleyin
4. Test coverage raporları oluşturun

## Lisans

Bu test script'i LearnApp projesi ile aynı lisans altındadır.