# AI Context - Pesantren Teknologi (Multi-Tenant)

> **Baca file ini dulu.** File lain hanya dibaca jika perlu koordinasi mendalam atau mitigasi masalah teknis.
> 
> ## RULES & PREFERENCES
> - 🎯 **Branch Focus**: Selalu bekerja di branch `dev`. Jangan push ke `main` tanpa instruksi eksplisit.
> - 🚀 **Quick Deploy**: Gunakan `./deploy-dev.sh` atau `./deploy-all.sh` di folder `pisantri-api` untuk deploy cepat.
> - 🚫 **No Screenshots/Recordings**: Do not include screenshots or browser recordings in walkthroughs or responses until explicitly requested by the user.
> - ⚠️ **No Production Testing**: Never perform testing, debugging, or use browser tools on production domains (`pondokinformatika.id`, `api.pondokinformatika.id`). Use development or local environments only.

## QUICK INFO

| Item | Value |
|------|-------|
| Server | `210.79.191.137` (user: `pi` / pass: `Piblajar2020`) |
| DB root | `root` / `1234567890` |
| Frontend | [pondokinformatika.id](https://pondokinformatika.id) |
| Backend | [api.pondokinformatika.id](https://api.pondokinformatika.id) |
| Dev Site | [dev.pondokinformatika.id](https://dev.pondokinformatika.id) |
| Netlify | [pesantrenteknologi.netlify.app](https://pesantrenteknologi.netlify.app) |

## STATUS (18 Jan 2026)

- ✅ **AI Chat**: Full santri data integration (portofolio, tulisan, review, tahfidz, karir alumni)
- ✅ **Alumni Career Tracking**: `tb_alumni_karir` table & API endpoint
- ✅ **UI Refined**: Standardized Pejabat Panel (5-column, square photos)
- ✅ **Dashboard**: Widget deletion feature active

## LATEST CHANGES

- **Pejabat Panel**: Refactor dashboard menggunakan `PejabatPanel` terpusat.
- **Mitigation Docs**: Dokumentasi dipisah menjadi modul teknis untuk keterbacaan tinggi.

---

## TECHNICAL NAVIGATION (MITIGATION)

Jika terjadi kendala teknis atau perlu pemahaman mendalam, buka file berikut:

1.  📄 **[Architecture & Deployment](docs/ARCHITECTURE.md)**: Alur deployment, struktur multi-tenant, dan management asset.
2.  📄 **[Error Handling Standards](docs/ERROR_HANDLING.md)**: Standar validasi, penanganan 401, dan fallback UI.
3.  📄 **[Troubleshooting Guide](docs/TROUBLESHOOTING.md)**: Solusi masalah umum dan panduan debug database tenant.

---
*Note: Dokumen ini dirancang untuk cepat dipahami (simple) namun tetap memiliki link mitigasi yang kuat.*

GEMINI_API_KEY = "AIzaSyBBQQbVPJr8Mv8RSZh7v64wFfaL__9malU"