/**
 * Script untuk upload logo dan branding yang ditemukan ke Cloudinary pondok_informatika
 */

const cloudinary = require('cloudinary').v2;
const path = require('path');

// Destination: pondok_informatika
cloudinary.config({
    cloud_name: 'duntlhjil',
    api_key: '558963412436752',
    api_secret: '-mZP9a9Wn_MVGpIUuPjC071wuew'
});

const TENANT_FOLDER = 'pondok_informatika';
const ROOT = __dirname + '/..';

async function uploadAsset(localPath, publicId, transformations = {}) {
    console.log(`\n📤 Uploading: ${path.basename(localPath)}`);
    console.log(`   To: ${publicId}`);

    try {
        const options = {
            public_id: publicId,
            overwrite: true,
            resource_type: 'image',
            ...transformations
        };

        const result = await cloudinary.uploader.upload(localPath, options);
        console.log(`   ✅ Uploaded: ${result.secure_url}`);
        return result;
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        return null;
    }
}

async function main() {
    console.log('🚀 Uploading logo and branding assets');
    console.log('=====================================');

    // Upload logo.png as branding/logo
    await uploadAsset(
        path.join(ROOT, 'logo.png'),
        `${TENANT_FOLDER}/branding/logo`
    );

    // Upload logo.png as branding/pwa-192 (scaled to 192x192)
    await uploadAsset(
        path.join(ROOT, 'logo.png'),
        `${TENANT_FOLDER}/branding/pwa-192`,
        { transformation: { width: 192, height: 192, crop: 'pad', background: 'white' } }
    );

    // For hero, let's use hero-main from features as it should already be uploaded
    console.log('\n📝 NOTE: pages/hero.webp - menggunakan features/hero-main.png yang sudah ada');
    console.log('   Atau Anda bisa upload hero image manual ke Cloudinary.');

    // Upload hero-main as pages/hero too
    console.log('\n📤 Copying features/hero-main to pages/hero...');

    try {
        // Use Cloudinary's copy feature
        const result = await cloudinary.uploader.upload(
            `https://res.cloudinary.com/duntlhjil/image/upload/pondok_informatika/features/hero-main.png`,
            {
                public_id: `${TENANT_FOLDER}/pages/hero`,
                overwrite: true,
                resource_type: 'image',
                format: 'webp'
            }
        );
        console.log(`   ✅ Copied: ${result.secure_url}`);
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }

    console.log('\n=====================================');
    console.log('🎉 Done!');
}

main().catch(console.error);
