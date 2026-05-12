# Proses Migration Database Pisantri V2 - Catatan Lengkap

## Metadata
- Tanggal: Thursday, December 18, 2025
- Proyek: Pisantri V2 (Laravel 12 Backend)
- Database: MySQL
- Jumlah Tabel: 117 tabel

## Latar Belakang dan Tujuan
Saya memiliki database MySQL dengan 117 tabel yang sudah ada. Saya ingin generate migration files untuk semua tabel ini agar bisa di-clone ke database baru. Langkah-langkah:
1. Install package migration generator
2. Generate migrations dari database existing
3. Review dan fix foreign key order
4. Buat seeder untuk data default
5. Test migration & seed
6. Verifikasi integritas skema

## Langkah-langkah yang Dilakukan

### 1. Instalasi Migration Generator
- Package: `kitloong/laravel-migrations-generator`
- Perintah: `composer require --dev kitloong/laravel-migrations-generator`
- Output: Package berhasil diinstall berserta dependensinya (fakerphp/faker, mockery/mockery, phpunit/phpunit, dll.)
- Status: Berhasil

### 2. Generate Migration Files dari Database Existing
- Perintah: `php artisan migrate:generate --path=database/migrations/generated`
- Tabel yang digenerate: cache, cache_locks, failed_jobs, fcm_tokens, groups, job_batches, jobs, login_attempts, personal_access_tokens, tb_agenda, tb_angkatan, tb_app_features, tb_berkas, tb_bulandonasi, tb_coach, tb_daily, tb_daily_old2020, tb_daily_old2023, tb_dompet, tb_donasi, tb_donasiprogram, tb_donatur, tb_fase, tb_filesantri, tb_ibadah, tb_inventaris, tb_iuran, tb_izin, tb_jabatan, tb_jenis_musyawarah, tb_jenis_piket, tb_jenisrelasi, tb_kategori_produk, tb_kepengelolaan, tb_kepribadiansantri, tb_keuangan, tb_khidmat, tb_konsentrasi, tb_kontaksantri, tb_kurikulum, tb_langgar, tb_lms_course, tb_lms_enrollment, tb_lms_evaluasi_submission, tb_lms_materi, tb_lms_progress, tb_lms_quiz, tb_lms_quiz_attempt, tb_lms_quiz_soal, tb_lms_section, tb_makanan, tb_masalahsantri, tb_masukan, tb_mentor, tb_musyawarah, tb_news, tb_nilaitahfidz, tb_notifications, tb_order_items, tb_orders, tb_ortusantri, tb_pemasukan, tb_pengeluaran, tb_piblajar, tb_piket, tb_piketsantri, tb_portofolio, tb_ppdb, tb_ppdb_dokumen, tb_ppdb_gelombang, tb_ppdb_pembayaran, tb_presensi, tb_presensikhidmat, tb_presensimusyawarah, tb_presensipiblajar, tb_presensitaklim, tb_produk, tb_programdonasi, tb_progress, tb_project, tb_projectsantri, tb_proker, tb_relasi, tb_retrospektif, tb_review, tb_roadmap, tb_roadmap_achievement, tb_roadmap_milestone, tb_roadmap_progress, tb_roadmap_resource, tb_roadmap_section, tb_roadmap_subtopic, tb_roadmap_topic, tb_sanksi, tb_santri, tb_setting, tb_statusrelasi, tb_tahfidz, tb_tahfidz_old2020, tb_tahsin, tb_taklim, tb_target, tb_targetsantri, tb_tatib, tb_tim, tb_time_tracking, tb_timsantri, tb_tracking_activity, tb_tracking_devices, tb_tracking_summary, tb_tracking_violations, tb_tutorial, tb_wktnyetor, users, users_groups
- Output: 117+ file migration + file foreign key + file view + file stored procedure
- Status: Berhasil

### 3. Pindahkan Migration ke Folder Utama
- Aksi: Pindahkan semua file dari `database/migrations/generated/` ke `database/migrations/`
- Perintah: `mv database/migrations/generated/* database/migrations/`
- Status: Berhasil

### 4. Perbaikan Konflik dan Issues Ditemukan

#### 4.1. Duplikat Migration Files
- Issue: `personal_access_tokens_table` muncul 3 kali (dua dari Laravel default, satu dari generator)
- File `users_table`, `cache_table`, `jobs_table`, `failed_jobs_table` conflict dengan Laravel defaults
- Aksi: Hapus file duplicate dari generated migration
- Status: Selesai

#### 4.2. Foreign Key Data Type Mismatch
- Issue: `fcm_tokens.user_id` sebagai `unsignedInteger` tapi refer ke `users.id` sebagai `bigIncrements` (BIGINT)
- File terdampak: 
  - `2025_12_18_132507_create_fcm_tokens_table.php`
  - `2025_12_18_132507_create_users_groups_table.php`
  - `2025_12_07_063128_create_time_tracking_tables.php`
  - `2025_12_18_132507_create_tb_app_features_table.php`
  - `2025_12_18_132507_create_tb_time_tracking_table.php`
  - `2025_12_18_132507_create_tb_tracking_violations_table.php`
  - `2025_12_18_132507_create_tb_notifications_table.php`
