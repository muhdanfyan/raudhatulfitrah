-- =====================================================
-- MIGRATION: SOP & Tugas Divisi
-- Database: pisantri
-- Date: 2026-01-03
-- Description: Tabel SOP checklist untuk tugas rutin divisi
-- =====================================================

-- =====================================================
-- TABEL SOP DIVISI
-- =====================================================

-- Tabel Master SOP per Divisi (checklist tugas rutin)
CREATE TABLE IF NOT EXISTS tb_sop_divisi (
  id_sop INT PRIMARY KEY AUTO_INCREMENT,
  divisi_id INT NOT NULL COMMENT 'FK ke tb_jabatan',
  divisi_nama VARCHAR(50) NOT NULL,
  nama_sop VARCHAR(150) NOT NULL,
  deskripsi TEXT,
  icon VARCHAR(50) DEFAULT NULL,
  kategori ENUM('harian','mingguan','bulanan','insidental') DEFAULT 'harian',
  waktu_mulai TIME DEFAULT NULL,
  waktu_selesai TIME DEFAULT NULL,
  urutan INT DEFAULT 0,
  is_wajib TINYINT(1) DEFAULT 1,
  status ENUM('aktif','nonaktif') DEFAULT 'aktif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_divisi (divisi_id),
  INDEX idx_kategori (kategori),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master SOP per divisi';

-- Tabel Checklist SOP Harian (record pengerjaan)
CREATE TABLE IF NOT EXISTS tb_sop_checklist (
  id_checklist INT PRIMARY KEY AUTO_INCREMENT,
  sop_id INT NOT NULL COMMENT 'FK ke tb_sop_divisi',
  user_id INT NOT NULL COMMENT 'User yang checklist',
  tanggal DATE NOT NULL,
  status ENUM('belum','selesai','skip') DEFAULT 'belum',
  waktu_selesai DATETIME DEFAULT NULL,
  catatan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sop (sop_id),
  INDEX idx_user (user_id),
  INDEX idx_tanggal (tanggal),
  UNIQUE KEY unique_checklist (sop_id, user_id, tanggal)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Checklist SOP harian';

-- Tabel Tugas Admin/Khusus (tugas non-rutin)
CREATE TABLE IF NOT EXISTS tb_tugas_admin (
  id_tugas INT PRIMARY KEY AUTO_INCREMENT,
  judul VARCHAR(200) NOT NULL,
  deskripsi TEXT,
  assigned_to INT DEFAULT NULL COMMENT 'User yang ditugaskan',
  assigned_divisi INT DEFAULT NULL COMMENT 'Divisi yang ditugaskan',
  prioritas ENUM('rendah','sedang','tinggi','urgent') DEFAULT 'sedang',
  deadline DATE DEFAULT NULL,
  status ENUM('pending','in_progress','selesai','batal') DEFAULT 'pending',
  created_by INT NOT NULL,
  completed_at DATETIME DEFAULT NULL,
  completed_by INT DEFAULT NULL,
  catatan_selesai TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_assigned (assigned_to),
  INDEX idx_divisi (assigned_divisi),
  INDEX idx_status (status),
  INDEX idx_deadline (deadline)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tugas admin non-rutin';
