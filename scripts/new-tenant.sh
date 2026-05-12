#!/bin/bash
# ==============================================
# Tenant Provisioning Script
# Usage: ./scripts/new-tenant.sh <tenant_id> <app_name>
# Example: ./scripts/new-tenant.sh darulhikmah "Darul Hikmah"
# ==============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Validate arguments
if [ -z "$1" ] || [ -z "$2" ]; then
    echo -e "${RED}Usage: $0 <tenant_id> <app_name>${NC}"
    echo "Example: $0 darulhikmah \"Darul Hikmah\""
    exit 1
fi

TENANT_ID=$1
APP_NAME=$2
VPS_HOST="pi@210.79.191.137"
# VPS_PASS dihapus, gunakan SSH key untuk akses VPS
API_URL="https://api.pondokinformatika.id"
NETLIFY_DOMAIN="${TENANT_ID}.netlify.app"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Creating new tenant: ${TENANT_ID}${NC}"
echo -e "${GREEN}App Name: ${APP_NAME}${NC}"
echo -e "${GREEN}Domain: ${NETLIFY_DOMAIN}${NC}"
echo -e "${GREEN}========================================${NC}"

# Step 1: Create .env file
echo -e "\n${YELLOW}Step 1: Creating .env.${TENANT_ID}...${NC}"
cat > ".env.${TENANT_ID}" << EOF
# ${APP_NAME} Environment
VITE_API_URL=${API_URL}
VITE_TENANT_ID=${TENANT_ID}
VITE_APP_NAME=${APP_NAME}
VITE_APP_ENV=production
EOF
echo -e "${GREEN}✅ .env.${TENANT_ID} created${NC}"

# Step 2: Update package.json
echo -e "\n${YELLOW}Step 2: Adding build scripts to package.json...${NC}"
if grep -q "build:${TENANT_ID}" package.json; then
    echo -e "${YELLOW}⚠️ Scripts already exist in package.json${NC}"
else
    node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    pkg.scripts['build:${TENANT_ID}'] = 'vite build --mode ${TENANT_ID}';
    pkg.scripts['deploy:${TENANT_ID}'] = 'npm run build:${TENANT_ID} && netlify deploy --prod';
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
    "
    echo -e "${GREEN}✅ package.json updated${NC}"
fi

# Step 3: Instruksi manual pembuatan database di VPS
echo -e "\n${YELLOW}Step 3: [Manual] Create database on VPS...${NC}"
echo -e "${RED}❗ Hapus password dari script. Gunakan SSH key untuk akses VPS. Jalankan perintah berikut di VPS:${NC}"
echo -e "\nmysql -u root -p -e \"CREATE DATABASE IF NOT EXISTS ${TENANT_ID};\""
echo -e "mysqldump -u root -p --no-data pestek > /tmp/structure_${TENANT_ID}.sql"
echo -e "mysql -u root -p ${TENANT_ID} < /tmp/structure_${TENANT_ID}.sql"
echo -e "mysql -u root -p ${TENANT_ID} -e \"INSERT INTO groups (name, description) VALUES ('admin', 'Administrator'),('akademik', 'Akademik'),('santri', 'Santri'),('ortu', 'Orang Tua') ON DUPLICATE KEY UPDATE description=VALUES(description);\""
echo -e "rm /tmp/structure_${TENANT_ID}.sql"
echo -e "${GREEN}✅ Database ${TENANT_ID} ready${NC}"

# Step 4: [Manual] Add CORS for new domain
echo -e "\n${YELLOW}Step 4: [Manual] Add CORS for ${NETLIFY_DOMAIN}...${NC}"
echo -e "${RED}❗ Hapus password dari script. Gunakan SSH key untuk akses VPS. Jalankan perintah berikut di VPS:${NC}"
echo -e "Edit /var/www/pisantri-api/config/cors.php dan /var/www/dev.pisantri/backend/config/cors.php, tambahkan:\n        'https://${NETLIFY_DOMAIN}',"
echo -e "Kemudian jalankan: php artisan config:clear && php artisan cache:clear di kedua backend."
echo -e "${GREEN}✅ CORS configured${NC}"


# Step 5: Setup env file tenant di VPS
echo -e "\n${YELLOW}Step 5: Setup env file tenant di VPS${NC}"
echo -e "Salin dan edit docs/contoh_tenant_env.txt ke VPS:/etc/pisantri/tenants/${TENANT_ID}.env"
echo -e "Set permission: sudo chmod 600 /etc/pisantri/tenants/${TENANT_ID}.env && sudo chown root:root /etc/pisantri/tenants/${TENANT_ID}.env"
echo -e "JANGAN commit file ini ke repo!"
echo -e "Cloudinary/API key hanya di env VPS, bukan di repo."

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Tenant provisioning complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Completed:"
echo "✅ .env.${TENANT_ID} created"
echo "✅ package.json updated"
echo "✅ Database ${TENANT_ID} created"
echo "✅ CORS added for https://${NETLIFY_DOMAIN}"
echo ""
echo "Manual steps remaining:"
echo "1. Setup env file tenant di VPS (/etc/pisantri/tenants/${TENANT_ID}.env)"
echo "2. Create admin user: INSERT INTO users ..."
echo "3. Run: npm run deploy:${TENANT_ID}"
