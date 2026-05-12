// Video Embed Utility - Support multiple platforms

export interface VideoInfo {
  platform: 'youtube' | 'vimeo' | 'instagram' | 'tiktok' | 'dailymotion' | 'gdrive' | 'direct' | 'unknown';
  embedUrl: string | null;
  thumbnailUrl: string | null;
  videoId: string | null;
}

// Extract video ID and generate embed URL for various platforms
export function parseVideoUrl(url: string): VideoInfo {
  if (!url) return { platform: 'unknown', embedUrl: null, thumbnailUrl: null, videoId: null };
  
  const trimmedUrl = url.trim();
  
  // YouTube
  const youtubeMatch = trimmedUrl.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return {
      platform: 'youtube',
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }
  
  // Vimeo
  const vimeoMatch = trimmedUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeoMatch) {
    const videoId = vimeoMatch[1];
    return {
      platform: 'vimeo',
      videoId,
      embedUrl: `https://player.vimeo.com/video/${videoId}`,
      thumbnailUrl: null, // Vimeo requires API for thumbnail
    };
  }
  
  // Instagram Reels/Posts
  const instagramMatch = trimmedUrl.match(/instagram\.com\/(?:p|reel|reels)\/([A-Za-z0-9_-]+)/i);
  if (instagramMatch) {
    const videoId = instagramMatch[1];
    return {
      platform: 'instagram',
      videoId,
      embedUrl: `https://www.instagram.com/p/${videoId}/embed`,
      thumbnailUrl: null,
    };
  }
  
  // TikTok
  const tiktokMatch = trimmedUrl.match(/tiktok\.com\/@[^\/]+\/video\/(\d+)/i);
  if (tiktokMatch) {
    const videoId = tiktokMatch[1];
    return {
      platform: 'tiktok',
      videoId,
      embedUrl: `https://www.tiktok.com/embed/v2/${videoId}`,
      thumbnailUrl: null,
    };
  }
  
  // Dailymotion
  const dailymotionMatch = trimmedUrl.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/i);
  if (dailymotionMatch) {
    const videoId = dailymotionMatch[1];
    return {
      platform: 'dailymotion',
      videoId,
      embedUrl: `https://www.dailymotion.com/embed/video/${videoId}`,
      thumbnailUrl: `https://www.dailymotion.com/thumbnail/video/${videoId}`,
    };
  }
  
  // Google Drive
  const gdriveMatch = trimmedUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (gdriveMatch) {
    const videoId = gdriveMatch[1];
    return {
      platform: 'gdrive',
      videoId,
      embedUrl: `https://drive.google.com/file/d/${videoId}/preview`,
      thumbnailUrl: null,
    };
  }
  
  // Direct video URL (mp4, webm, etc)
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmedUrl)) {
    return {
      platform: 'direct',
      videoId: null,
      embedUrl: trimmedUrl,
      thumbnailUrl: null,
    };
  }
  
  // Already an embed URL
  if (trimmedUrl.includes('/embed') || trimmedUrl.includes('player.')) {
    return {
      platform: 'unknown',
      videoId: null,
      embedUrl: trimmedUrl,
      thumbnailUrl: null,
    };
  }
  
  return { platform: 'unknown', embedUrl: null, thumbnailUrl: null, videoId: null };
}

// Get platform icon/label
export function getPlatformLabel(platform: VideoInfo['platform']): string {
  const labels: Record<VideoInfo['platform'], string> = {
    youtube: '🎬 YouTube',
    vimeo: '🎬 Vimeo',
    instagram: '📸 Instagram',
    tiktok: '🎵 TikTok',
    dailymotion: '🎬 Dailymotion',
    gdrive: '📁 Google Drive',
    direct: '🎬 Video',
    unknown: '🔗 Link',
  };
  return labels[platform];
}

// Check if URL is a valid video URL
export function isValidVideoUrl(url: string): boolean {
  const info = parseVideoUrl(url);
  return info.embedUrl !== null;
}
