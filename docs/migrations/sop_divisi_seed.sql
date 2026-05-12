-- =====================================================
-- SEED: SOP Divisi Pondok Informatika
-- Database: pisantri
-- Date: 2026-01-03
-- divisi_id mapping: Akademik = 10, Pembinaan = 8, Asrama = 9
-- =====================================================

-- Pastikan tabel sudah dibuat: sop_divisi_migration.sql

-- =====================================================
-- SOP DIVISI AKADEMIK (divisi_id = 10)
-- =====================================================

INSERT INTO tb_sop_divisi (divisi_id, divisi_nama, nama_sop, deskripsi, icon, kategori, waktu_mulai, waktu_selesai, urutan, is_wajib) VALUES
-- HARIAN
(10, 'Akademik', 'Tahsin + Briefing Pagi', 'Pimpin sesi tahsin dan briefing target belajar harian santri', '📖', 'harian', '05:30:00', '06:30:00', 1, 1),
(10, 'Akademik', 'Monitoring Waktu Produktif I', 'Pantau dan bimbing santri selama sesi belajar pagi (Focus Time 3 jam)', '🎯', 'harian', '07:30:00', '11:30:00', 2, 1),
(10, 'Akademik', 'OpenDiscuss & Evaluasi', 'Fasilitasi diskusi dan evaluasi hasil belajar santri', '🚀', 'harian', '13:00:00', '15:00:00', 3, 1),
(10, 'Akademik', 'Tahsin + Briefing Sore', 'Sesi curhat, cek progress, dan hitung pencapaian harian', '📖', 'harian', '18:30:00', '19:30:00', 4, 1),
(10, 'Akademik', 'Update Progress LMS', 'Perbarui data progress belajar santri di sistem LMS', '💻', 'harian', '20:00:00', '21:00:00', 5, 0),
(10, 'Akademik', 'Input Data Presensi', 'Pastikan data presensi santri terinput dengan benar', '✅', 'harian', '21:00:00', '22:00:00', 6, 1),

-- MINGGUAN
(10, 'Akademik', 'Evaluasi Mingguan Santri', 'Review pencapaian target belajar mingguan setiap santri', '📊', 'mingguan', NULL, NULL, 10, 1),
(10, 'Akademik', 'Rapat Koordinasi Akademik', 'Koordinasi dengan mentor dan musyrif terkait progress santri', '👥', 'mingguan', NULL, NULL, 11, 1),
(10, 'Akademik', 'Update Roadmap Santri', 'Perbarui milestone dan progress roadmap belajar santri', '🗺️', 'mingguan', NULL, NULL, 12, 0),
(10, 'Akademik', 'Laporan Mingguan Akademik', 'Susun laporan progress akademik mingguan', '📝', 'mingguan', NULL, NULL, 13, 1),

-- BULANAN
(10, 'Akademik', 'Evaluasi Bulanan & Rapor', 'Evaluasi pencapaian bulanan dan update rapor santri', '📋', 'bulanan', NULL, NULL, 20, 1),
(10, 'Akademik', 'Review Kurikulum', 'Review dan update kurikulum/materi pembelajaran', '📚', 'bulanan', NULL, NULL, 21, 0);

-- =====================================================
-- SOP DIVISI PEMBINAAN (divisi_id = 8)
-- =====================================================

INSERT INTO tb_sop_divisi (divisi_id, divisi_nama, nama_sop, deskripsi, icon, kategori, waktu_mulai, waktu_selesai, urutan, is_wajib) VALUES
-- HARIAN
(8, 'Pembinaan', 'Sholat Layl & Shubuh Berjamaah', 'Pimpin dan pantau sholat layl (min 3 rakaat) dan shubuh berjamaah', '🌙', 'harian', '04:00:00', '05:30:00', 1, 1),
(8, 'Pembinaan', 'Terima Setoran Hafalan', 'Terima dan nilai setoran hafalan santri (min 3 baris)', '📖', 'harian', '04:30:00', '05:30:00', 2, 1),
(8, 'Pembinaan', 'Sholat Zhuhur Berjamaah', 'Pimpin sholat zhuhur dan pastikan santri tidak ketinggalan takbiratul ula', '🕌', 'harian', '11:30:00', '12:30:00', 3, 1),
(8, 'Pembinaan', 'Sholat Ashar Berjamaah', 'Pimpin sholat ashar berjamaah', '🙏', 'harian', '15:30:00', '16:00:00', 4, 1),
(8, 'Pembinaan', 'Sholat Maghrib + Murajaah', 'Pimpin maghrib berjamaah dan sesi murajaah (min 1 halaman)', '🌄', 'harian', '17:00:00', '18:30:00', 5, 1),
(8, 'Pembinaan', 'Sholat Isya Berjamaah', 'Pimpin sholat isya berjamaah', '🌙', 'harian', '19:00:00', '19:30:00', 6, 1),
(8, 'Pembinaan', 'Input Data Ibadah', 'Catat data ibadah harian santri ke sistem (sholat, rawatib, tahajud)', '📝', 'harian', '21:00:00', '22:00:00', 7, 1),

-- MINGGUAN
(8, 'Pembinaan', 'Evaluasi Hafalan Mingguan', 'Review progress hafalan Al-Quran setiap santri', '📊', 'mingguan', NULL, NULL, 10, 1),
(8, 'Pembinaan', 'Kajian/Tausiyah', 'Siapkan dan sampaikan materi kajian mingguan', '🎤', 'mingguan', NULL, NULL, 11, 1),
(8, 'Pembinaan', 'Laporan Ibadah ke Ortu', 'Kirim laporan ibadah mingguan ke orang tua santri', '📱', 'mingguan', NULL, NULL, 12, 0),
(8, 'Pembinaan', 'Rapat Koordinasi Pembinaan', 'Evaluasi dan koordinasi tim pembinaan', '👥', 'mingguan', NULL, NULL, 13, 1),

