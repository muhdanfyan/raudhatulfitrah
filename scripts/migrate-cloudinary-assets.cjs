/**
 * Script untuk migrasi assets dari Cloudinary pestek ke pondok_informatika
 * 
 * Cara pakai:
 * 1. npm install cloudinary node-fetch@2
 * 2. node scripts/migrate-cloudinary-assets.js
 */

const cloudinary = require('cloudinary').v2;
const https = require('https');
const fs = require('fs');
const path = require('path');

// Source: pestek
const SOURCE_CONFIG = {
    cloud_name: 'dbthxcpdz',
    api_key: '263724197527528',
    api_secret: 'MjeAcG7GzDvGyvs2YTGF3AJWmTo',
    tenant_folder: 'pestek'
};

// Destination: pondok_informatika
const DEST_CONFIG = {
    cloud_name: 'duntlhjil',
    api_key: '558963412436752',
    api_secret: '-mZP9a9Wn_MVGpIUuPjC071wuew',
    tenant_folder: 'pondok_informatika'
};

// Daftar assets yang perlu dimigrasi
const ASSETS_TO_MIGRATE = [
    // Branding
    { folder: 'branding', file: 'logo.png' },
    { folder: 'branding', file: 'pwa-192.png' },
    { folder: 'branding', file: 'og-image.png' },

    // Pages
    { folder: 'pages', file: 'hero.webp' },
    { folder: 'pages', file: 'ppdb.png' },
    { folder: 'pages', file: 'about.webp' },

    // Features
    { folder: 'features', file: 'feature-tahfidz.png' },
    { folder: 'features', file: 'feature-lms.png' },
    { folder: 'features', file: 'feature-wali-santri.png' },
    { folder: 'features', file: 'feature-portfolio.png' },
    { folder: 'features', file: 'feature-presensi.png' },
    { folder: 'features', file: 'feature-koperasi.png' },
    { folder: 'features', file: 'hero-main.png' },
    { folder: 'features', file: 'dashboard-coding.png' },
    { folder: 'features', file: 'tech-bg.png' },
];

// Temporary directory for downloaded files
const TEMP_DIR = path.join(__dirname, '../temp_assets');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Download file from URL
 */
function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destPath);
        https.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                // Follow redirect
                https.get(response.headers.location, (res) => {
                    res.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        resolve(destPath);
                    });
                }).on('error', reject);
            } else if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve(destPath);
                });
            } else {
                reject(new Error(`HTTP ${response.statusCode}: Failed to download ${url}`));
            }
        }).on('error', reject);
    });
}

/**
 * Get source URL from pestek Cloudinary
 */
function getSourceUrl(folder, file) {
    // Remove extension for public_id
    const fileWithoutExt = file.replace(/\.[^/.]+$/, '');
    const ext = file.split('.').pop();

    return `https://res.cloudinary.com/${SOURCE_CONFIG.cloud_name}/image/upload/${SOURCE_CONFIG.tenant_folder}/${folder}/${fileWithoutExt}.${ext}`;
}

/**
 * Upload file to destination Cloudinary
 */
async function uploadToDestination(localPath, folder, file) {
    // Configure for destination
    cloudinary.config({
        cloud_name: DEST_CONFIG.cloud_name,
        api_key: DEST_CONFIG.api_key,
        api_secret: DEST_CONFIG.api_secret
    });

    // Remove extension from file for public_id
    const fileWithoutExt = file.replace(/\.[^/.]+$/, '');
    const publicId = `${DEST_CONFIG.tenant_folder}/${folder}/${fileWithoutExt}`;

    try {
        const result = await cloudinary.uploader.upload(localPath, {
            public_id: publicId,
            overwrite: true,
            resource_type: 'image'
        });
        return result;
    } catch (error) {
        throw error;
    }
}

/**
 * Migrate single asset
 */
async function migrateAsset(folder, file) {
    const sourceUrl = getSourceUrl(folder, file);
    const localPath = path.join(TEMP_DIR, `${folder}_${file}`);

    console.log(`\n📥 Downloading: ${folder}/${file}`);
    console.log(`   From: ${sourceUrl}`);

    try {
        // Download from source
        await downloadFile(sourceUrl, localPath);
        console.log(`   ✅ Downloaded to temp`);

        // Upload to destination
        console.log(`📤 Uploading to ${DEST_CONFIG.cloud_name}...`);
        const result = await uploadToDestination(localPath, folder, file);
        console.log(`   ✅ Uploaded: ${result.secure_url}`);

        // Clean up temp file
        fs.unlinkSync(localPath);

        return { success: true, file: `${folder}/${file}`, url: result.secure_url };
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        return { success: false, file: `${folder}/${file}`, error: error.message };
    }
}

/**
 * Main migration function
 */
async function main() {
    console.log('🚀 Starting Cloudinary Asset Migration');
    console.log('=====================================');
    console.log(`Source: ${SOURCE_CONFIG.cloud_name} (${SOURCE_CONFIG.tenant_folder})`);
    console.log(`Destination: ${DEST_CONFIG.cloud_name} (${DEST_CONFIG.tenant_folder})`);
    console.log(`Assets to migrate: ${ASSETS_TO_MIGRATE.length}`);
    console.log('=====================================\n');

    const results = {
        success: [],
        failed: []
    };

    for (const asset of ASSETS_TO_MIGRATE) {
        const result = await migrateAsset(asset.folder, asset.file);
        if (result.success) {
            results.success.push(result);
        } else {
            results.failed.push(result);
        }
    }

    // Clean up temp directory
    try {
        fs.rmdirSync(TEMP_DIR);
    } catch (e) {
        // Ignore if not empty
    }

    // Print summary
    console.log('\n=====================================');
    console.log('📊 MIGRATION SUMMARY');
    console.log('=====================================');
    console.log(`✅ Success: ${results.success.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);

    if (results.failed.length > 0) {
        console.log('\n❌ Failed assets:');
        results.failed.forEach(r => {
            console.log(`   - ${r.file}: ${r.error}`);
        });
    }

    console.log('\n✅ Successfully migrated assets:');
    results.success.forEach(r => {
        console.log(`   - ${r.file}`);
    });

    console.log('\n🎉 Migration complete!');
}

main().catch(console.error);
