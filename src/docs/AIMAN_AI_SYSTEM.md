# AIMAN: Asisten AI Pesantren Terdepan di Indonesia
*"Bukan Sekadar Chatbot, Melainkan Santri Digital yang Berkhidmat"*

AIMAN (Aimanudin PI) adalah sistem representasi kecerdasan buatan (AI Manager) yang dirancang khusus untuk memahami dinamika kehidupan pesantren. AIMAN bertindak sebagai jembatan antara data teknis database yang kompleks dengan bahasa natural manusia, memungkinkan interaksi yang cerdas, empatik, dan produktif bagi seluruh stakeholder pesantren.

---

## 💎 1. Filosofi & Karakter: Trilogi Adab (Asah, Asuh, Asih)
AIMAN tidak dirancang sebagai mesin dingin, melainkan sebagai entitas yang tumbuh dalam ekosistem pesantren.

1.  **Asah (Kecerdasan)**: Mampu mengolah ribuan data (Akademik, Hafalan, Keuangan) menjadi informasi yang tajam dan akurat dalam hitungan detik.
2.  **Asuh (Pendampingan)**: Memantau perkembangan santri secara proaktif. Jika ada santri yang hafalannya menurun, AIMAN akan "memberitahu" musyrif untuk memberikan bimbingan khusus.
3.  **Asih (Kasih Sayang/Empati)**: Menggunakan bahasa yang santun, memotivasi, dan penuh doa (misal: *"MasyaAllah, semangat terus hafalannya ya!"* atau *"Alhamdulillah, tabungan kamu aman."*).

---

## 🚀 2. Inovasi Pertama di Indonesia: Eksklusivitas & Kebanggaan
PISANTRI adalah proyek teknologi yang dibangun oleh santri untuk pesantren. AIMAN adalah manifestasi kebanggaan tersebut:
- **Dibuat oleh Santri**: Lahir dari pemahaman mendalam tentang problematika riil di dalam asrama, kelas, dan masjid.
- **Inovasi Pionir**: Belum ada sistem manajemen pesantren lain di Indonesia yang mengintegrasikan LLM (Gemini 1.5 Pro) secara *native* ke dalam operasional harian hingga level SQL Automation.
- **Aiman Sebagai Pembelajar**: AIMAN diibaratkan sebagai "Santri Baru" yang terus belajar dari setiap interaksi, SOP pesantren, dan revisi instruksi yang diberikan oleh pengelola.

---

## 🛠️ 3. Kapabilitas Teknis: Mesin di Balik Layar
AIMAN menggunakan arsitektur **Hybrid-RAG (Retrieval-Augmented Generation)**:

1.  **RAG pada SOP & Dokumen Statis**: AIMAN membaca file PDF/Markdown tentang aturan pesantren (Tatib), SOP perizinan, dan modul belajar.
2.  **Native Database Integration**: Berbeda dengan chatbot biasa, AIMAN memiliki izin untuk melakukan query SQL (dengan konfirmasi) ke tabel-tabel operasional seperti `tb_tahfidz`, `tb_presensi`, dan `tb_santri`.
3.  **Context-Aware Identity**: Sistem mengenali peran (Role) user via JWT. AIMAN tidak akan memberikan data keuangan jika yang bertanya adalah santri.

---

## 👥 4. Matriks Peran & Kemampuan AIMAN

### 4.1 Bagi Santri (Sahabat Digital)
- **Cek Portofolio**: *"Tunjukkan project IT terakhir yang saya buat."*
- **Target Tahfidz**: *"Berapa ayat lagi saya harus setor untuk khatam juz 30?"*
- **Keuangan**: *"Berapa sisa saldo dompet saya hari ini?"*
- **Bantuan Belajar**: Bertanya tentang materi kurikulum di LMS.

### 4.2 Bagi Pengelola & Ustadz (Asisten Produktif)
- **Input Presensi VIA Chat**: Cukup ketik *"Semua hadir kecuali Fulan"* → AIMAN mengonversi ke SQL dan menampilkan preview table untuk di-confirm.
- **Rekap Otomatis**: *"Siapa saja yang belum setor hafalan dalam seminggu terakhir?"*
- **Monitoring Kedisiplinan**: *"Berapa poin sanksi yang diakumulasi oleh santri angkatan 2023?"*
- **Intelejen Asrama**: *"Kamar mana saja yang melaporkan kerusakan AC hari ini?"*

### 4.3 Bagi Orang Tua / Wali (Ketenangan Hati)
- **Status Real-time**: *"Bagaimana kabar anak saya di pondok hari ini?"* (Menampilkan data presensi, kesehatan, dan setoran terbaru).
- **Notifikasi Cerdas**: Mengirim pembaruan otomatis via WhatsApp jika anak meraih prestasi atau sedang sakit.

---

## 🗺️ 5. Breakdown Fitur & Pemetaan Tugas (Mapping)
AIMAN mendukung 150+ fitur fungsional PISANTRI melalui tugas-tugas berikut:

| Modul | Fitur Utama | Tugas Teknis AIMAN | Status |
| :--- | :--- | :--- | :--- |
| **Akademik** | Digital Portfolio | Retrieve & Format Project Links/Images | ✅ Active |
| **Tahfidz** | Monitoring Juz/Ayat | SQL Stats: Progress vs Target | ✅ Active |
| **Keuangan** | Cashless POS | Daily Ledger Summary & Alerts | ✅ Active |
| **Pembinaan** | Smart Permission | Izin Validation & Log Reporting | ✅ Active |
| **Asrama** | Health & Inventory | Complaint Routing & Hospital Logs | 🛠️ In Dev |
| **Input Data** | Voice-to-SQL | NLP Entity Extraction for Attendance | 🚀 Roadmap |

---

## 🔐 6. Keamanan & Privasi
- **Zero-Trust Multi-Tenancy**: Data antar pesantren terisolasi total.
- **Manual Confirmation**: Untuk setiap aksi penulisan data (Update/Insert via AI), user wajib mengonfirmasi dengan mengetik "Ya/Iya".
- **Audit Trail**: Setiap query yang dihasilkan AI dicatat dalam `activity_log` untuk pertanggungjawaban.

---
*AIMAN: Membangun masa depan pesantren dengan akal dan adab.*
