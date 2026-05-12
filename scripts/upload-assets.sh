#!/bin/bash
# Upload Tenant Assets to Cloudinary
# Usage: ./upload-assets.sh <tenant_id>

TENANT_ID=${1:-pestek}
CLOUDINARY_URL="cloudinary://263724197527528:K2sZ4Ut8kTDG96hPDqGQhtpDlNk@dbthxcpdz"

echo "📤 Uploading static assets for tenant: $TENANT_ID"
echo "☁️  Cloudinary: dbthxcpdz"
echo ""

# Check if cloudinary CLI is installed
if ! command -v cloudinary &> /dev/null; then
    echo "⚠️  Cloudinary CLI not found. Installing..."
    npm install -g cloudinary-cli
fi

echo "1️⃣  Uploading branding assets..."
echo "   → logo.png"
cloudinary uploader upload public/logo.png \
  --public-id "$TENANT_ID/branding/logo" \
  --overwrite true \
  --cloudinary-url "$CLOUDINARY_URL"

echo "   → og-image.png"
cloudinary uploader upload public/og-image.png \
  --public-id "$TENANT_ID/branding/og-image" \
  --overwrite true \
  --cloudinary-url "$CLOUDINARY_URL"

echo "   → og-image.webp"
cloudinary uploader upload public/og-image.webp \
  --public-id "$TENANT_ID/branding/og-image" \
  --overwrite true \
  --format webp \
  --cloudinary-url "$CLOUDINARY_URL"

echo "   → pwa-192x192.png"
cloudinary uploader upload public/pwa-192x192.png \
  --public-id "$TENANT_ID/branding/pwa-192" \
  --overwrite true \
  --cloudinary-url "$CLOUDINARY_URL"

echo "   → pwa-512x512.png"
cloudinary uploader upload public/pwa-512x512.png \
  --public-id "$TENANT_ID/branding/pwa-512" \
  --overwrite true \
  --cloudinary-url "$CLOUDINARY_URL"

echo ""
echo "2️⃣  Uploading page assets..."
echo "   → hero-image.webp"
cloudinary uploader upload public/hero-image.webp \
  --public-id "$TENANT_ID/pages/hero" \
  --overwrite true \
  --format webp \
  --cloudinary-url "$CLOUDINARY_URL"

echo "   → hero-image.png"
cloudinary uploader upload public/hero-image.png \
  --public-id "$TENANT_ID/pages/hero" \
  --overwrite true \
  --cloudinary-url "$CLOUDINARY_URL"

echo "   → about-image.webp"
cloudinary uploader upload public/about-image.webp \
  --public-id "$TENANT_ID/pages/about" \
  --overwrite true \
  --format webp \
  --cloudinary-url "$CLOUDINARY_URL"

echo "   → about-image.png"
cloudinary uploader upload public/about-image.png \
  --public-id "$TENANT_ID/pages/about" \
  --overwrite true \
  --cloudinary-url "$CLOUDINARY_URL"

echo "   → ppdb.png"
cloudinary uploader upload public/ppdb.png \
  --public-id "$TENANT_ID/pages/ppdb" \
  --overwrite true \
  --cloudinary-url "$CLOUDINARY_URL"

echo ""
echo "3️⃣  Uploading feature images..."
for img in public/images/digital-pesantren/*.png; do
  filename=$(basename "$img" .png)
  echo "   → $filename.png"
  cloudinary uploader upload "$img" \
    --public-id "$TENANT_ID/features/$filename" \
    --overwrite true \
    --cloudinary-url "$CLOUDINARY_URL"
done

echo ""
echo "✅ Upload complete!"
echo ""
echo "📋 Assets uploaded to Cloudinary:"
echo "   Branding: https://res.cloudinary.com/dbthxcpdz/image/upload/$TENANT_ID/branding/"
echo "   Pages: https://res.cloudinary.com/dbthxcpdz/image/upload/$TENANT_ID/pages/"
echo "   Features: https://res.cloudinary.com/dbthxcpdz/image/upload/$TENANT_ID/features/"
echo ""
echo "🔗 Usage in code:"
echo "   import { getStaticAsset } from '@/utils/imageUtils';"
echo "   getStaticAsset('logo.png', 'branding')"
echo ""
