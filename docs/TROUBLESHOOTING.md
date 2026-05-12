# Troubleshooting & Debugging Guide

## QUICK TROUBLESHOOTING TABLE

| Masalah | Solusi |
|---------|--------|
| CORS error di Dev | Pastikan `config/cors.php` di `api-dev` whitelist `https://dev.pondokinformatika.id`. Clear cache: `php artisan config:clear`. |
| 500 Server Error | Cek logs: `tail -f /var/www/api-dev.pondokinformatika.id/storage/logs/laravel.log`. Jika "Target class [view] does not exist", clear cache bootstrap. |
| Perubahan tidak muncul | Cek apakah deploy ke folder yang benar (`dev` vs `prod`). Hard refresh browser (Cmd+Shift+R). |
| 401 Unauthorized (Multi-Tenant) | Pastikan `X-Tenant-ID` header terkirim. Gunakan `getHeaders()` dari `api.ts`, jangan manual fetch. |
| 500 SQL Column Not Found | Database tenant belum sync. Jalankan migration atau ALTER TABLE manual di database tenant (`pestek`). |
| Mixed Content Error | Logo/image URL dari database masih pakai IP lama. Clear localStorage dan hard refresh browser. |

---

## MULTI-TENANT DEBUGGING (Checklist)

1. [ ] **X-Tenant-ID**: Cek Network Tab -> Request Headers. Apakah `X-Tenant-ID` terkirim?
2. [ ] **DB Sync**: Apakah schema database `pestek` sudah sama dengan `pisantri`?
3. [ ] **Deployment Target**: Apakah Anda sedang mengedit di site Dev tapi cek hasilnya di site Prod?
4. [ ] **Browser Cache**: Hard refresh wajib dilakukan setelah deployment frontend.
5. [ ] **Laravel Cache**: Jika config di VPS tidak berubah, jalankan:
   ```bash
   php artisan cache:clear && php artisan config:clear
   ```

### Contoh Fix DB Sync:
```bash
# Tambahkan kolom yang missing di database tenant
mysql -u root -p -e "ALTER TABLE pestek.tb_review ADD COLUMN score INT NULL AFTER santri_review;"
```
