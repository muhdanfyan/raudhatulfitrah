import { useDroppable } from '@dnd-kit/core';
import { ReactNode } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface DroppableColumnProps {
  id: string;
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  count?: number;
  color?: 'gray' | 'blue' | 'emerald' | 'amber' | 'purple';
  horizontal?: boolean;
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showAddButton?: boolean;
}

const colorStyles = {
  gray: {
    bg: 'from-slate-50 to-gray-100',
    header: 'from-slate-100 to-gray-50',
    headerText: 'text-slate-700',
    border: 'border-slate-200',
    accent: 'bg-slate-500',
    hover: 'bg-blue-50 border-blue-300',
    addBtn: 'bg-slate-100 hover:bg-slate-200 text-slate-600',
  },
  blue: {
    bg: 'from-blue-50/50 to-indigo-50/50',
    header: 'from-blue-100 to-indigo-50',
    headerText: 'text-blue-700',
    border: 'border-blue-200',
    accent: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    hover: 'bg-blue-100 border-blue-400',
    addBtn: 'bg-blue-100 hover:bg-blue-200 text-blue-600',
  },
  emerald: {
    bg: 'from-emerald-50/50 to-teal-50/50',
    header: 'from-emerald-100 to-teal-50',
    headerText: 'text-emerald-700',
    border: 'border-emerald-200',
    accent: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    hover: 'bg-emerald-100 border-emerald-400',
    addBtn: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-600',
  },
  amber: {
    bg: 'from-amber-50/50 to-orange-50/50',
    header: 'from-amber-100 to-orange-50',
    headerText: 'text-amber-700',
    border: 'border-amber-200',
    accent: 'bg-gradient-to-r from-amber-500 to-orange-500',
    hover: 'bg-amber-100 border-amber-400',
    addBtn: 'bg-amber-100 hover:bg-amber-200 text-amber-600',
  },
  purple: {
    bg: 'from-purple-50/50 to-pink-50/50',
    header: 'from-purple-100 to-pink-50',
    headerText: 'text-purple-700',
    border: 'border-purple-200',
    accent: 'bg-gradient-to-r from-purple-500 to-pink-500',
    hover: 'bg-purple-100 border-purple-400',
    addBtn: 'bg-purple-100 hover:bg-purple-200 text-purple-600',
  },
};

export default function DroppableColumn({ 
  id, 
  title, 
  children, 
  icon, 
  count = 0, 
  color = 'gray', 
  horizontal = false,
  onAdd,
  onEdit,
  onDelete,
  showAddButton = true
}: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const styles = colorStyles[color] || colorStyles.gray;

  return (
    <div 
      className={`
        flex flex-col 
        ${horizontal ? 'min-h-[140px]' : ''} 
        w-full 
        bg-gradient-to-b ${styles.bg}
        rounded-2xl 
        overflow-hidden 
        border-2 ${isOver ? styles.hover : styles.border}
        shadow-lg shadow-gray-200/50
        transition-all duration-300
        ${isOver ? 'scale-[1.02] shadow-xl' : ''}
        group/column
      `}
    >
      {/* Header with Gradient */}
      <div className={`
        px-4 py-3 
        bg-gradient-to-r ${styles.header}
        border-b ${styles.border}
        flex items-center justify-between
        backdrop-blur-sm
      `}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {icon && (
            <div className={`p-1.5 rounded-lg ${styles.accent} text-white shadow-sm flex-shrink-0`}>
              {icon}
            </div>
          )}
          <h3 className={`font-semibold text-sm ${styles.headerText} tracking-wide truncate`}>
            {title}
          </h3>
        </div>
        
        {/* Edit/Delete buttons + Count */}
        <div className="flex items-center gap-1">
          {(onEdit || onDelete) && (
            <div className="flex gap-0.5 opacity-0 group-hover/column:opacity-100 transition-opacity">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="p-1 rounded hover:bg-white/50 text-gray-500 hover:text-blue-600 transition-colors"
                  title="Edit jabatan"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="p-1 rounded hover:bg-white/50 text-gray-500 hover:text-red-600 transition-colors"
                  title="Hapus jabatan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
          <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-white/80 backdrop-blur-sm text-xs font-bold text-gray-700 shadow-sm border border-white/50 ml-1">
            {count}
          </span>
        </div>
      </div>

      {/* Drop Area */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 p-3 
          ${horizontal ? 'flex flex-wrap gap-3 overflow-x-auto items-start' : 'space-y-2 overflow-y-auto'} 
          transition-all duration-300
          ${isOver ? 'ring-2 ring-inset ring-blue-400/30' : ''}
        `}
      >
        {children}
        
        {/* Empty State */}
        {count === 0 && !isOver && (
          <div className={`
            ${horizontal ? 'w-full h-16' : 'h-14'} 
            border-2 border-dashed border-gray-300/60 
            rounded-xl 
            flex items-center justify-center 
            text-gray-400 text-xs text-center 
            p-2
            bg-white/30
          `}>
            Tarik santri ke sini
          </div>
        )}

        {/* Over State Indicator */}
        {isOver && count === 0 && (
          <div className={`
            ${horizontal ? 'w-full h-16' : 'h-14'} 
            border-2 border-dashed border-blue-400 
            rounded-xl 
            flex items-center justify-center 
            text-blue-500 text-sm font-medium
            bg-blue-50/50
            animate-pulse
          `}>
            Lepaskan di sini
          </div>
        )}
      </div>

      {/* Add Button Footer */}
      {showAddButton && onAdd && (
        <div className={`px-3 py-2 border-t ${styles.border} bg-white/50`}>
          <button
            onClick={onAdd}
            className={`
              w-full flex items-center justify-center gap-2
              py-1.5 px-3 rounded-lg
              ${styles.addBtn}
              text-xs font-medium
              transition-all duration-200
              hover:shadow-sm
            `}
          >
            <Plus className="w-4 h-4" />
            Tambah
          </button>
        </div>
      )}
    </div>
  );
}
