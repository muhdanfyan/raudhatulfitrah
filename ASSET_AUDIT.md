# Asset Audit: File Tidak Dinamis Saat Cloning

> **Last Updated:** 8 Januari 2026
> **Repository:** pesantrenteknologi / pisantriv2
> **Status:** 🟡 Migration to Cloudinary in progress (Pejabat Panel squares implemented)

---

## 📋 Summary

Berikut adalah **file-file yang TIDAK akan otomatis berubah** saat cloning pesantren baru dan **HARUS diganti manual**:

---

## 🔴 CRITICAL - Wajib Diganti

### 1. **index.html** - Semua Meta Tags & SEO
**File:** `/public/index.html`

**Hardcoded Content:**
- ✅ Favicon: `<link rel="icon" href="/logo.png" />`
- 🔴 Title: `"Pondok Informatika - Pesantren IT Modern & Sekolah IT Indonesia Timur"`
- 🔴 Description: Semua meta description tentang Pondok Informatika
- 🔴 Keywords: `"pondok informatika, pesantren IT, ..."` 
- 🔴 Canonical URL: `https://pondokinformatika.id/`
- 🔴 OG Image: `https://pondokinformatika.id/og-image.png`
- 🔴 OG URL: `https://pondokinformatika.id/`
- 🔴 Twitter Card: Semua meta twitter tentang Pondok Informatika
- 🔴 Structured Data (JSON-LD):
  - Organization name: "Pondok Informatika"
  - Logo URL: `https://pondokinformatika.id/logo.png`
  - Website URL: `https://pondokinformatika.id`
- ⚪ Google Analytics ID: `G-M2ZCTEJW6F` (Optional - bisa tetap sama atau ganti manual)
- ✅ Preconnect: `https://api-dev.pondokinformatika.id` (Shared API - tidak perlu ganti)

**Impact:** ⚠️ **HIGH** - SEO, social sharing, branding (GA optional)

---

### 2. **sitemap.xml** - All URLs Hardcoded
**File:** `/public/sitemap.xml`

**Hardcoded Content:**
```xml
<loc>https://pondokinformatika.id/</loc>
<loc>https://pondokinformatika.id/ppdb</loc>
<loc>https://pondokinformatika.id/tulisan</loc>
<loc>https://pondokinformatika.id/digitalisasi-pesantren</loc>
<loc>https://pondokinformatika.id/login</loc>
```

**Impact:** ⚠️ **HIGH** - SEO, search engine indexing

---

### 3. **robots.txt** - Domain & Sitemap URL
**File:** `/public/robots.txt`

**Hardcoded Content:**
```
# Robots.txt for Pondok Informatika
# https://pondokinformatika.id
Sitemap: https://pondokinformatika.id/sitemap.xml
```

**Impact:** ⚠️ **MEDIUM** - SEO crawler directives

---

### 4. **.env.development** - Tenant ID (Sudah Dynamic)
**File:** `/.env.development`

**Current Content:**
```
VITE_API_URL=https://api-dev.pondokinformatika.id  # ✅ Shared API
VITE_APP_NAME=Pesantren Teknologi                   # Manual update
VITE_TENANT_ID=pestek                               # ✅ Routing handled
```

**Impact:** ✅ **HANDLED** - VITE_TENANT_ID sudah handle multi-tenant routing

---

## 🔴 CRITICAL - Store in Cloudinary (Per-Tenant Assets)

### 5. **Logo & Brand Images** - Store in Cloudinary
**Current Location:** `/public/` (static)
**Recommended:** Cloudinary per-tenant folder

**Files to Upload:**
- `logo.png` → `cloudinary://{{tenant_id}}/branding/logo.png`
- `og-image.png` → `cloudinary://{{tenant_id}}/branding/og-image.png`
- `og-image.webp` → `cloudinary://{{tenant_id}}/branding/og-image.webp`
- `pwa-192x192.png` → `cloudinary://{{tenant_id}}/branding/pwa-192.png`
- `pwa-512x512.png` → `cloudinary://{{tenant_id}}/branding/pwa-512.png`
- `about-image.png` → `cloudinary://{{tenant_id}}/pages/about.png`
- `about-image.webp` → `cloudinary://{{tenant_id}}/pages/about.webp`
- `hero-image.png` → `cloudinary://{{tenant_id}}/pages/hero.png`
- `hero-image.webp` → `cloudinary://{{tenant_id}}/pages/hero.webp`
- `ppdb.png` → `cloudinary://{{tenant_id}}/pages/ppdb.png`

