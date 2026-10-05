# Şeker Yatırım Full-Stack Yönetim Sistemi

Bu proje, yatırım müşterilerini, müşteri hesaplarını, sözleşmelerini ve halka arz (IPO) işlemlerini yönetmek için geliştirilmiş kapsamlı bir **Full-Stack (Uçtan Uca) Web Uygulamasıdır**. 

Modern mimari prensipleri benimsenerek geliştirilen projede, sunucu tarafında (Backend) **Java Spring Boot**, istemci tarafında (Frontend) ise **Next.js** kullanılmıştır. Veritabanı olarak **Microsoft SQL Server (MSSQL)** tercih edilmiştir.

---

## 🚀 Projenin Kapsamı ve İşlevleri (Özellikler)

Bu sistem temel olarak şu modüllerden oluşmaktadır:

1. **Müşteri Yönetimi (`Customers`)**: Sistemdeki yatırımcı müşterilerin temel bilgilerinin (ad, soyad, TCKN vb.) kaydedilmesi, güncellenmesi ve listelenmesi.
2. **Müşteri Hesapları Yönetimi (`Accounts`)**: Yatırımcılara ait vadesiz, yatırım veya portföy hesaplarının takibi ve yönetimi.
3. **Müşteri Adres Yönetimi (`Addresses`)**: Müşterilerin iletişim ve ikametgah adreslerinin sisteme tanımlanması.
4. **Sözleşme Yönetimi (`Contracts`)**: Müşterilerle imzalanan yasal belgelerin ve yatırım sözleşmelerinin takibi.
5. **Halka Arz (IPO) İzahname Onayları (`IPO Approvals`)**: Halka arz süreçlerine katılan müşterilerin izahname ve talep formlarına verdikleri onayların dijital ortamda saklanması.
6. **Çalışma Saatleri (`Business Hours`)**: Kurumun ve şubelerin çalışma saatleri, resmi tatil gibi iş akışını etkileyen takvim parametrelerinin yönetimi.

---

## 🛠 Teknoloji Yığını (Tech Stack)

### Backend (Sunucu Tarafı)
- **Dil:** Java 21
- **Framework:** Spring Boot 3 / 4.1.1
- **Veri Erişim:** Spring Data JPA / Hibernate
- **Veritabanı:** Microsoft SQL Server (MSSQL)
- **Dokümantasyon:** Springdoc OpenAPI (Swagger UI)
- **Araçlar:** Maven, Lombok

### Frontend (İstemci Tarafı)
- **Framework:** Next.js (App Router yapısı)
- **Kütüphane:** React 19
- **Dil:** TypeScript
- **Stil ve Arayüz:** Chakra UI, Tailwind CSS
- **Durum Yönetimi (State Management):** Redux Toolkit
- **Animasyon & Grafikler:** Framer Motion, Recharts
- **İkonlar:** React Icons

---

## 💻 Sıfır Bir Bilgisayara Kurulum (Gereksinimler)

Bu projeyi daha önce hiç geliştirme yapılmamış, temiz bir bilgisayarda (Windows/Mac/Linux) ayağa kaldırmak için aşağıdaki yazılımların sisteme kurulması gerekmektedir:

