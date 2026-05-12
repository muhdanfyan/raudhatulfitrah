
import { TENANT_ID, API_BASE_URL } from '../services/api';

/**
 * Cloudinary configuration per tenant
 */
const TENANT_CLOUDINARY_CONFIG: Record<string, { cloudName: string; uploadPreset: string }> = {
  'pondok_informatika': {
    cloudName: 'duntlhjil',
    uploadPreset: 'pisantri',
  },
  'default': {
    cloudName: 'duntlhjil',
    uploadPreset: 'pisantri',
  },
  'pestek': {
    cloudName: 'dbthxcpdz',
    uploadPreset: 'pestek',
  },
  'pestek-dev': {
    cloudName: 'dbthxcpdz',
    uploadPreset: 'pestek',
  },
};

// Default fallback config (pondok_informatika as default for pisantriv2)
const DEFAULT_CLOUDINARY_CONFIG = {
  cloudName: 'duntlhjil',
  uploadPreset: 'pisantri',
};

// Asset folder types in Cloudinary
type AssetFolder = 'branding' | 'pages' | 'features';

// Helper function to get tenant-specific Cloudinary config
const getTenantCloudinaryConfig = () => {
  let tenantId = TENANT_ID;

  // Map development tenant IDs to their production folder names in Cloudinary
  // (Previously handled pestek-dev, now unified to pestek)

  const config = TENANT_CLOUDINARY_CONFIG[TENANT_ID] || DEFAULT_CLOUDINARY_CONFIG;

  return {
    cloudName: config.cloudName,
    uploadPreset: config.uploadPreset,
    tenantId,
  };
};

/**
 * Generate a Cloudinary URL for student photo
 * @param publicId The public ID of the image in Cloudinary
 * @param transformation Optional transformation parameters
 * @returns Full Cloudinary URL
 */
export const getCloudinaryUrl = (
  publicId: string,
  transformation?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  }
): string => {
  const { cloudName } = getTenantCloudinaryConfig();

  if (!publicId || typeof publicId !== 'string') return '';

  const trimmedId = publicId.trim();

  // If publicId already looks like a full URL, return it as-is
  if (/^https?:\/\//i.test(trimmedId)) {
    return trimmedId;
  }

  // Build transformation string
  let transformationStr = 'f_auto,q_auto'; // Default quality and format

  if (transformation) {
    const parts = [];

    if (transformation.width) parts.push(`w_${transformation.width}`);
    if (transformation.height) parts.push(`h_${transformation.height}`);
    if (transformation.crop) parts.push(`c_${transformation.crop}`);
    if (transformation.quality) parts.push(`q_${transformation.quality}`);
    if (transformation.format) parts.push(`f_${transformation.format}`);

    if (parts.length > 0) {
      transformationStr = `${parts.join(',')},${transformationStr}`;
    }
  }

  // Construct the Cloudinary URL
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformationStr}/${trimmedId}`;
};

/**
 * Get the appropriate URL for a student photo
 * Tries Cloudinary first, falls back to local storage
 * @param photo The photo identifier (either Cloudinary public ID or local filename)
 * @param defaultUrl Optional default URL if photo is not available
 * @returns The best available URL for the photo
 */
export const getStudentPhotoUrl = (
  photo: string | null | undefined,
  defaultUrl: string = 'https://ui-avatars.com/api/?name=S&background=random',
  transformation?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  }
): string => {
  if (!photo || typeof photo !== 'string' || photo === 'null' || photo === 'undefined') {
    return defaultUrl;
  }

  const trimmedPhoto = photo.trim();
  if (!trimmedPhoto) {
    return defaultUrl;
  }

  // If photo already looks like a full URL (including Cloudinary URLs), return as-is
  if (/^https?:\/\//i.test(trimmedPhoto)) {
    return trimmedPhoto;
  }

  // Handle local storage paths explicitly
  if (trimmedPhoto.startsWith('storage/') || trimmedPhoto.startsWith('public/')) {
    const baseUrl = API_BASE_URL.replace(/\/$/, '');
    return `${baseUrl}/${trimmedPhoto}`;
  }

  // Otherwise, treat as a Cloudinary public ID
  // For student photos, we expect them to be in the {tenant}/fotosantri folder
  const { uploadPreset } = getTenantCloudinaryConfig();

  // If the public ID doesn't already contain a folder prefix, add the default one
  // Exceptions: if it starts with 'v' followed by digits (version) or already has slashes
  let publicId = trimmedPhoto;
  const isVersioned = /^v\d+\//.test(publicId);
  const cleanId = publicId.replace(/^\//, ''); // Strip leading slash

  // Add folder prefix if it's missing the tenant folder
  if (!isVersioned && !cleanId.split('/')[0].includes(uploadPreset)) {
    if (cleanId.startsWith('fotosantri/')) {
      publicId = `${uploadPreset}/${cleanId}`;
    } else {
      publicId = `${uploadPreset}/fotosantri/${cleanId}`;
    }
  } else {
    publicId = cleanId;
  }

  return getCloudinaryUrl(publicId, transformation);
};

/**
 * Get the default photo URL
 */
export const getDefaultPhotoUrl = (): string => {
  return 'https://ui-avatars.com/api/?name=S&background=random';
};

/**
 * Get static asset URL from Cloudinary
 * @param assetPath The asset filename (e.g., 'logo.png', 'hero.webp')
 * @param folder The folder type: 'branding', 'pages', or 'features'
 * @param transformation Optional transformation parameters
 * @returns Full Cloudinary URL for the asset
 * 
 * @example
 * // Get logo from Cloudinary
 * getStaticAsset('logo.png', 'branding')
 * // Returns: https://res.cloudinary.com/dbthxcpdz/image/upload/f_auto,q_auto/pestek/branding/logo.png
 * 
 * // Get hero image with custom size
 * getStaticAsset('hero.webp', 'pages', { width: 1200, quality: 80 })
 */
export const getStaticAsset = (
  assetPath: string,
  folder: AssetFolder,
  transformation?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  }
): string => {
  const { cloudName, tenantId } = getTenantCloudinaryConfig();

  if (!assetPath) return '';

  // Build transformation string
  let transformationStr = 'f_auto,q_auto'; // Default quality and format

  if (transformation) {
    const parts = [];

    if (transformation.width) parts.push(`w_${transformation.width}`);
    if (transformation.height) parts.push(`h_${transformation.height}`);
    if (transformation.crop) parts.push(`c_${transformation.crop}`);
    if (transformation.quality) parts.push(`q_${transformation.quality}`);
    if (transformation.format) parts.push(`f_${transformation.format}`);

    if (parts.length > 0) {
      transformationStr = `${parts.join(',')},f_auto`;
    }
  }

  const trimmedPath = assetPath.trim();

  // Construct the Cloudinary URL with tenant-specific folder structure
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformationStr}/${tenantId}/${folder}/${trimmedPath}`;
};

