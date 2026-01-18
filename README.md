# Tachyon

Tachyon, **Bun tabanlı bir monorepo** yapısında geliştirilmiş;  
backend, frontend ve ortak database katmanlarını tek çatı altında toplayan bir uygulamadır.

Monorepo yapısı **Bun workspaces** ile yönetilir.

---

## Gereksinimler

- **Bun** (zorunlu)
- **Node.js** (tooling için, Bun ile birlikte)
- **PostgreSQL** (veya Prisma destekli bir DB)

> Proje Node yerine Bun runtime’ını hedefler.

---

## Proje Yapısı

```

.
├── apps/
│   ├── backend/        # Backend uygulaması (API, seed, auth, business logic)
│   └── frontend/       # Frontend uygulaması (Nuxt + shadcn/ui)
│
├── packages/
│   ├── database/       # Prisma schema + database client
│   └── config/         # Ortak config / typescript ayarları
│
├── package.json        # Root scripts & workspace config
└── bun.lock

```

---

## Kurulum

```bash
bun install
```

---

## Database

### Prisma client üretme

```bash
bun run db:generate
```

### Database schema push

```bash
bun run db:push
```

### Seed çalıştırma

```bash
bun run db:seed
```

---

## Geliştirme Ortamı

### Backend

```bash
bun run backend:dev
```

- Watch modunda çalışır
- Entry: `apps/backend/src/main.ts`

### Frontend

```bash
bun run frontend:dev
```

- Nuxt dev server
- Uygulama `apps/frontend` altında çalışır

---

## Lint

### Backend

```bash
bun run backend:lint
```

### Frontend

```bash
bun run frontend:lint
```

---

## Build & Hazırlık

### Backend

Backend Bun runtime hedeflediği için ayrı bir build adımı zorunlu değildir.
Production ortamında direkt entry dosyası çalıştırılabilir.

### Frontend

```bash
cd apps/frontend
bun run build
```

> Nuxt build çıktıları frontend dizini altında oluşur.

---

## Deploy

### Genel Akış

1. Environment değişkenlerini ayarla
2. Database migration / push
3. Backend’i Bun ile ayağa kaldır
4. Frontend build çıktısını deploy et

Örnek backend çalıştırma:

```bash
bun run apps/backend/src/main.ts
```

Frontend deploy yöntemi kullanılan platforma göre değişir
(Vercel, Node server, static output vs.).

---

## Notlar

- UI tarafı **shadcn/ui** kullanır ve bileşenler bilinçli olarak repo içindedir.
- Prisma generated dosyalar repo dışıdır, her ortamda yeniden üretilir.
- Proje **private** ve internal kullanım odaklıdır.

---