1. **Java Development Kit (JDK) 21:** [Oracle JDK 21](https://www.oracle.com/java/technologies/downloads/#java21) veya [OpenJDK 21](https://adoptium.net/) indirip kurun. Sistem `JAVA_HOME` ortam değişkeninin ayarlandığından emin olun.
2. **Node.js (v20 veya üzeri):** [Node.js Resmi Sitesinden](https://nodejs.org/) LTS sürümünü kurun. Kurulumla birlikte `npm` de yüklenecektir.
3. **Microsoft SQL Server:** 
   - [SQL Server Developer Edition](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) indirip kurun.
   - Veritabanı yönetimi için [SQL Server Management Studio (SSMS)](https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms) kurmanız tavsiye edilir.
4. **Git:** Kaynak kodları indirmek/yönetmek için [Git](https://git-scm.com/) kurun.
5. **IDE (Geliştirme Ortamı):**
   - Backend için: IntelliJ IDEA, Eclipse veya VS Code.
   - Frontend için: Visual Studio Code (VS Code).

---

## ⚙️ Kurulum ve Çalıştırma Adımları

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları sırasıyla uygulayın.

### 1. Adım: Veritabanı (MSSQL) Hazırlığı
1. SQL Server'ı başlatın ve SSMS üzerinden veritabanına bağlanın (Genellikle `localhost` veya `.\SQLEXPRESS`).
2. Proje için yeni bir veritabanı oluşturun.
   ```sql
   CREATE DATABASE app_db;
   ```
3. Backend konfigürasyon dosyasında (`backend/src/main/resources/application.yaml`) yer alan bilgilerin SQL Server bilgilerinizle eşleştiğinden emin olun:
   - **URL:** `jdbc:sqlserver://localhost:1433;databaseName=app_db;encrypt=false;trustServerCertificate=true`
   - **Username:** `sa` (veya kendi belirlediğiniz kullanıcı adı)
   - **Password:** `StrongPass123!` (kendi şifreniz ile değiştirin)

*Not: Spring Data JPA (Hibernate) `ddl-auto: update` modunda olduğu için, uygulama ilk çalıştığında gerekli tüm tabloları veritabanında otomatik olarak oluşturacaktır.*

### 2. Adım: Backend (Spring Boot) Kurulumu ve Çalıştırılması
1. Terminal veya komut istemcisini açın ve projenin `backend` dizinine gidin.
   ```bash
   cd backend
   ```
2. Maven sarmalayıcısı (wrapper) ile gerekli kütüphaneleri indirin ve projeyi derleyin (Bilgisayara önceden Maven kurmanıza gerek yoktur, `mvnw` dosyası halleder).
   ```bash
   # Windows için:
   mvnw.cmd clean install
   
   # Mac/Linux için:
   ./mvnw clean install
   ```
3. Spring Boot uygulamasını başlatın.
   ```bash
   # Windows için:
   mvnw.cmd spring-boot:run
   
   # Mac/Linux için:
   ./mvnw spring-boot:run
   ```
4. Backend başarılı bir şekilde ayağa kalktıktan sonra, API dokümantasyonuna (Swagger UI) tarayıcınızdan şu adresle erişebilirsiniz:
   👉 **http://localhost:8080/swagger-ui.html**

### 3. Adım: Frontend (Next.js) Kurulumu ve Çalıştırılması
1. Yeni bir terminal sekmesi açın ve projenin `frontend` dizinine gidin.
   ```bash
   cd frontend
   ```
2. Gerekli NPM paketlerini ve bağımlılıkları indirin.
   ```bash
   npm install
   ```
3. Geliştirme (development) sunucusunu başlatın.
   ```bash
   npm run dev
   ```
4. Uygulama başarılı bir şekilde derlendikten sonra, tarayıcınızdan şu adrese giderek arayüze erişebilirsiniz:
   👉 **http://localhost:3000**

---

## 📂 Proje Dizin Yapısı

```text
seker-yatirim-fullstack/
├── backend/                       # Spring Boot Sunucu Klasörü
│   ├── src/main/java/...          # Java kaynak kodları (Controller, Service, Repository, Entity)
│   ├── src/main/resources/        # Konfigürasyonlar (application.yaml vb.)
│   └── pom.xml                    # Maven bağımlılık dosyası
├── frontend/                      # Next.js İstemci Klasörü
│   ├── src/app/                   # Sayfalar ve Routing (accounts, customers, contracts vb.)
│   ├── package.json               # Node.js bağımlılık dosyası
│   ├── tailwind.config.ts         # Tailwind stil konfigürasyonları
│   └── tsconfig.json              # TypeScript yapılandırması
└── README.md                      # Proje genel dokümantasyonu (Bu dosya)
```

## 🤝 Katkıda Bulunma ve Geliştirme Süreci
- Backend üzerinde yeni bir tablo veya iş akışı ekleneceğinde sırasıyla `Entity` -> `Repository` -> `Service` -> `Controller` adımları izlenerek geliştirme yapılmalıdır.
- Frontend tarafında sayfalar `src/app/klasor-adi/page.tsx` formatında oluşturulmuş olup, Next.js'in *App Router* standartlarına sadık kalınmalıdır.