**Impact:** 🔴 **CRITICAL** - Visual branding, user recognition
**Solution:** Dynamic loading from Cloudinary based on VITE_TENANT_ID

---

### 6. **Digital Pesantren Feature Images** - Store in Cloudinary
**Current Location:** `/public/images/digital-pesantren/` (static)
**Recommended:** Cloudinary per-tenant folder (or shared if generic)

**Files to Upload:**
- `dashboard-coding.png` → `cloudinary://{{tenant_id}}/features/dashboard-coding.png`
- `feature-koperasi.png` → `cloudinary://{{tenant_id}}/features/koperasi.png`
- `feature-lms.png` → `cloudinary://{{tenant_id}}/features/lms.png`
- `feature-portfolio.png` → `cloudinary://{{tenant_id}}/features/portfolio.png`
- `feature-presensi.png` → `cloudinary://{{tenant_id}}/features/presensi.png`
- `feature-tahfidz.png` → `cloudinary://{{tenant_id}}/features/tahfidz.png`
- `feature-wali-santri.png` → `cloudinary://{{tenant_id}}/features/wali-santri.png`
- `hero-main.png` → `cloudinary://{{tenant_id}}/features/hero-main.png`
- `og-digitalisasi.png` → `cloudinary://{{tenant_id}}/features/og-digitalisasi.png`
- `tech-bg.png` → `cloudinary://{{tenant_id}}/features/tech-bg.png`

**Impact:** ⚠️ **MEDIUM-HIGH** - Feature showcase
**Solution:** 
- Option A: Per-tenant upload (jika butuh customization)
- Option B: Shared folder `cloudinary://shared/features/` (jika generic/reusable)

---

## 📊 Asset Breakdown

| Kategori | Jumlah File | Priority | Clone Action |
|----------|-------------|----------|--------------|
| **HTML Meta/SEO** | 1 file | ⚠️ MEDIUM | Replace meta tags (manual/script) |
| **SEO Files** | 2 files | ⚠️ MEDIUM | Replace URLs (manual/script) |
| **Config Files** | 1 file | ✅ HANDLED | VITE_TENANT_ID sudah dynamic |
| **Brand Assets (Cloudinary)** | 10 files | 🔴 **CRITICAL** | Upload ke Cloudinary per-tenant |
| **Feature Images (Cloudinary)** | 10 files | 🔴 **HIGH** | Upload ke Cloudinary (per-tenant or shared) |
| **Total** | **24 files** | | **Focus: Cloudinary upload** |

---

## 🎯 Recommended Solution: Cloudinary-First Approach

### ⭐ Option 1: Cloudinary Dynamic Assets (RECOMMENDED)

**Strategy:** Store ALL tenant assets di Cloudinary, load dynamically berdasarkan `VITE_TENANT_ID`

**Folder Structure di Cloudinary:**
```
cloudinary://
  ├─ pestek/                    # Tenant: Pesantren Teknologi
  │   ├─ branding/
  │   │   ├─ logo.png
  │   │   ├─ og-image.png
  │   │   ├─ pwa-192.png
  │   │   └─ pwa-512.png
  │   ├─ pages/
  │   │   ├─ hero.webp
  │   │   ├─ about.webp
  │   │   └─ ppdb.png
  │   └─ features/
  │       ├─ koperasi.png
  │       ├─ tahfidz.png
  │       └─ ...
  │
  ├─ pondok_informatika/        # Tenant: Pondok Informatika
  │   ├─ br3: Cloudinary Upload Script

**Create:** `scripts/upload-tenant-assets.sh`
```bash
#!/bin/bash
# Upload tenant assets to Cloudinary

TENANT_ID=$1
CLOUDINARY_URL="cloudinary://API_KEY:API_SECRET@CLOUD_NAME"

if [ -z "$TENANT_ID" ]; then
  echo "Usage: ./upload-tenant-assets.sh <tenant_id>"
  exit 1
