# Task: Mapping & Seeding Course List for Roadmap

## 0. Pembersihan & Perapian Data (DONE)
- [x] Hapus log konsol, script JS, dan metadata berulang dari file `.txt`.
- [x] Normalisasi URL YouTube (hapus parameter timestamp/tracking).
- [x] Filter judul video yang tidak valid (hanya angka, "Sedang diputar", dsb).
- [x] Amankan list unik sebanyak ~674 materi berkualitas tinggi.
- [x] Upload folder `list-course` ke VPS di `/home/pi/list-course/`.

## 1. Arsitektur & Analisis Skema Database
- [ ] Pelajari relasi antara `tb_roadmap` -> `tb_roadmap_section` -> `tb_roadmap_topic`.
- [ ] Pahami penempatan `tb_lms_course` yang terhubung ke `tb_roadmap_topic`.
- [ ] Identifikasi kolom `content_mode` untuk membedakan tutorial terstruktur (Multi-part) dan simpel tutorial (Standalone).
- [ ] Pelajari relasi `tb_konsentrasi` untuk pengelompokan bidang keahlian (Web, Security, Multimedia).

## 2. Klasifikasi & Pemetaan Konten Tutorial
- [ ] **Analisis & Klasifikasi deaAfrizal.txt:**
    - [ ] Petakan tutorial bertanda "PART" atau "SESI" ke dalam satu Course terstruktur.
    - [ ] Klasifikasikan video standalone ke dalam kategori "Tips & Tricks" atau "Quick Tutorial".
    - [ ] Kelompokkan berdasarkan teknologi (Docker, Javascript, Python, AI).
- [ ] **Analisis & Klasifikasi EtichalHackingID.txt:**
    - [ ] Identifikasi path pembelajaran (Roadmap) untuk Cyber Security.
    - [ ] Petakan tutorial berdasarkan tools (Nmap, Kali Linux, SQL Injection).
    - [ ] Klasifikasikan tingkat kesulitan (Fundamental vs Advanced).
- [ ] **Analisis & Klasifikasi azizpict.txt:**
    - [ ] Petakan tutorial berdasarkan software (CapCut, Premiere Pro, After Effects).
    - [ ] Klasifikasikan jenis konten (Visual Effect, Transition, Motion Graphics).

## 3. Penempatan & Integrasi Roadmap
- [ ] Cari relasi setiap tutorial dengan Roadmap yang sudah ada (Frontend, Backend, UI/UX, dsb).
- [ ] Tentukan `urutan` (sorting) video dalam satu Course berdasarkan logika progres belajar.
- [ ] Identifikasi Milestone atau Achievement yang akan dikaitkan dengan penyelesaian Tutorial tersebut.

## 4. Persiapan Data & Seeding Database
- [ ] **Mapping JSON:** Ubah hasil klasifikasi tutorial ke dalam format JSON transisi untuk memudahkan seeding.
- [ ] **Database Seeder - Course:** Buat perintah seeder untuk mengisi `tb_lms_course` berdasarkan data yang sudah dipetakan.
- [ ] **Database Seeder - Materi:** Buat perintah seeder untuk mengisi `tb_lms_materi` dengan menyertakan `video_url` dari daftar file.
- [ ] **Linking Seeder:** Pastikan seeder menghubungkan Course dengan Topic Roadmap yang tepat (`roadmap_topic` ID).

## 5. Eksekusi & Verifikasi
- [ ] Jalankan `php artisan db:seed --class=LmsCourseSeeder`.
- [ ] Verifikasi tampilan course di Dashboard Admin/Santri apakah sudah sesuai struktur Roadmap.
- [ ] Pastikan metadata video (URL dan Judul) tersimpan dengan benar tanpa ada link yang rusak.
