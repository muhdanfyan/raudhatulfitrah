/**
 * Script untuk upload branding assets ke Cloudinary pondok_informatika
 * 
 * Cara pakai: node scripts/upload-branding.cjs
 */

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Destination: pondok_informatika
cloudinary.config({
    cloud_name: 'duntlhjil',
    api_key: '558963412436752',
    api_secret: '-mZP9a9Wn_MVGpIUuPjC071wuew'
});

const TENANT_FOLDER = 'pondok_informatika';

// Assets to upload
const ASSETS = [
    {
        localPath: path.join(__dirname, '../public/images/og-preview.png'),
        publicId: `${TENANT_FOLDER}/branding/og-image`
    },
    // Use og-preview for both branding needs
    {
        localPath: path.join(__dirname, '../public/images/ppdb.png'),
        publicId: `${TENANT_FOLDER}/pages/ppdb`
    }
];

async function uploadAsset(localPath, publicId) {
    console.log(`\n📤 Uploading: ${path.basename(localPath)}`);
    console.log(`   To: ${publicId}`);

    if (!fs.existsSync(localPath)) {
        console.log(`   ❌ File not found: ${localPath}`);
        return null;
    }

    try {
        const result = await cloudinary.uploader.upload(localPath, {
            public_id: publicId,
            overwrite: true,
            resource_type: 'image'
        });
        console.log(`   ✅ Uploaded: ${result.secure_url}`);
        return result;
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        return null;
    }
}

async function main() {
    console.log('🚀 Uploading branding assets to Cloudinary');
    console.log('==========================================');
    console.log(`Destination: duntlhjil (${TENANT_FOLDER})`);
    console.log('==========================================');

    let success = 0;
    let failed = 0;

    for (const asset of ASSETS) {
        const result = await uploadAsset(asset.localPath, asset.publicId);
        if (result) {
            success++;
        } else {
            failed++;
        }
    }

    console.log('\n==========================================');
    console.log(`✅ Success: ${success}`);
    console.log(`❌ Failed: ${failed}`);
    console.log('\n⚠️  ASSETS YANG MASIH PERLU DIUPLOAD:');
    console.log('   - branding/logo.png');
    console.log('   - branding/pwa-192.png');
    console.log('   - pages/hero.webp');
    console.log('\n💡 Upload manual di: https://console.cloudinary.com');
    console.log('==========================================');
}

main().catch(console.error);