fi

echo "📤 Uploading assets for tenant: $TENANT_ID"
echo ""

# Upload branding assets
echo "1. Uploading branding assets..."
cloudinary upload public/logo.png -p $TENANT_ID/branding/logo.png
cloudinary upload public/og-image.png -p $TENANT_ID/branding/og-image.png
cloudinary upload public/pwa-192x192.png -p $TENANT_ID/branding/pwa-192.png
cloudinary upload public/pwa-512x512.png -p $TENANT_ID/branding/pwa-512.png

# Upload page assets
echo "2. Uploading page assets..."
cloudinary upload public/hero-image.webp -p $TENANT_ID/pages/hero.webp
cloudinary upload public/about-image.webp -p $TENANT_ID/pages/about.webp
cloudinary upload public/ppdb.png -p $TENANT_ID/pages/ppdb.png

# Upload feature images (optional - bisa shared)
echo "3. Up4: Clone Checklist (Minimal Manual Work)

**Create:** `CLONE_CHECKLIST.md`
```markdown
# Checklist Clone Pesantren Baru

## Backend (5 menit)
- [ ] 1. Clone database: `php artisan tenant:seed <tenant_id> <database> --source=pisantri --with-demo`
- [ ] 2. Update TenantMiddleware.php dengan tenant config baru
- [ ] 3. Test API: https://api-dev.pondokinformatika.id (dengan X-Tenant-ID header)

## Assets to Cloudinary (10 menit)
- [ ] 4. Upload branding assets:
  - [ ] Logo (logo.png)
  - [ ] OG Image (og-image.png, og-image.webp)
  - [ ] PWA Icons (pwa-192x192.png, pwa-512x512.png)
- [ ] 5. Upload page images:
  - [ ] Hero (hero-image.webp)
  - [ ] About (about-image.webp)
  - [ ] PPDB (ppdb.png)
- [ ] 6. Upload feature images (atau reuse dari shared folder)

## Frontend (5 menit)
- [ ] 7. Clone repository frontend
- [ ] 8. Update .env:
  - [ ] VITE_TENANT_ID=<new_tenant_id>
  - [ ] VITE_APP_NAME=<pesantren_name>
- [ ] 9. Optional: Update index.html meta tags (atau pakai script)
- [ ] 10. Optional: Update sitemap.xml & robots.txt (atau pakai script)

## Deployment (3 menit)
- [ ] 11. Deploy to Netlify
- [ ] 12. Set environment variables di Netlify
- [ ] 13. Test production: Logo, images, API integration

**Total Time:** ~23 menit (dengan Cloudinary approach)
### Option 2: Environment-Based Templating

**Create:** `index.template.html`
```html
<title>{{VITE_APP_NAME}} - {{V ⭐

1. **Setup Cloudinary folders** untuk setiap tenant
2. **Create upload script** untuk batch upload assets ke Cloudinary
3. **Implement asset helper** (`src/utils/assets.ts`) untuk dynamic loading
4. **Update components** untuk use Cloudinary URLs instead of `/public/`
5. **Document** asset requirements (size, format, naming convention)

### For Production (SOON)

1. **Automate Cloudinary upload** via script saat setup tenant baru
2. **Create asset management dashboard** (optional - untuk upload via UI)
3. **Implement image optimization** via Cloudinary transformations
4. **Test** full cloning process dengan Cloudinary assets
5. **Monitor** Cloudinary bandwidth/storage usage per tenantant
```

**Build Process:** Vite plugin untuk replace template saat build
(Manual) | With Cloudinary | Notes |
|------|------------------|-----------------|-------|
| Backend clone | 5.5 min | 5.5 min ✅ | `tenant:seed --with-demo` |
| **Upload assets to Cloudinary** | **20 min** ⚠️ | **10 min** ⚠️ | Batch upload script |
| **Frontend meta/SEO** | **30 min** ⚠️ | **5 min** ⚠️ | Optional (script or manual) |
| Update .env | 2 min | 2 min | VITE_TENANT_ID only |
| Deploy setup | 6 min | 6 min | Netlify + env vars |
| **Total Frontend** | **~58 min** | **~23 min** | |
| **TOTAL CLONE** | **~63.5 min** | **~28.5 min** | |

**Improvement:** 55% faster 🚀

**Key Change:** Focus on Cloudinary asset management instead of file replacement
- ✅ No need to replace local files
- ✅ Centralized asset storage
- ✅ Easy updates without redeployment
- ⚠️ Initial setup: upload assets once per tenant
echo "1. ✅ Clone backend database (php artisan tenant:seed)"
echo "2. ⚠️  Update .env:"
echo "   - VITE_TENANT_ID"
echo "   - VITE_APP_NAME"
echo "   - VITE_APP_URL"
echo "3. ⚠️  Update index.html (24 replacements):"
echo "   - Title, description, keywords"
echo "   - OG meta tags"
echo "   - JSON-LD structured data"
echo "   - Google Analytics ID"
echo "4. ⚠️  Update sitemap.xml (5 URLs)"
echo "5. ⚠️  Update robots.txt (2 URLs)"
echo "6. ⚠️  Replace brand assets (10 files):"
echo "   - /public/logo.png"
echo "   - /public/og-image.png"
echo "   - /public/pwa-*.png"
echo "   - /public/hero-image.*"
echo "   - /public/about-image.*"
echo "7. ⚠️  Review feature images (reuse or replace)"
echo "8. ✅ Update Netlify environment variables"
echo "9. ✅ Deploy & test"
```

---

### Option 3: Automated Replace Script

**Create:** `scripts/update-branding.js`
```javascript
const fs = require('fs');
const path = require('path');

const config = {
  appName: 'Pesantren Teknologi',
  domain: 'pesantrenteknologi.com',
  tenantId: 'pestek',
  gaId: 'G-XXXXXXXXXX'
};

// Replace in index.html
const indexHtml = fs.readFileSync('index.html', 'utf8')
  .replace(/Pondok Informatika/g, config.appName)
  .replace(/pondokinformatika\.id/g, config.domain)
  .replace(/G-M2ZCTEJW6F/g, config.gaId);

// Replace in sitemap.xml
const sitemap = fs.readFileSync('public/sitemap.xml', 'utf8')
  .replace(/pondokinformatika\.id/g, config.domain);

// Replace in robots.txt
const robots = fs.readFileSync('public/robots.txt', 'utf8')
  .replace(/pondokinformatika\.id/g, config.domain);

// Write files
fs.writeFileSync('index.html', indexHtml);
fs.writeFileSync('public/sitemap.xml', sitemap);
fs.writeFileSync('public/robots.txt', robots);

console.log('✅ Branding updated!');
```

---

## 🚀 Priority Actions

### For Next Clone (IMMEDIATE)

1. **Create template system** untuk index.html dengan env variables
2. **Create script** untuk auto-replace sitemap.xml & robots.txt
3. **Document** asset requirements (logo size, format, etc)
4. **Create checklist** untuk manual asset replacement

### For Production (SOON)

1. **Implement Vite plugin** untuk template replacement
2. **Centralize branding** dalam config file
3. **Automate** build process dengan proper env handling
4. **Test** full cloning process end-to-end

---

## 📝 Clone Timeline Update

| Task | Current | With Automation |
|------|---------|-----------------|
| Backend clone | 5.5 min | 5.5 min ✅ |
| **Frontend meta/SEO** | **30 min** ⚠️ | **2 min** ✅ |
| **Asset replacement** | **20 min** ⚠️ | **5 min** ⚠️ |
| Deploy setup | 6 min | 6 min |
| **Total Frontend** | **~56 min** | **~13 min** |
| **TOTAL CLONE** | **~61.5 min** | **~18.5 min** |

**Potential Improvement:** 70% faster 🚀

---

## 📚 Related Documentation

- **Backend Cloning:** [PLAN_CLONING.md](../../pisantri-api/PLAN_CLONING.md)
- **Multi-Tenant Plan:** [PLAN_MULTI_PESANTREN.md](./PLAN_MULTI_PESANTREN.md)
- **Implementation Guide:** [IMPLEMENTATION_CLONE_PESANTREN.md](./IMPLEMENTATION_CLONE_PESANTREN.md)

---

*Audit completed on 17 Desember 2025*
