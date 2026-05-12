# Error Handling Standards - Pesantren Teknologi

## 1. Frontend (api.ts)
- **Centralized Handler**: Semua request melalui `ApiService` yang menangkap error 4xx/5xx secara otomatis.
- **401 Diagnostic**: Jika terjadi unauthorized (401), sistem menghapus token lokal dan melakukan print tabel diagnostik di console untuk melacak kebocoran tenant atau token expired.
- **Inferred Fallback**: Deteksi environment (Local/Dev/Prod) otomatis berdasarkan hostname untuk mencegah salah terminal API.
- **Header Guard**: Fungsi `getHeaders()` wajib digunakan untuk memastikan `X-Tenant-ID` terkirim.

## 2. Backend (Laravel)
- **Structured Validation**: Detail error dikembalikan dalam format JSON 422 via Validator Laravel, memudahkan frontend menampilkan pesan error per field.
- **Existence Guard**: Pengecekan ID (jabatan, santri, dll) dilakukan sebelum query (`if (!$id)`) untuk mencegah crash server (500).
- **Tenant Middleware**: Memastikan setiap request terisolasi pada database tenant masing-masing.

## 3. UI Fallbacks
- **Image Fallback**: Helper `getStudentPhotoUrl` menggunakan event `onError` untuk selalu menyediakan fallback `/default-avatar.png` jika file tidak ditemukan.
- **Loading State**: Komponen wajib menggunakan Spinner `Loader2` saat fetch data untuk mencegah interaksi pada data kosong.
- **Error Banner**: Komponen dashboard harus menangkap `catch(err)` dan menampilkan banner pesan error (bukan blank page).

---

## MITIGASI KESALAHAN UMUM
- **Tenant Mismatch**: Selalu cek `X-Tenant-ID` di tab Network jika data tidak muncul.
- **Token Undefined**: Jika request gagal terus, cek diagnostic log di console browser.
