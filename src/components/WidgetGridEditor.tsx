import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { API_URL, getHeaders } from '../services/api';
import { 
  Loader2, Save, LayoutGrid, ChevronDown, Check, X, GripVertical, Plus, Trash2, Maximize2, Columns,
  BarChart3, MessageSquare, Activity, Briefcase, ClipboardCheck, ListTodo, Target, BookOpen, 
  Heart, Users, Calendar, Star, FolderOpen, FileText, Clock, Wallet, AlertCircle, Video, 
  GraduationCap, Menu, Scan, Shield, LucideIcon
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Widget {
  id: number;
  widget_key: string;
  is_enabled: boolean;
  grid_x: number;
  grid_y: number;
  grid_w: number;
  grid_h: number;
  config?: any;
}

interface RoleOption {
  id: number;
  name: string;
}

const WIDGET_LABELS: Record<string, string> = {
  stat_card: 'Statistik',
  masukan_panel: 'Masukan',
  current_activity: 'Aktivitas',
  jobdesk_panel: 'Jobdesk',
  sop_checklist: 'SOP',
  tugas_admin: 'Tugas',
  proker_status: 'Proker',
  belum_setor: 'Belum Setor',
  ibadah_report: 'Ibadah',
  pejabat_panel: 'Pengurus',
  setoran_hari_ini: 'Hafalan',
  latest_reviews: 'Review',
  latest_portfolios: 'Portfolio',
  rekap_setoran_bulan_ini: 'Rekap Setoran',
  daily_report_hari_ini: 'Daily Report',
  presensi_hari_ini_table: 'Presensi',
  keuangan_summary: 'Keuangan',
  keuangan_belum_lapor: 'Belum Lapor',
  upcoming_live_classes: 'Live Class',
  mentor_courses: 'Course',
  quick_menu: 'Menu Cepat',
  presence_scan_banner: 'Scan Presensi',
  calendar_integrated: 'Kalender',
  tatib_banner: 'Baner Tata Tertib',
};

const WIDGET_ICONS: Record<string, LucideIcon> = {
  stat_card: BarChart3,
  masukan_panel: MessageSquare,
  current_activity: Activity,
  jobdesk_panel: Briefcase,
  sop_checklist: ClipboardCheck,
  tugas_admin: ListTodo,
  proker_status: Target,
  belum_setor: BookOpen,
  ibadah_report: Heart,
  pejabat_panel: Users,
  setoran_hari_ini: BookOpen,
  latest_reviews: Star,
  latest_portfolios: FolderOpen,
  rekap_setoran_bulan_ini: FileText,
  daily_report_hari_ini: Clock,
  presensi_hari_ini_table: Clock,
  keuangan_summary: Wallet,
  keuangan_belum_lapor: AlertCircle,
  upcoming_live_classes: Video,
  mentor_courses: GraduationCap,
  quick_menu: Menu,
  presence_scan_banner: Scan,
  calendar_integrated: Calendar,
  tatib_banner: Shield,
};

function SortableWidgetRow({ 
  widget, 
  onRemove, 
  onUpdateSize 
}: { 
  widget: Widget; 
  onRemove: () => void;
  onUpdateSize: (w: number, x: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: widget.widget_key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  const isFull = widget.grid_w >= 12;
  const isHalf = !isFull;
  const IconComponent = WIDGET_ICONS[widget.widget_key] || LayoutGrid;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        width: isHalf ? 'calc(50% - 6px)' : '100%',
      }}
      className={`
        relative flex items-center gap-3 p-3 bg-white border rounded-xl transition-all
        ${isDragging ? 'shadow-xl border-primary ring-2 ring-primary/10' : 'shadow-sm border-gray-200 hover:border-gray-300'}
      `}
    >
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>

      {/* Widget Icon */}
      <div className={`shrink-0 flex items-center justify-center rounded-lg bg-primary/10 text-primary ${isHalf ? 'w-8 h-8' : 'w-10 h-10'}`}>
        <IconComponent className={isHalf ? 'w-4 h-4' : 'w-5 h-5'} />
      </div>

      {/* Widget Info - Hidden when Half */}
      {isFull && (
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-gray-900 truncate block">
            {WIDGET_LABELS[widget.widget_key] || widget.widget_key}
          </span>
          <span className="text-[10px] text-gray-400 font-mono uppercase">
            {widget.widget_key}
          </span>
        </div>
      )}
      
      {/* Compact label for Half */}
      {isHalf && (
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-gray-900 truncate block">
            {WIDGET_LABELS[widget.widget_key] || widget.widget_key}
          </span>
        </div>
      )}

      {/* Size Toggle */}
      <div className={`flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-100 shrink-0 ${isHalf ? 'flex-col' : ''}`}>
        <button
          onClick={() => onUpdateSize(12, 0)}
          className={`p-1.5 rounded-md text-xs font-medium transition-all ${
            isFull ? 'bg-white text-primary shadow-sm border border-primary/20' : 'text-gray-400 hover:text-gray-600'
          }`}
          title="Full Width"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onUpdateSize(6, 0)}
          className={`p-1.5 rounded-md text-xs font-medium transition-all ${
            isHalf ? 'bg-white text-primary shadow-sm border border-primary/20' : 'text-gray-400 hover:text-gray-600'
          }`}
          title="Half Width"
        >
          <Columns className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Delete Button */}
      <button
        onClick={onRemove}
        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
        title="Hapus"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export interface WidgetGridEditorRef {
  handleSave: () => Promise<void>;
  setShowAddModal: (show: boolean) => void;
  isSaving: boolean;
  hasRoleSelected: boolean;
}

