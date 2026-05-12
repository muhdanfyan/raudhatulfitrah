-- =====================================================
-- SEED: Aktivitas Harian Pondok Informatika
-- Database: pisantri
-- Date: 2026-01-03
-- =====================================================

-- Pastikan tabel sudah dibuat terlebih dahulu
-- Source: aktivitas_harian_migration.sql

-- SEED DATA: Pondok Informatika Daily Routine
-- divisi_id mapping (sesuaikan dengan tb_jabatan):
-- Akademik = 10, Pembinaan = 8, Asrama = 9

INSERT INTO tb_aktivitas_harian 
  (nama_aktivitas, icon, deskripsi, urutan, waktu_mulai, waktu_selesai, divisi_id, divisi_nama, warna, program_santri) 
VALUES

-- 1. Bangun (03:30 - 04:00) - ASRAMA
('Bangun', '🌅', 'Bangun dan siapkan diri untuk memulai hari!', 1, '03:30:00', '04:00:00', 9, 'Asrama', '#F59E0B', '["mondok"]'),

-- 2. Sholat Layl, Shubuh, Setor Hafalan (04:00 - 05:30) - PEMBINAAN
('Sholat Layl, Shubuh, Setor Hafalan', '🌙', 'Sholat Layl (min. 3 rakaat).\nSholat Shubuh tanpa terlambat takbiratul Ula.\nSetor minimal 3 baris hafalan baru.', 2, '04:00:00', '05:30:00', 8, 'Pembinaan', '#8B5CF6', '["mondok"]'),

-- 3. Tahsin + Briefing I (05:30 - 06:30) - AKADEMIK
('Tahsin + Briefing I', '📖', 'Tahsin dan Briefing (Laporan Target Belajar).\nBahas target belajar harian.', 3, '05:30:00', '06:30:00', 10, 'Akademik', '#3B82F6', '["mondok"]'),

-- 4. Stretching, Bersih-Bersih (06:30 - 07:30) - ASRAMA
('Stretching, Bersih-Bersih', '💪', 'Pemanasan (Stretching).\nBersih-bersih tugas amanah.', 4, '06:30:00', '07:30:00', 9, 'Asrama', '#10B981', '["mondok"]'),

-- 5. Waktu Produktif I - Focus (07:30 - 11:30) - AKADEMIK
('Waktu Produktif I (Focus)', '🎯', 'Kejar target belajar (3 jam belajar).\nQoylula (tidur siang) jika sudah mencapai target.', 5, '07:30:00', '11:30:00', 10, 'Akademik', '#EF4444', '["mondok","reguler"]'),

-- 6. Qoylula, Sholat Zhuhur (11:30 - 13:00) - PEMBINAAN
('Qoylula, Sholat Zhuhur', '😴', 'Istirahat (min. 3 jam belajar di pagi).\nSholat Zhuhur tanpa ketinggalan takbiratul Ula.', 6, '11:30:00', '13:00:00', 8, 'Pembinaan', '#6366F1', '["mondok"]'),

-- 7. Waktu Produktif II - OpenDiscuss (13:00 - 15:00) - AKADEMIK
('Waktu Produktif II (OpenDiscuss)', '🚀', 'OpenDiscuss: laporan hasil belajar dan diskusi.\nSelesaikan target belajar (total 4 jam).', 7, '13:00:00', '15:00:00', 10, 'Akademik', '#F97316', '["mondok","reguler"]'),

-- 8. Sampai Waktu Ashar (15:00 - 15:30) - AKADEMIK
('Sampai Waktu Ashar', '🌅', 'Lanjutkan belajar hingga Ashar.', 8, '15:00:00', '15:30:00', 10, 'Akademik', '#FBBF24', '["mondok","reguler"]'),

-- 9. Ashar + Istirahat (15:30 - 17:00) - PEMBINAAN
('Ashar + Istirahat', '🙏', 'Sholat Ashar.\nIstirahat sejenak.', 9, '15:30:00', '17:00:00', 8, 'Pembinaan', '#A855F7', '["mondok"]'),

-- 10. Maghrib + Murajaah (17:00 - 18:30) - PEMBINAAN
('Maghrib + Murajaah', '🌄', 'Sholat Maghrib.\nMurajaah (min. 1 halaman).', 10, '17:00:00', '18:30:00', 8, 'Pembinaan', '#EC4899', '["mondok"]'),

-- 11. Tahsin + Briefing II (18:30 - 19:30) - AKADEMIK
('Tahsin + Briefing II', '📖', 'Sesi Curhat dan cek progress belajar.\nHitung shalat sunnah rawatib dan hafalan.', 11, '18:30:00', '19:30:00', 10, 'Akademik', '#14B8A6', '["mondok"]'),

-- 12. Istirahat (19:30 - 20:00) - ASRAMA
('Istirahat', '😌', 'Istirahat sebentar.', 12, '19:30:00', '20:00:00', 9, 'Asrama', '#64748B', '["mondok"]'),

