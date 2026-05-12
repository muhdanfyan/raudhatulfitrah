# Catatan Pengembangan Halaman Tata Tertib (TatibPage)

Dokumen ini berisi catatan proses pengembangan halaman Tata Tertib untuk referensi implementasi di repository lain.

---

## Overview

Halaman Tata Tertib (`/tatib`) menampilkan daftar tata tertib pesantren dengan fitur:
- Accordion list untuk setiap tatib
- Deskripsi tatib dengan HTML rendering
- Daftar pelanggaran per tatib
- Modal input sanksi untuk santri

---

## File Utama

```
src/pages/TatibPage.tsx
```

---

## Endpoint API yang Digunakan

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api/master/tatib` | GET | Daftar tata tertib |
| `/api/master/langgar` | GET | Daftar pelanggaran |
| `/api/santri` | GET | Daftar santri |
| `/api/crud/sanksi` | POST | Input sanksi baru |

---

## Issues & Solutions

### 1. Error 401 Unauthorized

**Masalah:** API return 401 karena multi-tenant header tidak dikirim.

**Solusi:** Tambahkan `X-Tenant-ID` header ke semua request.

```typescript
const TENANT_ID = import.meta.env.VITE_TENANT_ID || '';

const getHeaders = (includeContentType = false) => {
  const token = localStorage.getItem('pisantri_token');
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
  };
  if (TENANT_ID) {
    headers['X-Tenant-ID'] = TENANT_ID;
  }
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};
```

---

### 2. Data Tidak Tampil Meskipun API 200 OK

**Masalah:** API response berupa array langsung `[...]`, bukan object `{success: true, data: [...]}`.

**Solusi:** Handle kedua format response:

```typescript
// Handle both array and {success, data} response formats
const tatibRes = await fetch(`${API_URL}/api/master/tatib`, { headers });
const tatibData = await tatibRes.json();
const tatibList: Tatib[] = Array.isArray(tatibData) ? tatibData : (tatibData.data || []);
```

---

### 3. Tatib Tidak Muncul Jika Tidak Ada Pelanggaran

**Masalah:** Filter `.filter(g => g.pelanggaranList.length > 0)` menyembunyikan tatib tanpa pelanggaran.

**Solusi:** Hapus filter tersebut agar semua tatib tetap tampil:

```typescript
// Show all tatib even without pelanggaran
const grouped: GroupedData[] = tatibList.map(tatib => ({
  tatib,
  pelanggaranList: pelanggaranList.filter(p => p.tatib === tatib.id_tatib)
}));
// Removed: .filter(g => g.pelanggaranList.length > 0)
```

---

### 4. HTML Content Tidak Dirender

**Masalah:** Field `deskripsi_tatib` dan `sanksi` mengandung HTML tags yang tampil sebagai raw text.

**Solusi:** Gunakan `dangerouslySetInnerHTML`:

```tsx
{tatib.deskripsi_tatib && (
  <div className="p-4 bg-indigo-50 border-b border-indigo-100">
    <div 
      className="text-sm text-indigo-800 prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: tatib.deskripsi_tatib }}
    />
  </div>
)}
```

---

### 5. Santri List Tidak Muncul di Modal

**Masalah:** Interface Santri menggunakan field names berbeda dengan API response.

**API Response:**
```json
{ "id": 1, "name": "Ahmad", "status": "Mondok" }
```

**Solusi:** Update interface sesuai API response:

```typescript
interface Santri {
  id: number;        // bukan id_santri
  name: string;      // bukan nama_lengkap_santri
  nickname?: string;
  status?: string;
  photo?: string;
}
```

Dan filter hanya status "Mondok":

```typescript
const filteredSantri = santriList
  .filter(s => s.status === 'Mondok')
  .filter(s => s.name?.toLowerCase().includes(searchSantri.toLowerCase()));
```

---

### 6. Error 404 Saat Input Sanksi

**Masalah:** Endpoint `/api/sanksi-input` tidak ada di backend.

**Solusi:** Gunakan generic CRUD endpoint:

```typescript
// Sebelum
const response = await fetch(`${API_URL}/api/sanksi-input`, { ... });

// Sesudah
const response = await fetch(`${API_URL}/api/crud/sanksi`, { ... });
```

---

## Checklist Implementasi untuk Repo Baru

- [ ] Pastikan environment variable `VITE_TENANT_ID` sudah di-set
- [ ] Gunakan helper `getHeaders()` untuk semua API request
- [ ] Handle response format baik array maupun object
- [ ] Gunakan `dangerouslySetInnerHTML` untuk field yang berisi HTML
- [ ] Cocokkan interface dengan actual API response fields
- [ ] Verifikasi endpoint yang digunakan ada di backend

---

## Environment Variables

```env
VITE_API_URL=https://api-dev.pondokinformatika.id
VITE_TENANT_ID=pestek
VITE_APP_NAME=Pesantren Teknologi
```

---

## Related Files

- `src/services/api.ts` - Injeksi X-Tenant-ID header
- `.env.development` - Konfigurasi tenant
- Backend: `TenantMiddleware.php` - Switch database per tenant

---

## Dashboard Integration

Halaman `/tatib` dapat diakses dari dashboard berikut:

| Dashboard | Komponen |
|-----------|----------|
| **Pembinaan** | Panel gradient indigo-purple setelah QR Presensi |
| **Asrama** | Panel gradient indigo-purple setelah QR Presensi |
| **Akademik** | Quick menu item dengan emoji ⚖️ |

---

*Terakhir diupdate: 15 Desember 2025*