const WidgetGridEditor = forwardRef<WidgetGridEditorRef, { hideHeader?: boolean }>((props, ref) => {
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [availableKeys, setAvailableKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rolesOpen, setRolesOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useImperativeHandle(ref, () => ({
    handleSave,
    setShowAddModal,
    isSaving: saving,
    hasRoleSelected: !!selectedRoleId
  }));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    if (selectedRoleId) {
      fetchWidgets(selectedRoleId);
    }
  }, [selectedRoleId]);

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_URL}/roles`, {
        headers: getHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setRoles(data.data);
        if (data.data.length > 0 && !selectedRoleId) {
          setSelectedRoleId(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const fetchWidgets = async (roleId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/roles/${roleId}/widgets`, {
        headers: getHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setWidgets(data.data?.widgets?.sort((a: any, b: any) => a.grid_y - b.grid_y) || []);
        setAvailableKeys(data.data?.available_widgets || []);
      }
    } catch (error) {
      console.error('Failed to fetch widgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex(i => i.widget_key === active.id);
        const newIndex = items.findIndex(i => i.widget_key === over.id);
        const next = arrayMove(items, oldIndex, newIndex);
        // Re-assign grid_y based on order
        return next.map((item, idx) => ({ ...item, grid_y: idx }));
      });
    }
  };

  const updateWidgetSize = (widgetKey: string, w: number, x: number) => {
    setWidgets(prev => prev.map(wgt => 
      wgt.widget_key === widgetKey ? { ...wgt, grid_w: w, grid_x: x } : wgt
    ));
  };

  const removeWidget = (widgetKey: string) => {
    setWidgets(prev => prev.filter(w => w.widget_key !== widgetKey));
  };

  const addWidget = (key: string) => {
    if (widgets.find(w => w.widget_key === key)) return;
    
    const newWidget: Widget = {
      id: 0,
      widget_key: key,
      is_enabled: true,
      grid_x: 0,
      grid_y: widgets.length,
      grid_w: 12,
      grid_h: 2,
    };
    setWidgets([...widgets, newWidget]);
    setShowAddModal(false);
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/roles/${selectedRoleId}/widgets`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ widgets }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Layout widget berhasil disimpan!');
      } else {
        alert(data.message || 'Gagal menyimpan widget');
      }
    } catch (error: any) {
      alert(error.message || 'Gagal menyimpan widget');
    } finally {
      setSaving(false);
    }
  };

  const unusedKeys = availableKeys.filter(key => !widgets.find(w => w.widget_key === key));
  const selectedRole = roles.find(r => r.id === selectedRoleId);

  return (
    <div className="space-y-6">
      <div className={`${props.hideHeader ? '' : 'bg-white rounded-2xl shadow-sm border border-gray-200 p-6'}`}>
        {!props.hideHeader && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Pengaturan Dashboard</h2>
              <p className="text-sm text-gray-500">Atur urutan dan ukuran widget per role</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
              >
                <Plus className="w-4 h-4" />
                Tambah Widget
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !selectedRoleId}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:shadow-lg disabled:opacity-50 transition-all font-medium"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Simpan Layout
              </button>
            </div>
          </div>
        )}

        {/* Role Selector */}
        <div className="mb-8">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pilih Role Manajemen</label>
          <div className="relative">
            <button
              onClick={() => setRolesOpen(!rolesOpen)}
              className="w-full sm:w-72 flex items-center justify-between gap-3 px-4 py-3 bg-white border border-gray-200 rounded-2xl hover:border-primary/50 transition-all shadow-sm"
            >
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-gray-900">
                  {selectedRole?.name || 'Pilih role...'}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${rolesOpen ? 'rotate-180' : ''}`} />
            </button>
            {rolesOpen && (
              <div className="absolute z-50 w-full sm:w-72 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-h-64 overflow-y-auto">
                  {roles.map(role => (
                    <button
                      key={role.id}
                      onClick={() => { setSelectedRoleId(role.id); setRolesOpen(false); }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                        role.id === selectedRoleId ? 'bg-primary/5 text-primary' : 'text-gray-700'
                      }`}
                    >
                      <span className="text-sm font-bold">{role.name}</span>
                      {role.id === selectedRoleId && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-gray-500 font-medium">Memuat tata letak...</p>
          </div>
        ) : (
          <div className="max-w-3xl">
            {widgets.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <LayoutGrid className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium mb-6">Belum ada widget di dashboard ini</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold shadow-sm"
                >
                  <Plus className="w-4 h-4 text-primary" />
                  Tambah Widget Sekarang
                </button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={widgets.map(w => w.widget_key)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-wrap gap-3">
                    {widgets.map((widget) => (
                      <SortableWidgetRow
                        key={widget.widget_key}
                        widget={widget}
                        onRemove={() => removeWidget(widget.widget_key)}
                        onUpdateSize={(w, x) => updateWidgetSize(widget.widget_key, w, x)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
            
            <p className="mt-8 text-xs text-gray-400 text-center">
              * Seret handle <GripVertical className="w-3 h-3 inline" /> untuk mengatur urutan. <br/>
              * Widget "Half" akan otomatis mengisi kiri lalu kanan secara berurutan.
            </p>

            {widgets.length > 0 && (
              <div className="mt-10 flex justify-center pb-10">
                <button
                  onClick={handleSave}
                  disabled={saving || !selectedRoleId}
                  className="flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl hover:shadow-2xl hover:scale-105 disabled:opacity-50 transition-all font-bold"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Simpan Semua Perubahan
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Widget Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 p-8">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Tambah Widget Baru</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {unusedKeys.length === 0 ? (
                  <div className="text-center py-8">
                    <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 font-medium">Semua widget sudah terpasang</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {unusedKeys.map(key => (
                      <button
                        key={key}
                        onClick={() => addWidget(key)}
                        className="flex items-center gap-3 p-4 hover:bg-primary/5 rounded-2xl border border-transparent hover:border-primary/20 transition-all text-left"
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-primary group-hover:bg-white shadow-sm">
                          <LayoutGrid className="w-5 h-5 opacity-40" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{WIDGET_LABELS[key] || key}</p>
                          <p className="text-[10px] text-gray-400 font-mono uppercase leading-none mt-1">{key}</p>
                        </div>
                        <Plus className="w-4 h-4 text-gray-300 ml-auto" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-4 bg-gray-50 flex justify-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Pilih satu untuk menambahkan</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default WidgetGridEditor;
