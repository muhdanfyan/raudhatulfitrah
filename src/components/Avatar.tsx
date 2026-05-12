import { useState } from 'react';
import { User } from 'lucide-react';
import { api } from '../services/api';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

const iconSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

export default function Avatar({ src, alt, name, size = 'md', className = '' }: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getColorFromName = (name?: string) => {
    if (!name) return 'from-gray-400 to-gray-500';
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-teal-500 to-teal-600',
      'from-orange-500 to-orange-600',
      'from-cyan-500 to-cyan-600',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const shouldShowImage = src && !imgError;
  const initials = getInitials(name || alt);
  const colorClass = getColorFromName(name || alt);

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        rounded-full overflow-hidden flex-shrink-0
        ${!shouldShowImage ? `bg-gradient-to-br ${colorClass}` : 'bg-gray-200'}
        flex items-center justify-center
        ${className}
      `}
    >
      {shouldShowImage ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : initials ? (
        <span className="text-white font-semibold">{initials}</span>
      ) : (
        <User className={`${iconSizes[size]} text-white`} />
      )}
    </div>
  );
}

// Helper function untuk mendapatkan URL foto dengan fallback
export function getPhotoUrl(photo?: string | null, basePath?: string): string | null {
  if (!photo) return null;
  if (photo.startsWith('http')) return photo;
  const base = basePath || `${api.getBaseUrl()}/storage/fotosantri`;
  return `${base}/${photo}`;
}