-- 13. Forum Malam (20:00 - 21:00) - ASRAMA
('Forum Malam', '🌌', 'Forum untuk bahas persoalan asrama.', 13, '20:00:00', '21:00:00', 9, 'Asrama', '#1E40AF', '["mondok"]'),

-- 14. Siap-siap Tidur (21:00 - 22:00) - ASRAMA
('Siap-siap Tidur', '🌙', 'Persiapan tidur.\n\nSelamat menjalani kegiatan harian dengan semangat! 🌟', 14, '21:00:00', '22:00:00', 9, 'Asrama', '#4C1D95', '["mondok"]');

-- =====================================================
-- SEED: Dashboard Kepsek Config
-- =====================================================

INSERT INTO tb_dashboard_kepsek_config 
  (widget_name, widget_title, widget_icon, widget_type, widget_size, urutan, is_visible, config_json)
VALUES
('aktivitas_sekarang', 'Aktivitas Sekarang', '⏰', 'stat', 'full', 1, 1, '{"show_countdown": true, "show_next": true}'),
('statistik_santri', 'Statistik Santri', '👥', 'stat', 'small', 2, 1, '{"show_by_program": true}'),
('presensi_hari_ini', 'Presensi Hari Ini', '📋', 'chart', 'medium', 3, 1, '{"chart_type": "donut"}'),
('progress_tahfidz', 'Progress Tahfidz', '📖', 'chart', 'medium', 4, 1, '{"show_top_5": true}'),
('keuangan_ringkas', 'Keuangan', '💰', 'stat', 'small', 5, 1, '{"show_trend": true}'),
('pelanggaran_terkini', 'Pelanggaran Terkini', '⚠️', 'list', 'medium', 6, 1, '{"limit": 5}'),
('ibadah_harian', 'Ibadah Harian', '🕌', 'chart', 'medium', 7, 1, '{"metrics": ["sholat","rawatib","tahajud"]}'),
('kinerja_divisi', 'Kinerja Divisi', '📊', 'chart', 'large', 8, 1, '{"compare_weekly": true}'),
('ppdb_status', 'Status PPDB', '🎓', 'stat', 'small', 9, 1, '{"show_funnel": true}'),
('agenda_mendatang', 'Agenda Mendatang', '📅', 'calendar', 'medium', 10, 1, '{"days_ahead": 7}');

-- =====================================================
-- SEED: Tupoksi Kepala Sekolah
-- =====================================================

INSERT INTO tb_tupoksi_kepsek 
  (nama_tupoksi, deskripsi, icon, kategori, frekuensi, dashboard_widget, urutan)
VALUES
('Monitor Kehadiran Santri', 'Memantau kehadiran santri secara harian melalui data presensi', '📋', 'monitoring', 'harian', 'presensi_hari_ini', 1),
('Evaluasi Kinerja Divisi', 'Mengevaluasi kinerja setiap divisi (akademik, pembinaan, asrama)', '📊', 'evaluasi', 'mingguan', 'kinerja_divisi', 2),
('Laporan Progress Tahfidz', 'Memantau progress hafalan Al-Quran seluruh santri', '📖', 'monitoring', 'mingguan', 'progress_tahfidz', 3),
('Pengawasan Keuangan', 'Mengawasi arus kas, pemasukan, dan pengeluaran pondok', '💰', 'monitoring', 'harian', 'keuangan_ringkas', 4),
('Penanganan Pelanggaran', 'Menindaklanjuti pelanggaran tata tertib yang serius', '⚠️', 'keputusan', 'insidental', 'pelanggaran_terkini', 5),
('Monitoring PPDB', 'Memantau proses penerimaan santri baru', '🎓', 'monitoring', 'harian', 'ppdb_status', 6),
('Evaluasi Ibadah', 'Mengevaluasi pelaksanaan ibadah harian santri', '🕌', 'evaluasi', 'mingguan', 'ibadah_harian', 7),
('Laporan Bulanan', 'Menyusun dan mereview laporan bulanan pondok', '📝', 'pelaporan', 'bulanan', NULL, 8),
('Rapat Koordinasi', 'Memimpin rapat koordinasi dengan seluruh divisi', '👥', 'keputusan', 'mingguan', NULL, 9),
('Monitor Aktivitas Harian', 'Memantau pelaksanaan aktivitas harian sesuai jadwal', '⏰', 'monitoring', 'harian', 'aktivitas_sekarang', 10);

-- =====================================================
-- UPDATE: Tambah icon ke menu asrama di tb_setting atau config
-- (Jika ada tabel setting menu, tambahkan di sini)
-- =====================================================

-- Contoh jika ada tabel tb_menu:
-- UPDATE tb_menu SET icon = '🏠' WHERE nama_menu = 'Asrama';
-- UPDATE tb_menu SET icon = '📦' WHERE nama_menu = 'Inventaris';
-- UPDATE tb_menu SET icon = '🧹' WHERE nama_menu = 'Piket';
-- UPDATE tb_menu SET icon = '💰' WHERE nama_menu = 'Keuangan';
-- UPDATE tb_menu SET icon = '❤️' WHERE nama_menu = 'Donatur';