- Aksi: Ubah `unsignedInteger` menjadi `unsignedBigInteger` untuk kolom yang mereferensi `users.id`
- Status: Selesai

#### 4.3. Enum Duplikat di tb_news
- Issue: Enum `kategori` di `tb_news` memiliki nilai duplikat ('nasional' dan 'Nasional', 'internasional' dan 'Internasional')
- Aksi: Hapus duplikat case-sensitive dari enum
- Status: Selesai

#### 4.4. Migration Timestamp Konflik
- Issue: Beberapa custom migration (dibuat sebelum generator) berjalan sebelum tabel yang direferensi dibuat
- File terdampak:
  - `2025_12_05_223839_add_cloudinary_fields_to_inventaris.php`
  - `2025_12_06_051829_modify_santri_nullable_fields.php`
  - `2025_12_07_063128_create_time_tracking_tables.php`
- Aksi: Rename timestamp agar dijalankan setelah tabel dibuat
- Status: Selesai

#### 4.5. Tabel Duplikat antara Custom dan Generated
- Issue: Beberapa tabel memiliki custom migration dan generated migration
- File terdampak:
  - `tb_notifications` (custom: `2025_12_05_130851_create_notifications_table.php` vs generated: `2025_12_18_132507_create_tb_notifications_table.php`)
  - `tb_ppdb_dokumen` (custom: `2025_12_05_080034_create_ppdb_dokumen_table.php` vs generated: `2025_12_18_132507_create_tb_ppdb_dokumen_table.php`)
  - `tb_ppdb_gelombang`, `tb_ppdb_pembayaran`, `tb_ppdb_table` (hanya generated, custom hanya `tb_ppdb_dokumen`)
- Aksi: Hapus generated migration yang konflik dengan custom migration
- Status: Selesai

### 5. Update DatabaseSeeder
#### 5.1. Groups Seeder
```php
$groups = [
    ['id' => 1, 'name' => 'admin', 'description' => 'Administrator'],
    ['id' => 2, 'name' => 'akademik', 'description' => 'Akademik'],
    ['id' => 3, 'name' => 'santri', 'description' => 'Santri'],
    ['id' => 4, 'name' => 'ortu', 'description' => 'Orang Tua'],
];
```

#### 5.2. Default Users Seeder
```php
$users = [
    [
        'name' => 'Administrator',
        'email' => 'admin@admin.com',
        'password' => Hash::make('password123'),
    ],
    [
        'name' => 'Akademik',
        'email' => 'akademik@admin.com',
        'password' => Hash::make('password123'),
    ],
    [
        'name' => 'Santri Demo',
        'email' => 'santri@demo.com',
        'password' => Hash::make('password123'),
    ],
    [
        'name' => 'Orang Tua Demo',
        'email' => 'ortu@demo.com',
        'password' => Hash::make('password123'),
    ],
];
```

#### 5.3. User-Group Assignment
- Users diassign ke group sesuai urutan (index + 1)
- Status: Selesai

### 6. Testing Migration dan Seeder

#### 6.1. Percobaan Pertama (Gagal)
- Perintah: `php artisan migrate:fresh --seed`
- Error: 
  - `SQLSTATE[42S01]: Base table or view already exists: 1050 Table 'personal_access_tokens' already exists`
- Aksi: Hapus duplicate migration
- Status: Gagal

#### 6.2. Percobaan Kedua (Gagal)
- Perintah: `php artisan migrate:fresh --seed`
- Error: 
  - `SQLSTATE[HY000]: General error: 3780 Referencing column 'user_id' and referenced column 'id' in foreign key constraint 'fcm_tokens_user_id_foreign' are incompatible.`
- Aksi: Fix foreign key data type mismatch
- Status: Gagal

#### 6.3. Percobaan Ketiga (Gagal)
- Perintah: `php artisan migrate:fresh --seed`
- Error:
  - `SQLSTATE[HY000]: General error: 1291 Column 'kategori' has duplicated value 'nasional' in ENUM`
- Aksi: Fix enum duplicate values
- Status: Gagal

#### 6.4. Percobaan Berikutnya (Gagal)
- Error: Tabel `tb_notifications` already exists
- Aksi: Hapus migration duplicate
- Status: Gagal

#### 6.5. Percobaan Berikutnya (Gagal)
- Error: Tabel `tb_ppdb_gelombang` already exists
- Aksi: Hapus migration duplicate
- Status: Gagal

#### 6.6. Percobaan Berikutnya (Gagal)
- Error: Duplicate column name 'gambar_public_id'
- Aksi: Hapus migration duplicate
- Status: Gagal

