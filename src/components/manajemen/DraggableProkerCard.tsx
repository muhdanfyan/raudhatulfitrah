import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Clock, User, Edit2, Trash2, Eye } from 'lucide-react';
import { getStudentPhotoUrl } from '../../utils/imageUtils';

interface Proker {
  id_proker: number;
  nama_proker: string;
  deskripsi_proker?: string;
  tgl_pelaksanaan?: string;
  thn_proker?: string;
  sasaran_proker?: string;
  status_proker?: string;
  divisi_proker?: number;
  divisi_nama?: string;
  proyeksi?: number;
  realisasi?: number;
  pj?: { nama_lengkap_santri: string; foto_santri: string };
  pj_count?: number;
}

interface DraggableProkerCardProps {
  id: string;
  proker: Proker;
  onEdit?: (proker: Proker) => void;
  onDelete?: (id: number) => void;
  onView?: (proker: Proker) => void;
}

export default function DraggableProkerCard({ 
  id, 
  proker, 
  onEdit, 
  onDelete,
  onView
}: DraggableProkerCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
    data: proker,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const hasPJ = proker.pj && proker.pj.nama_lengkap_santri;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-white rounded-xl border border-gray-100 p-4 mb-3
        cursor-grab active:cursor-grabbing group relative
        transition-all duration-200
        hover:shadow-lg hover:border-blue-200 hover:-translate-y-0.5
        ${isDragging ? 'shadow-2xl ring-2 ring-blue-400 rotate-2' : 'shadow-sm'}
      `}
    >
      <div className="flex flex-col gap-3">
        {/* Title & Actions */}
        <div className="flex justify-between items-start gap-2">
          <h4 className="text-sm font-bold text-gray-800 leading-tight flex-1">
            {proker.nama_proker}
          </h4>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all" onPointerDown={e => e.stopPropagation()}>
            <button 
              onClick={() => onView?.(proker)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => onEdit?.(proker)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => onDelete?.(proker.id_proker)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Division Badge */}
        {proker.divisi_nama && (
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider">
              {proker.divisi_nama}
            </span>
          </div>
        )}

        {/* Info row */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-500">
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>
              {proker.tgl_pelaksanaan 
                ? new Date(proker.tgl_pelaksanaan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                : proker.thn_proker}
            </span>
          </div>
        </div>

        {/* PJ row */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex items-center gap-2">
            {hasPJ ? (
              <>
                <div className="relative">
                  <img
                    src={getStudentPhotoUrl(proker.pj!.foto_santri, `https://ui-avatars.com/api/?name=${encodeURIComponent(proker.pj!.nama_lengkap_santri)}&background=random&bold=true`)}
                    alt={proker.pj!.nama_lengkap_santri}
                    className="w-6 h-6 rounded-full object-cover ring-2 ring-white shadow-sm"
                  />
                  {proker.pj_count && proker.pj_count > 1 && (
                    <div className="absolute -top-1 -right-1.5 flex items-center justify-center min-w-[14px] h-3.5 px-0.5 bg-blue-600 text-white text-[8px] font-bold rounded-full">
                      +{proker.pj_count - 1}
                    </div>
                  )}
                </div>
                <span className="text-[11px] font-medium text-gray-600 truncate max-w-[100px]">
                  {proker.pj!.nama_lengkap_santri}
                </span>
              </>
            ) : (
              <div className="flex items-center gap-1.5 text-gray-400 italic text-[10px]">
                <User className="w-3.5 h-3.5" />
                <span>Belum ada PJ</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