/**
 * Get shared asset URL from Cloudinary (for generic/reusable assets)
 * @param assetPath The asset filename
 * @param subfolder Optional subfolder within 'shared' (e.g., 'features')
 * @param transformation Optional transformation parameters
 */
export const getSharedAsset = (
  assetPath: string,
  subfolder?: string,
  transformation?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  }
): string => {
  const { cloudName } = getTenantCloudinaryConfig();

  if (!assetPath) return '';

  // Build transformation string
  let transformationStr = 'f_auto,q_auto';

  if (transformation) {
    const parts = [];
    if (transformation.width) parts.push(`w_${transformation.width}`);
    if (transformation.height) parts.push(`h_${transformation.height}`);
    if (transformation.crop) parts.push(`c_${transformation.crop}`);
    if (transformation.quality) parts.push(`q_${transformation.quality}`);
    if (transformation.format) parts.push(`f_${transformation.format}`);

    if (parts.length > 0) {
      transformationStr = `${parts.join(',')},f_auto`;
    }
  }

  const trimmedPath = assetPath.trim();
  const path = subfolder ? `shared/${subfolder}/${trimmedPath}` : `shared/${trimmedPath}`;

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformationStr}/${path}`;
};

/**
 * Fallback to local public asset if Cloudinary asset not available yet
 * @param cloudinaryUrl The Cloudinary URL
 * @param localPath The local fallback path (e.g., '/logo.png')
 * @param useCloudinary Whether to use Cloudinary (default: true)
 */
export const getAssetWithFallback = (
  cloudinaryUrl: string,
  localPath: string,
  useCloudinary: boolean = true
): string => {
  // TODO: When all assets are uploaded to Cloudinary, remove this fallback
  // For now, using local assets as we migrate to Cloudinary
  return useCloudinary ? cloudinaryUrl : localPath;
};