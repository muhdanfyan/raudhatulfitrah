# Role Management - Terminal CLI Prompts

> Backend sudah selesai. Prompt ini untuk FRONTEND + VPS deploy.

## STATUS
- ✅ Backend: Controllers, Migrations, Seeders, Routes
- ⏳ Frontend: Tab Widgets, Menu, Fitur
- ⏳ VPS: Belum migrate & seed

## BACKEND ROUTES (sudah ada di api.php line 671-700)
```
GET    /api/roles/{id}/widgets      → WidgetMappingController@index
POST   /api/roles/{id}/widgets      → WidgetMappingController@store
GET    /api/roles/{id}/menus        → MenuStructureController@index
POST   /api/roles/{id}/menus        → MenuStructureController@store
PUT    /api/roles/{id}/menus/reorder → MenuStructureController@reorder
GET    /api/roles/{id}/features     → FeatureAccessController@index
POST   /api/roles/{id}/features     → FeatureAccessController@store
GET    /api/me/features             → FeatureAccessController@myFeatures
```

## CONTEXT FILES
```bash
cat /home/pi/pisantri/GEMINI.md
cat /var/www/api-dev.pondokinformatika.id/routes/api.php | grep -A30 "ROLE MANAGEMENT"
```

---

## STEP 1: DEPLOY BACKEND KE VPS

```
ssh pi@210.79.191.137

cd /var/www/api-dev.pondokinformatika.id
git pull origin dev
php artisan migrate
php artisan db:seed --class=RoleWidgetsSeeder
php artisan db:seed --class=RoleMenusSeeder
php artisan db:seed --class=RoleFeaturesSeeder
php artisan cache:clear

# Verify
mysql -u root -p1234567890 pisantri -e "SELECT COUNT(*) as widgets FROM role_widgets; SELECT COUNT(*) as menus FROM role_menus; SELECT COUNT(*) as features FROM role_features;"
```

---

## STEP 2: FRONTEND - TAB WIDGETS

```
Target Repo: pisantriv2 branch dev
Target File: src/pages/UserPage.tsx

EXISTING (jangan ubah):
- Line 5: type TabType = 'users' | 'roles';
- Tab Users dan Roles sudah ada

UBAH:
- Line 5: type TabType = 'users' | 'roles' | 'widgets' | 'menus' | 'features';

TAMBAH FILE BARU:
- src/components/WidgetGridEditor.tsx

INSTALL:
npm i react-grid-layout @types/react-grid-layout

TASK di UserPage.tsx:
1. Tambah import: import WidgetGridEditor from '../components/WidgetGridEditor';
2. Tambah tab button "📊 Widgets" di baris ~730 (setelah tab Roles)
3. Tambah conditional render {activeTab === 'widgets' && <WidgetGridEditor />}

TASK WidgetGridEditor.tsx:
- Props: none
- State: selectedRoleId, widgets, loading
- Fetch: GET ${API_URL}/roles/{id}/widgets
- UI: Dropdown role, Grid dengan react-grid-layout, Checkbox enable
- Save: POST ${API_URL}/roles/{id}/widgets
```

---

## STEP 3: FRONTEND - TAB MENU

```
Target File: src/pages/UserPage.tsx, src/components/Layout.tsx

TAMBAH FILE BARU:
- src/components/MenuTreeEditor.tsx

INSTALL:
npm i @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

TASK di UserPage.tsx:
1. Tambah import MenuTreeEditor
2. Tambah tab button "📋 Menu"
3. Tambah conditional render {activeTab === 'menus' && <MenuTreeEditor />}

TASK MenuTreeEditor.tsx:
- Fetch: GET ${API_URL}/roles/{id}/menus
- UI: Tree view nested, DND sortable
- Modal: Add/Edit menu (label, href, icon, parent)
- Save: POST ${API_URL}/roles/{id}/menus
- Reorder: PUT ${API_URL}/roles/{id}/menus/reorder

TASK Layout.tsx (line 215-385):
- Existing: const menuItems: Record<string, MenuItem[]> = { ... } (hardcoded)
- Ubah: fetch dari API /api/roles/{roleId}/menus
- Fallback: gunakan hardcoded jika API gagal
```

---

## STEP 4: FRONTEND - TAB FITUR

```
Target File: src/pages/UserPage.tsx, src/contexts/AuthContext.tsx

TAMBAH FILE BARU:
- src/components/FeatureAccessEditor.tsx

TASK di UserPage.tsx:
1. Tambah import FeatureAccessEditor
2. Tambah tab button "🔐 Fitur"
3. Tambah conditional render {activeTab === 'features' && <FeatureAccessEditor />}

TASK FeatureAccessEditor.tsx:
- Fetch: GET ${API_URL}/roles/{id}/features
- UI: Table dengan columns: Feature | Read ☑ | Write ☑ | Delete ☑
- Save: POST ${API_URL}/roles/{id}/features

Feature Keys:
data_santri, tahfidz, presensi, ibadah, tatib, lms, roadmap, rapor, keuangan, inventaris, piket, koperasi, ppdb, settings, users

TASK AuthContext.tsx:
- Existing: interface User { id, name, email, role, ... }
- Tambah: features?: Record<string, { can_read: boolean, can_write: boolean, can_delete: boolean }>
- Fetch: GET ${API_URL}/me/features setelah login success
- Export helper: hasFeature(key: string, permission: 'read'|'write'|'delete'): boolean
```

---

## STEP 5: DEPLOY FRONTEND

```
cd pisantriv2
git add .
git commit -m "feat: add Role Management UI (widgets, menu, features tabs)"
git push origin dev

# GitHub Actions akan build otomatis ke dev.pondokinformatika.id
```

---

## FILE CHANGES SUMMARY

| File | Action | Line |
|------|--------|------|
| `UserPage.tsx` | MODIFY | Line 5 (TabType), Line 730+ (tabs) |
| `WidgetGridEditor.tsx` | NEW | - |
| `MenuTreeEditor.tsx` | NEW | - |
| `FeatureAccessEditor.tsx` | NEW | - |
| `Layout.tsx` | MODIFY | Line 215-385 (menuItems) |
| `AuthContext.tsx` | MODIFY | User interface, login flow |

## TAB FINAL
```
[👥 Users] [🛡️ Roles] [📊 Widgets] [📋 Menu] [🔐 Fitur]
   EXIST      EXIST       NEW         NEW       NEW
```
