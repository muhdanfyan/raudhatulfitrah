import { useState, useEffect } from 'react';
import { API_URL, getHeaders } from '../services/api';
import { 
  Loader2, Save, ChevronDown, Check, Plus, Pencil, Trash2, X, 
  GripVertical, ChevronRight, FolderOpen, File
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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MenuItem {
  id: number;
  role_id: number;
  label: string;
  href: string;
  icon: string;
  parent_id: number | null;
  sort_order: number;
  children?: MenuItem[];
}

interface RoleOption {
  id: number;
  name: string;
}

const ICON_OPTIONS = [
  'LayoutDashboard', 'Users', 'User', 'BookOpen', 'Building2', 'ClipboardList',
  'Settings', 'ShoppingBag', 'Cpu', 'Layers', 'FileText', 'Briefcase',
  'CreditCard', 'CheckSquare', 'Heart', 'Clock', 'Award', 'Target', 'Shield'
];

function SortableMenuItem({ 
  item, 
  onEdit, 
  onDelete,
  expanded,
  onToggleExpand,
  level = 0 
}: { 
  item: MenuItem; 
  onEdit: (item: MenuItem) => void;
  onDelete: (id: number) => void;
  expanded: boolean;
  onToggleExpand: (id: number) => void;
  level?: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    marginLeft: `${level * 24}px`,
  };

  const hasChildren = item.children && item.children.length > 0;

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-lg mb-2 ${
          isDragging ? 'shadow-lg' : ''
        }`}
      >
        <button {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </button>
        
        {hasChildren ? (
          <button 
            onClick={() => onToggleExpand(item.id)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
        ) : (
          <div className="w-6" />
        )}
        
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          hasChildren ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
        }`}>
          {hasChildren ? <FolderOpen className="w-4 h-4" /> : <File className="w-4 h-4" />}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">{item.label}</div>
          <div className="text-xs text-gray-500 truncate">{item.href || '(dropdown)'}</div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {hasChildren && expanded && (
        <div className="ml-6">
          {item.children!.map(child => (
            <SortableMenuItem
              key={child.id}
              item={child}
              onEdit={onEdit}
              onDelete={onDelete}
              expanded={false}
              onToggleExpand={onToggleExpand}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default function MenuTreeEditor() {
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rolesOpen, setRolesOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    href: '',
    icon: 'LayoutDashboard',
    parent_id: null as number | null,
  });

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
      fetchMenus(selectedRoleId);
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
        if (data.data.length > 0) {
          setSelectedRoleId(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const fetchMenus = async (roleId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/roles/${roleId}/menus`, {
        headers: getHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setMenus(data.data?.flat_menus || data.data?.menus || []);
      }
    } catch (error) {
      console.error('Failed to fetch menus:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setMenus(items => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setEditingItem(null);
    setFormData({ label: '', href: '', icon: 'LayoutDashboard', parent_id: null });
    setShowModal(true);
  };

  const handleEdit = (item: MenuItem) => {
    setModalMode('edit');
    setEditingItem(item);
    setFormData({
      label: item.label,
      href: item.href,
      icon: item.icon,
      parent_id: item.parent_id,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus menu ini?')) return;
    setMenus(prev => prev.filter(m => m.id !== id));
  };

  const handleSaveItem = () => {
    if (modalMode === 'create') {
      const newItem: MenuItem = {
        id: Date.now(),
        role_id: selectedRoleId!,
        label: formData.label,
        href: formData.href,
        icon: formData.icon,
        parent_id: formData.parent_id,
        sort_order: menus.length,
      };
      setMenus(prev => [...prev, newItem]);
    } else if (editingItem) {
      setMenus(prev => prev.map(m =>
        m.id === editingItem.id ? { ...m, ...formData } : m
      ));
    }
    setShowModal(false);
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/roles/${selectedRoleId}/menus`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ 
          menus: menus.map((m, idx) => ({
            ...m,
            sort_order: idx,
          }))
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Menu berhasil disimpan!');
        fetchMenus(selectedRoleId);
      } else {
        alert(data.message || 'Gagal menyimpan menu');
      }
    } catch (error: any) {
      alert(error.message || 'Gagal menyimpan menu');
    } finally {
      setSaving(false);
    }
  };

  const selectedRole = roles.find(r => r.id === selectedRoleId);
  const parentMenuOptions = menus.filter(m => !m.parent_id);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Struktur Menu</h2>
            <p className="text-sm text-gray-500">Atur menu navigasi untuk setiap role</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
            >
              <Plus className="w-4 h-4" />
              Tambah Menu
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !selectedRoleId}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all shadow-sm"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan
            </button>
          </div>
        </div>

        {/* Role Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Role</label>
          <div className="relative">
            <button
              onClick={() => setRolesOpen(!rolesOpen)}
              className="w-full sm:w-72 flex items-center justify-between gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:border-gray-400 transition-all"
            >
              <span className="text-sm font-medium text-gray-900">
                {selectedRole?.name || 'Pilih role...'}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${rolesOpen ? 'rotate-180' : ''}`} />
            </button>
            {rolesOpen && (
              <div className="absolute z-10 w-full sm:w-72 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                {roles.map(role => (
                  <button
                    key={role.id}
                    onClick={() => { setSelectedRoleId(role.id); setRolesOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 ${
                      role.id === selectedRoleId ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-sm font-medium">{role.name}</span>
                    {role.id === selectedRoleId && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : menus.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen className="w-16 h-16 mx-auto text-gray-200 mb-4" />
            <div className="text-gray-500">Belum ada menu untuk role ini</div>
            <button
              onClick={handleCreate}
              className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Tambah menu pertama
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={menus.map(m => m.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1">
                {menus.filter(m => !m.parent_id).map(item => (
                  <SortableMenuItem
                    key={item.id}
                    item={{
                      ...item,
                      children: menus.filter(m => m.parent_id === item.id),
                    }}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    expanded={expandedIds.includes(item.id)}
                    onToggleExpand={toggleExpand}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h3 className="text-lg font-semibold text-gray-900">
                  {modalMode === 'create' ? 'Tambah Menu' : 'Edit Menu'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Label *</label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Dashboard"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL/Href</label>
                  <input
                    type="text"
                    value={formData.href}
                    onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="/dashboard (kosongkan jika dropdown)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    {ICON_OPTIONS.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parent Menu</label>
                  <select
                    value={formData.parent_id || ''}
                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? Number(e.target.value) : null })}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="">-- Root Level --</option>
                    {parentMenuOptions.filter(m => m.id !== editingItem?.id).map(menu => (
                      <option key={menu.id} value={menu.id}>{menu.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveItem}
                  disabled={!formData.label}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 flex items-center gap-2 font-medium shadow-sm transition-all"
                >
                  <Save className="w-4 h-4" />
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
