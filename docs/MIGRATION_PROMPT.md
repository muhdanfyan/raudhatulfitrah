# Prompt: Generate Full Laravel Migrations

> Gunakan prompt ini untuk AI assistant lain atau untuk referensi manual

---

## Context

Project: Pisantri V2 (Laravel 12 Backend)
Database: MySQL
Status: 117 existing tables, need full migration files

---

## Prompt Template

```
Saya punya database MySQL dengan 117 tabel yang sudah ada. 
Saya ingin generate migration files untuk semua tabel ini agar bisa di-clone ke database baru.

Langkah yang perlu dilakukan:

1. **Install package migration generator:**
   composer require --dev kitloong/laravel-migrations-generator

2. **Generate migrations dari database existing:**
   php artisan migrate:generate --path=database/migrations/generated
   *Ekspektasi: Struktur tabel yang dihasilkan harus identik dengan skema MySQL (data types, indexes, foreign keys, default values, auto-increment, dll).*

3. **Review dan fix foreign key order:**
   - Pastikan tabel parent dibuat sebelum child
   - Split migration jika ada circular dependency

4. **Buat seeder untuk data default:**

### Seeder: DatabaseSeeder.php

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Group;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Groups
        $groups = [
            ['id' => 1, 'name' => 'admin', 'description' => 'Administrator'],
            ['id' => 2, 'name' => 'akademik', 'description' => 'Akademik'],
            ['id' => 3, 'name' => 'santri', 'description' => 'Santri'],
            ['id' => 4, 'name' => 'ortu', 'description' => 'Orang Tua'],
        ];
        
        foreach ($groups as $group) {
            Group::updateOrCreate(['id' => $group['id']], $group);
        }

        // Default Users
        $users = [
            [
                'name' => 'Administrator',
                'email' => 'admin@admin.com',
                'password' => Hash::make('password123'),
                'group_id' => 1,
            ],
            [
                'name' => 'Akademik',
                'email' => 'akademik@admin.com',
                'password' => Hash::make('password123'),
                'group_id' => 2,
            ],
            [
                'name' => 'Santri Demo',
                'email' => 'santri@demo.com',
                'password' => Hash::make('password123'),
                'group_id' => 3,
            ],
            [
                'name' => 'Orang Tua Demo',
                'email' => 'ortu@demo.com',
                'password' => Hash::make('password123'),
                'group_id' => 4,
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(['email' => $user['email']], $user);
        }
    }
}
```

5. **Test migration & seed:**
   php artisan migrate:fresh --seed
   *Catatan: Gunakan `migrate:fresh` untuk menghapus semua tabel lama dan membuat ulang dari nol. Jika menggunakan `migrate` biasa, Laravel akan melewati file yang sudah tercatat di tabel `migrations` atau error jika tabel fisik sudah ada tetapi belum tercatat.*

6. **Verifikasi:**
   - Semua 117+ tabel terbuat dengan struktur yang 100% sama dengan source
   - Foreign keys benar dan tidak ada error constraint
   - Default users bisa login
```

---

## Execution Command (di VPS)

```bash
cd /var/www/pisantri-api

# Install generator
composer require --dev kitloong/laravel-migrations-generator

# Generate migrations
php artisan migrate:generate --path=database/migrations/generated

# Move to main migrations folder
mv database/migrations/generated/* database/migrations/

# Test (Gunakan database terpisah untuk verifikasi struktur)
php artisan migrate:fresh --seed --database=test_tenant
```

---

## Expected Result

- **File Migration:** 117+ file di `database/migrations/`.
- **Integritas Skema:** Struktur tabel (column types, lengths, nullable, defaults, indexes) sesuai dengan database MySQL original.
- **Behavior:** Migration tidak akan terskip pada database baru (kosong). Pada database existing, disarankan menggunakan `migrate:fresh` agar skema benar-benar sinkron (clean install).
- **Seeder:** DatabaseSeeder dengan default users siap pakai.
- **Command:** `php artisan migrate:fresh --seed` berhasil tanpa error foreign key.

---

*Created: 18 Des 2025*