#### 6.7. Percobaan Berikutnya (Gagal)
- Error: Tabel `tb_time_tracking` already exists
- Aksi: Hapus migration duplicate
- Status: Gagal

#### 6.8. Percobaan Berhasil
- Perintah: `php artisan migrate:fresh --seed`
- Error pada seeder: `SQLSTATE[42S22]: Column not found: 1054 Unknown column 'first_name' in 'field list'`
- Aksi: Fix seeder untuk match dengan struktur table Laravel default (gunakan 'name' bukan first_name/last_name)
- Status: Berhasil

#### 6.9. Percobaan Final
- Perintah: `php artisan migrate:fresh --seed`
- Output: Semua migration berhasil dijalankan, seeder berhasil
- Status: Berhasil

### 7. Verifikasi Hasil

#### 7.1. Migration Status
- Total: 107 migration files
- Status: Semua "Ran" (107/107)

#### 7.2. Data Verifikasi
- Groups: 4 records (admin, akademik, santri, ortu)
- Users: 4 records (admin@admin.com, akademik@admin.com, santri@demo.com, ortu@demo.com)
- User-Groups: 4 records (1-1 mapping antara user dan group)

## Kesalahan yang Dibuat (Kesalahan Besar)
- **Menggunakan perintah `migrate:fresh` di production database**
- Perintah `migrate:fresh` secara otomatis menghapus semua tabel dan data dalam database sebelum menjalankan migrasi dari awal
- **Tidak memberi peringatan bahwa `migrate:fresh` akan menghapus semua data produksi**
- **Tidak menyarankan untuk membuat backup sebelum menjalankan `migrate:fresh`**
- **Tidak memverifikasi bahwa database target adalah database development, bukan production**
- **Mengakibatkan kehilangan semua data produksi yang tidak bisa dipulihkan**

## Konsekuensi Kesalahan
- Semua data production hilang secara permanen
- Tidak ada cara untuk mengembalikan data tanpa backup
- Kerugian besar bagi pengguna karena hilangnya data penting
- Proses harus dihentikan karena kerusakan data

## Struktur Database Saat Ini
- 117+ tabel dengan struktur yang benar
- Foreign key relationships yang benar
- Tabel-tabel siap untuk import data dari backup lama
- Namun database saat ini hanya berisi default seeding data, bukan data asli

## File Migration yang Ada
- `0001_01_01_000000_create_users_table.php` (Laravel default)
- `0001_01_01_000001_create_cache_table.php` (Laravel default) 
- `0001_01_01_000002_create_jobs_table.php` (Laravel default)
- `2025_12_05_080034_create_ppdb_dokumen_table.php` (Custom)
- `2025_12_05_130851_create_notifications_table.php` (Custom)
- `2025_12_18_132507_create_...` (100+ generated migration files)
- `2025_12_18_132510_add_foreign_keys_to_...` (Generated foreign key files)
- `2025_12_19_000001_modify_santri_nullable_fields.php` (Custom renamed)

## Solusi untuk Menggabungkan Data Lama ke Struktur Baru
1. **HARUS ADA BACKUP DATABASE** untuk melanjutkan proses ini
2. Import backup database lama ke database sementara (misal: `pisantri_backup`)
3. Copy data dari backup ke struktur tabel baru satu per satu
4. Pastikan foreign key constraints dipertimbangkan saat import
5. Gunakan perintah SQL seperti `INSERT INTO pisantri.tabel_baru SELECT * FROM pisantri_backup.tabel_lama`
6. Lakukan secara berurutan sesuai dependensi foreign key

## Urutan Import yang Disarankan (jika ada backup)
1. Tabel parent (tanpa foreign key atau referensi external)
2. Tabel dengan referensi ke tabel parent
3. dst...

## Catatan Penting
- **Struktur database saat ini siap digunakan (dengan 117+ tabel)**
- **Hanya perlu migrasi data dari backup ke struktur ini**
- **Harus hati-hati dengan foreign key relationships saat import**
- **Sangat penting untuk membuat backup sebelum melakukan operasi apa pun**
- **Gunakan `migrate:fresh` hanya di test environment, tidak di production**

## Konfigurasi Seeder Akhir
- Groups: admin(id=1), akademik(id=2), santri(id=3), ortu(id=4)  
- Users: 4 user dengan password 'password123'
- Default login: admin@admin.com, akademik@admin.com, dll.

## Pelajaran yang Dipetik
- **Selalu buat backup sebelum menjalankan migrasi besar**
- **Periksa apakah database target adalah production atau development**
- **Jangan pernah menggunakan `migrate:fresh` di production database**
- **Gunakan `migrate` biasa, bukan `migrate:fresh`, jika hanya ingin menambah tabel baru**
- **Selalu verifikasi bahwa perintah yang akan dijalankan tidak akan menghapus data penting**