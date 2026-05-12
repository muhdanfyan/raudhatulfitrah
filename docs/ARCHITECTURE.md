# Architecture & Deployment - Pesantren Teknologi

## VPS Paths

| Environment | Frontend | Backend |
|-------------|----------|---------|
| **Production** | `/var/www/pondokinformatika.id` | `/var/www/api.pondokinformatika.id` |
| **Development** | `/var/www/dev.pondokinformatika.id` | `/var/www/api-dev.pondokinformatika.id` |

---

## DEPLOYMENT WORKFLOW

### 1. Production (Automated)
Push ke branch `main` akan otomatis men-trigger deployment ke:
- **Frontend**: `pondokinformatika.id` (via GitHub Actions `deploy-production.yml`)
- **Backend**: `api.pondokinformatika.id` (via GitHub Actions `deploy-production.yml`)

### 2. Development (Manual)
Untuk update development environment (`dev.` dan `api-dev.`):
```bash
# Frontend
npm run deploy:pondok-dev

# Backend
# SSH ke VPS dan git pull di /var/www/api-dev.pondokinformatika.id
```

### 3. Netlify (Partial Auto)
Frontend `pesantrenteknologi.netlify.app` juga otomatis deploy dari `main` jika terhubung ke Netlify.

---

## MULTI-TENANT ARCHITECTURE

### Cara Kerja

```
┌─────────────────────────┐     ┌─────────────────────────┐
│ pesantrenteknologi      │     │ pisantriv2 (PROD)       │
│ (Netlify)               │     │ (pondokinformatika.id)  │
│ X-Tenant-ID: pestek     │     │ X-Tenant-ID: default    │
└───────────┬─────────────┘     └───────────┬─────────────┘
            │                               │
            └────────────┬──────────────────┘
                         ▼
            ┌─────────────────────────┐
            │ Shared Backend API      │
            │ api.pondokinformatika.id│
            │                         │
            │ TenantMiddleware        │
            │ ├── Switch DB           │
            │ └── Switch Cloudinary   │
            └───────────┬─────────────┘
                        ▼
            ┌─────────────────────────┐
            │ pestek DB | pisantri DB │
            └─────────────────────────┘
```

*Note: Struktur Development sama persis, hanya domainnya `dev.` dan `api-dev.`*

---

## CLOUDINARY ASSET MANAGEMENT

### Best Practice: Image URLs
Gunakan helper `getStudentPhotoUrl` untuk menampilkan foto santri. Helper ini otomatis menangani:
1. Foto lokal (path file).
2. Foto Cloudinary (public ID).
3. Fallback avatar (ui-avatars.com).

```typescript
import { getStudentPhotoUrl } from '../utils/imageUtils';

<img src={getStudentPhotoUrl(santri.foto_santri, fallbackUrl)} />
```

### Upload Assets ke Cloudinary
Gunakan script `upload-assets.js` untuk upload manual jika perlu.
