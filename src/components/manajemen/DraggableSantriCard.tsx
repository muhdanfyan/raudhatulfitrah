import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { getStudentPhotoUrl } from '../../utils/imageUtils';
import { Pencil, X } from 'lucide-react';

interface DraggableSantriCardProps {
  id: string;
  santri: {
    id: number;
    name: string;
    photo: string;
    jabatan?: string;
    role?: string;
    is_guru?: boolean;
    is_musyrif?: boolean;
  };
  compact?: boolean;
  minimal?: boolean;
  onEdit?: (santri: any) => void;
  onRemove?: (santri: any) => void;
}

export default function DraggableSantriCard({ 
  id, 
  santri, 
  compact = false, 
  minimal = false,
  onEdit,
  onRemove 
}: DraggableSantriCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
    data: santri,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 999 : 1,
  };

  // Minimal mode: photo + full name + nickname + action buttons
  if (minimal) {
    const nickname = santri.name.split(' ')[0];
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`
          relative group
          flex flex-col items-center
          bg-white 
          rounded-xl
          border border-gray-100
          px-3 py-3
          w-full
          cursor-grab active:cursor-grabbing
          transition-all duration-200
          hover:shadow-md hover:border-gray-200
          ${isDragging ? 'shadow-xl ring-2 ring-blue-400 rotate-2 scale-110' : 'shadow-sm'}
        `}
        {...attributes}
        {...listeners}
      >
        {/* Action Buttons (visible on hover) */}
        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(santri); }}
              className="p-1 bg-blue-100 hover:bg-blue-200 rounded text-blue-600 transition-colors"
              title="Edit"
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}
          {onRemove && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(santri); }}
              className="p-1 bg-red-100 hover:bg-red-200 rounded text-red-600 transition-colors"
              title="Hapus"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <img
          src={getStudentPhotoUrl(santri.photo, `https://ui-avatars.com/api/?name=${encodeURIComponent(santri.name)}&background=F8FAFC&color=475569&bold=true&size=48`)}
          alt={santri.name}
          className="w-12 h-12 rounded-lg object-cover ring-2 ring-white shadow-md mb-2"
        />
        <p className="text-xs font-semibold text-gray-800 text-center truncate w-full">
          {santri.name}
        </p>
        <span className="text-[10px] text-gray-500 italic">
          "{nickname}"
        </span>
      </div>
    );
  }

  // Compact mode: smaller card with photo + name
  if (compact) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`
          flex items-center gap-2
          bg-white 
          rounded-lg
          border border-gray-100
          p-2
          cursor-grab active:cursor-grabbing
          transition-all duration-200
          hover:shadow-md hover:border-gray-200
          ${isDragging ? 'shadow-xl ring-2 ring-blue-400 rotate-2 scale-105' : 'shadow-sm'}
        `}
        {...attributes}
        {...listeners}
      >
        <img
          src={getStudentPhotoUrl(santri.photo, `https://ui-avatars.com/api/?name=${encodeURIComponent(santri.name)}&background=F8FAFC&color=475569&bold=true&size=36`)}
          alt={santri.name}
          className="w-8 h-8 rounded-lg object-cover ring-1 ring-white shadow-sm"
        />
        <span className="text-xs font-medium text-gray-800 truncate flex-1">
          {santri.name}
        </span>
      </div>
    );
  }

  // Full mode: complete card with badges
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white 
        rounded-xl 
        border border-gray-100
        p-3 
        cursor-grab active:cursor-grabbing
        group 
        relative
        transition-all duration-200
        hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-0.5 hover:border-gray-200
        ${isDragging ? 'shadow-2xl ring-2 ring-blue-400 ring-opacity-50 rotate-2 scale-105' : 'shadow-sm'}
      `}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={getStudentPhotoUrl(santri.photo, `https://ui-avatars.com/api/?name=${encodeURIComponent(santri.name)}&background=F8FAFC&color=475569&bold=true`)}
            alt={santri.name}
            className="w-10 h-10 rounded-lg object-cover ring-2 ring-white shadow-md"
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {santri.name}
          </p>
          
          {(santri.jabatan || santri.is_guru || santri.is_musyrif) && (
            <div className="flex flex-wrap gap-1 mt-1">
              {santri.jabatan && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">
                  {santri.jabatan}
                </span>
              )}
              {santri.is_guru && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">
                  Guru
                </span>
              )}
              {santri.is_musyrif && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700">
                  Musyrif
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