-- BULANAN
(8, 'Pembinaan', 'Evaluasi Tahfidz Bulanan', 'Ujian dan evaluasi hafalan bulanan santri', '📋', 'bulanan', NULL, NULL, 20, 1),
(8, 'Pembinaan', 'Laporan Pembinaan Bulanan', 'Susun laporan pembinaan bulanan ke pimpinan', '📝', 'bulanan', NULL, NULL, 21, 1);

-- =====================================================
-- SOP DIVISI ASRAMA (divisi_id = 9)
-- =====================================================

INSERT INTO tb_sop_divisi (divisi_id, divisi_nama, nama_sop, deskripsi, icon, kategori, waktu_mulai, waktu_selesai, urutan, is_wajib) VALUES
-- HARIAN
(9, 'Asrama', 'Bangunkan Santri', 'Pastikan semua santri bangun tepat waktu untuk persiapan ibadah', '🌅', 'harian', '03:30:00', '04:00:00', 1, 1),
(9, 'Asrama', 'Cek Kebersihan & Piket Pagi', 'Awasi pelaksanaan piket dan kebersihan asrama pagi', '🧹', 'harian', '06:30:00', '07:30:00', 2, 1),
(9, 'Asrama', 'Monitoring Istirahat Siang', 'Pastikan santri istirahat dengan tertib setelah target belajar tercapai', '😴', 'harian', '11:30:00', '13:00:00', 3, 1),
(9, 'Asrama', 'Cek Kondisi Inventaris', 'Pantau kondisi inventaris asrama dan laporkan kerusakan', '📦', 'harian', '16:00:00', '17:00:00', 4, 0),
(9, 'Asrama', 'Forum Malam', 'Fasilitasi forum untuk membahas persoalan asrama', '🌌', 'harian', '20:00:00', '21:00:00', 5, 1),
(9, 'Asrama', 'Pastikan Santri Tidur', 'Cek semua santri sudah di kamar dan siap tidur', '🌙', 'harian', '21:00:00', '22:00:00', 6, 1),
(9, 'Asrama', 'Cek Keamanan Malam', 'Pastikan pintu terkunci dan keamanan terjaga', '🔒', 'harian', '22:00:00', '22:30:00', 7, 1),

-- MINGGUAN
(9, 'Asrama', 'Rekap Keuangan Mingguan', 'Buat rekap pemasukan dan pengeluaran kas asrama', '💰', 'mingguan', NULL, NULL, 10, 1),
(9, 'Asrama', 'Cek Stok Kebutuhan', 'Inventarisasi kebutuhan asrama yang perlu dibeli', '📋', 'mingguan', NULL, NULL, 11, 1),
(9, 'Asrama', 'Evaluasi Piket', 'Evaluasi pelaksanaan piket dan beri feedback ke santri', '⭐', 'mingguan', NULL, NULL, 12, 1),
(9, 'Asrama', 'Kebersihan Besar', 'Koordinasi kebersihan besar mingguan', '🧼', 'mingguan', NULL, NULL, 13, 1),
(9, 'Asrama', 'Rapat Koordinasi Asrama', 'Evaluasi dan koordinasi tim asrama', '👥', 'mingguan', NULL, NULL, 14, 1),

-- BULANAN
(9, 'Asrama', 'Laporan Keuangan Bulanan', 'Susun laporan keuangan bulanan untuk dilaporkan ke pimpinan', '📊', 'bulanan', NULL, NULL, 20, 1),
(9, 'Asrama', 'Maintenance Fasilitas', 'Koordinasi perbaikan dan perawatan fasilitas asrama', '🔧', 'bulanan', NULL, NULL, 21, 1),
(9, 'Asrama', 'Inventarisasi Bulanan', 'Update data inventaris dan aset asrama', '📦', 'bulanan', NULL, NULL, 22, 1);

-- =====================================================
-- VIEW: Untuk mendapatkan SOP yang sedang aktif berdasarkan waktu
-- =====================================================

CREATE OR REPLACE VIEW v_sop_aktif_sekarang AS
SELECT 
  s.*,
  CASE 
    WHEN s.kategori = 'harian' 
      AND CURTIME() BETWEEN s.waktu_mulai AND s.waktu_selesai 
    THEN 'sedang_berlangsung'
    WHEN s.kategori = 'harian' 
      AND CURTIME() < s.waktu_mulai 
    THEN 'akan_datang'
    ELSE 'selesai'
  END as status_waktu
FROM tb_sop_divisi s
WHERE s.status = 'aktif'
ORDER BY s.divisi_id, s.urutan;

-- =====================================================
-- VIEW: Dashboard SOP per divisi
-- =====================================================

CREATE OR REPLACE VIEW v_sop_dashboard AS
SELECT 
  s.divisi_id,
  s.divisi_nama,
  s.kategori,
  COUNT(*) as total_sop,
  SUM(CASE WHEN c.status = 'selesai' THEN 1 ELSE 0 END) as selesai,
  SUM(CASE WHEN c.status = 'belum' OR c.status IS NULL THEN 1 ELSE 0 END) as belum
FROM tb_sop_divisi s
LEFT JOIN tb_sop_checklist c ON s.id_sop = c.sop_id AND c.tanggal = CURDATE()
WHERE s.status = 'aktif'
GROUP BY s.divisi_id, s.divisi_nama, s.kategori;
