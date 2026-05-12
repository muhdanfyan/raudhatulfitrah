-- =====================================================
-- MIGRATION: Aktivitas Harian Asrama (Notifikasi/Info)
-- Database: pisantri
-- Date: 2026-01-03
-- Description: Sistem informasi aktivitas harian - menampilkan
--              aktivitas yang sedang berlangsung berdasarkan waktu
-- =====================================================

-- MASTER AKTIVITAS HARIAN
-- Menyimpan jadwal aktivitas rutin harian pondok
CREATE TABLE IF NOT EXISTS tb_aktivitas_harian (
  id_aktivitas INT PRIMARY KEY AUTO_INCREMENT,
  nama_aktivitas VARCHAR(100) NOT NULL COMMENT 'Nama aktivitas',
  icon VARCHAR(50) DEFAULT NULL COMMENT 'Emoji icon',
  deskripsi TEXT COMMENT 'Detail/instruksi aktivitas',
  urutan INT DEFAULT 0 COMMENT 'Urutan tampil',
  waktu_mulai TIME NOT NULL COMMENT 'Waktu mulai aktivitas',
  waktu_selesai TIME NOT NULL COMMENT 'Waktu selesai aktivitas',
  divisi_id INT DEFAULT NULL COMMENT 'FK ke tb_jabatan (akademik/pembinaan/asrama)',
  divisi_nama VARCHAR(50) DEFAULT NULL COMMENT 'Nama divisi untuk display',
  warna VARCHAR(20) DEFAULT '#3B82F6' COMMENT 'Warna tema aktivitas',
  program_santri JSON DEFAULT NULL COMMENT 'Program: ["mondok","reguler","online","afterschool"]',
  hari_aktif JSON COMMENT 'Hari aktif',
  status ENUM('aktif','nonaktif') DEFAULT 'aktif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_waktu (waktu_mulai, waktu_selesai),
  INDEX idx_urutan (urutan),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master aktivitas harian pondok';

-- =====================================================
-- DASHBOARD KEPALA SEKOLAH TABLES
-- =====================================================

-- 6. KONFIGURASI DASHBOARD KEPSEK
CREATE TABLE IF NOT EXISTS tb_dashboard_kepsek_config (
  id_config INT PRIMARY KEY AUTO_INCREMENT,
  widget_name VARCHAR(50) NOT NULL COMMENT 'Nama widget',
  widget_title VARCHAR(100) NOT NULL COMMENT 'Judul tampilan',
  widget_icon VARCHAR(50) DEFAULT NULL COMMENT 'Icon widget',
  widget_type ENUM('stat','chart','table','list','calendar') DEFAULT 'stat',
  widget_size ENUM('small','medium','large','full') DEFAULT 'medium',
  urutan INT DEFAULT 0,
  is_visible TINYINT(1) DEFAULT 1,
  config_json JSON DEFAULT NULL COMMENT 'Konfigurasi tambahan',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Konfigurasi dashboard kepala sekolah';

-- 7. LAPORAN PERIODIK KEPSEK
CREATE TABLE IF NOT EXISTS tb_laporan_kepsek (
  id_laporan INT PRIMARY KEY AUTO_INCREMENT,
  periode_tipe ENUM('harian','mingguan','bulanan','semester','tahunan') NOT NULL,
  tanggal_mulai DATE NOT NULL,
  tanggal_selesai DATE NOT NULL,
  divisi_id INT DEFAULT NULL COMMENT 'NULL = semua divisi',
  data_laporan JSON NOT NULL COMMENT 'Data agregasi laporan',
  catatan TEXT,
  generated_by INT NOT NULL,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_periode (periode_tipe, tanggal_mulai, tanggal_selesai),
  INDEX idx_divisi (divisi_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Laporan periodik kepala sekolah';

-- 8. TUPOKSI KEPALA SEKOLAH
CREATE TABLE IF NOT EXISTS tb_tupoksi_kepsek (
  id_tupoksi INT PRIMARY KEY AUTO_INCREMENT,
  nama_tupoksi VARCHAR(100) NOT NULL,
  deskripsi TEXT,
  icon VARCHAR(50) DEFAULT NULL,
  kategori ENUM('monitoring','evaluasi','pelaporan','keputusan') DEFAULT 'monitoring',
  frekuensi ENUM('harian','mingguan','bulanan','insidental') DEFAULT 'harian',
  dashboard_widget VARCHAR(50) DEFAULT NULL COMMENT 'Widget terkait di dashboard',
  urutan INT DEFAULT 0,
  is_aktif TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tupoksi kepala sekolah';

-- =====================================================
-- ADD FOREIGN KEYS (after all tables created)
-- =====================================================

-- Note: Foreign keys commented out untuk fleksibilitas
-- Uncomment jika ingin enforce referential integrity

-- ALTER TABLE tb_aktivitas_master 
--   ADD CONSTRAINT fk_aktivitas_divisi FOREIGN KEY (divisi_id) REFERENCES tb_jabatan(id_jabatan) ON DELETE SET NULL;

-- ALTER TABLE tb_aktivitas_checklist 
--   ADD CONSTRAINT fk_checklist_santri FOREIGN KEY (santri_id) REFERENCES tb_santri(id_santri) ON DELETE CASCADE,
--   ADD CONSTRAINT fk_checklist_aktivitas FOREIGN KEY (aktivitas_id) REFERENCES tb_aktivitas_master(id_aktivitas) ON DELETE CASCADE;

-- ALTER TABLE tb_aktivitas_summary 
--   ADD CONSTRAINT fk_summary_santri FOREIGN KEY (santri_id) REFERENCES tb_santri(id_santri) ON DELETE CASCADE;

-- ALTER TABLE tb_aktivitas_jadwal 
--   ADD CONSTRAINT fk_jadwal_aktivitas FOREIGN KEY (aktivitas_id) REFERENCES tb_aktivitas_master(id_aktivitas) ON DELETE CASCADE;

-- ALTER TABLE tb_aktivitas_log 
--   ADD CONSTRAINT fk_log_checklist FOREIGN KEY (checklist_id) REFERENCES tb_aktivitas_checklist(id_checklist) ON DELETE CASCADE;
