import { useState, useEffect } from 'react';
import { API_URL, getHeaders } from '../../services/api';
import { Menu, Plus, Trash2, Loader2, Save, GripVertical, ChevronRight, Eye, EyeOff, X } from 'lucide-react';

interface MenuItem {
  id?: number;
  label: string;
  href: string | null;
  icon: string | null;
  display_order: number;
  is_enabled: boolean;
  parent_id: number | null;
  children?: MenuItem[];
}

interface Role {
  id: number;
  name: string;
}

const ICON_OPTIONS = [
  'Home', 'Users', 'Book', 'BookOpen', 'ClipboardList', 'Heart', 'DollarSign',
  'ShoppingCart', 'Settings', 'Shield', 'Map', 'FileText', 'Calendar', 'GraduationCap',
  'UserPlus', 'Briefcase', 'Building2', 'Award', 'Target', 'CheckSquare'
];

export default function MenuStructureTab() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMenu, setEditMenu] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({ label: '', href: '', icon: 'Home', parent_id: '' });


  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_URL}/api/roles`, {
        headers: getHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setRoles(data.data);
        if (data.data.length > 0) {
          setSelectedRole(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const fetchMenus = async (roleId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/roles/${roleId}/menus`, {
        headers: getHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setMenus(data.data.menus || []);
      }
    } catch (error) {
      console.error('Failed to fetch menus:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      fetchMenus(selectedRole);
      setHasChanges(false);
    }
  }, [selectedRole]);

  const toggleMenuEnabled = (menuId: number | undefined) => {
    if (!menuId) return;
    const updateMenus = (items: MenuItem[]): MenuItem[] => {
      return items.map(item => {
        if (item.id === menuId) {
          return { ...item, is_enabled: !item.is_enabled };
        }
        if (item.children) {
          return { ...item, children: updateMenus(item.children) };
        }
        return item;
      });
    };
    setMenus(updateMenus(menus));
    setHasChanges(true);
  };

  const handleAddMenu = () => {
    setEditMenu(null);
    setFormData({ label: '', href: '', icon: 'Home', parent_id: '' });
    setShowAddModal(true);
  };

  const handleEditMenu = (menu: MenuItem) => {
    setEditMenu(menu);
    setFormData({
      label: menu.label,
      href: menu.href || '',
      icon: menu.icon || 'Home',
      parent_id: menu.parent_id?.toString() || ''
    });
    setShowAddModal(true);
  };

  const handleSaveMenu = () => {
    if (!formData.label) return;

    const newMenu: MenuItem = {
      label: formData.label,
      href: formData.href || null,
      icon: formData.icon || null,
      display_order: menus.length,
      is_enabled: true,
      parent_id: formData.parent_id ? parseInt(formData.parent_id) : null
    };

    if (editMenu?.id) {
      const updateMenus = (items: MenuItem[]): MenuItem[] => {
        return items.map(item => {
          if (item.id === editMenu.id) {
            return { ...item, ...newMenu };
          }
          if (item.children) {
            return { ...item, children: updateMenus(item.children) };
          }
          return item;
        });
      };
      setMenus(updateMenus(menus));
    } else {
      if (newMenu.parent_id) {
        const addToParent = (items: MenuItem[]): MenuItem[] => {
          return items.map(item => {
            if (item.id === newMenu.parent_id) {
              return { ...item, children: [...(item.children || []), newMenu] };
            }
            if (item.children) {
              return { ...item, children: addToParent(item.children) };
            }
            return item;
          });
        };
        setMenus(addToParent(menus));
      } else {
        setMenus([...menus, newMenu]);
      }
    }

    setShowAddModal(false);
    setHasChanges(true);
  };

  const handleDeleteMenu = (menuId: number | undefined) => {
    if (!menuId) return;
    const filterMenus = (items: MenuItem[]): MenuItem[] => {
      return items.filter(item => item.id !== menuId).map(item => ({
        ...item,
        children: item.children ? filterMenus(item.children) : undefined
      }));
    };
    setMenus(filterMenus(menus));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    setSaving(true);

    const flattenMenus = (items: MenuItem[], parentIndex: number | null = null): any[] => {
      let result: any[] = [];
      items.forEach((item) => {
        const menuItem = {
          label: item.label,
          href: item.href,
          icon: item.icon,
          display_order: result.length,
          is_enabled: item.is_enabled,
          parent_id: parentIndex
        };
        const currentIndex = result.length;
        result.push(menuItem);
        if (item.children && item.children.length > 0) {
          result = result.concat(flattenMenus(item.children, currentIndex));
        }
      });
      return result;
    };

    try {
        headers: getHeaders(true)
        body: JSON.stringify({ menus: flattenMenus(menus) })
      });
      const data = await response.json();
      if (data.success) {
        setHasChanges(false);
        fetchMenus(selectedRole);
        alert('Menu berhasil disimpan');
      } else {
        alert(data.message || 'Gagal menyimpan');
      }
    } catch (error) {
      console.error('Failed to save menus:', error);
    } finally {
      setSaving(false);
    }
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => (
    <div key={item.id || item.label} className={`${depth > 0 ? 'ml-8' : ''}`}>
      <div className={`flex items-center gap-3 p-3 rounded-lg border ${
        item.is_enabled ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'
      }`}>
        <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
        {depth > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
        <div className="flex-1">
          <p className="font-medium text-gray-900">{item.label}</p>
          <p className="text-xs text-gray-500">{item.href || 'No link'}</p>
        </div>
        <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">{item.icon}</span>
        <button
          onClick={() => toggleMenuEnabled(item.id)}
          className="p-1.5 hover:bg-gray-100 rounded"
        >
          {item.is_enabled ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
        </button>
        <button onClick={() => handleEditMenu(item)} className="p-1.5 hover:bg-gray-100 rounded">
          <Menu className="w-4 h-4 text-blue-600" />
        </button>
        <button onClick={() => handleDeleteMenu(item.id)} className="p-1.5 hover:bg-gray-100 rounded">
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>
      {item.children && item.children.map(child => renderMenuItem(child, depth + 1))}
    </div>
  );

  const selectedRoleName = roles.find(r => r.id === selectedRole)?.name || '';
  const parentOptions = menus.filter(m => !m.parent_id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Struktur Menu</h2>
          <p className="text-sm text-gray-500">Atur menu navigasi untuk setiap role</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAddMenu}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            Tambah Menu
          </button>
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan
            </button>
          )}
        </div>
      </div>

      {/* Role Selector */}
      <div className="flex flex-wrap gap-2">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => setSelectedRole(role.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedRole === role.id
                ? 'bg-primary text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {role.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-4">
            Menu untuk <span className="text-primary capitalize">{selectedRoleName}</span>
          </h3>
          <div className="space-y-2">
            {menus.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Belum ada menu. Klik "Tambah Menu" untuk menambahkan.</p>
            ) : (
              menus.map(item => renderMenuItem(item))
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold">{editMenu ? 'Edit Menu' : 'Tambah Menu'}</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Label *</label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
                    placeholder="Dashboard"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Link (href)</label>
                  <input
                    type="text"
                    value={formData.href}
                    onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
                    placeholder="/dashboard"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
                  >
                    {ICON_OPTIONS.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parent Menu (Optional)</label>
                  <select
                    value={formData.parent_id}
                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Root Level --</option>
                    {parentOptions.map(menu => (
                      <option key={menu.id} value={menu.id}>{menu.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3 rounded-b-2xl">
                <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded-xl hover:bg-gray-100">
                  Batal
                </button>
                <button
                  onClick={handleSaveMenu}
                  disabled={!formData.label}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
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
