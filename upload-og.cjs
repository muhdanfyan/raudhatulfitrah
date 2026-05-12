
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'dbthxcpdz',
    api_key: '263724197527528',
    api_secret: 'MjeAcG7GzDvGyvs2YTGF3AJWmTo'
});

const imagePath = '/Users/pondokit/.gemini/antigravity/brain/8593aef0-4d07-4883-bbf2-4d1106f050a7/uploaded_image_1766314985736.png';

cloudinary.uploader.upload(imagePath, {
    public_id: 'pestek/branding/og-preview',
    overwrite: true,
    resource_type: 'image'
}).then(result => {
    console.log('Upload success:', result.secure_url);
}).catch(error => {
    console.error('Upload failed:', error);
    process.exit(1);
});
