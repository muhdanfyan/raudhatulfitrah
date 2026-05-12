import { useState, useEffect } from 'react';
import { API_URL, getHeaders } from '../services/api';
import { Loader2, Save, ChevronDown, Check, Shield, Eye, Pencil, Trash2 } from 'lucide-react';

interface FeatureAccess {
  id: number;
  role_id: number;
  feature_key: string;
  can_read: boolean;
  can_write: boolean;
  can_delete: boolean;
}

interface RoleOption {
  id: number;
  name: string;
}

const FEATURE_KEYS = [
  { key: 'data_santri', label: 'Data Santri', description: 'Kelola data santri dan biodata' },
  { key: 'tahfidz', label: 'Tahfidz', description: 'Input dan monitoring hafalan' },
  { key: 'presensi', label: 'Presensi', description: 'Absensi dan kehadiran' },
  { key: 'ibadah', label: 'Ibadah', description: 'Catatan ibadah harian' },
  { key: 'tatib', label: 'Tata Tertib', description: 'Pelanggaran dan sanksi' },
  { key: 'lms', label: 'LMS', description: 'Learning Management System' },
  { key: 'roadmap', label: 'Roadmap', description: 'Roadmap pembelajaran' },
  { key: 'rapor', label: 'Rapor', description: 'Rapor dan penilaian' },
  { key: 'keuangan', label: 'Keuangan', description: 'Kas dan transaksi' },
  { key: 'inventaris', label: 'Inventaris', description: 'Barang dan aset' },
  { key: 'piket', label: 'Piket', description: 'Jadwal piket' },
  { key: 'koperasi', label: 'Koperasi', description: 'Point of sale dan produk' },
  { key: 'ppdb', label: 'PPDB', description: 'Pendaftaran santri baru' },
  { key: 'settings', label: 'Settings', description: 'Pengaturan sistem' },
  { key: 'users', label: 'Users', description: 'Manajemen user dan role' },
];

export default function FeatureAccessEditor() {
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [features, setFeatures] = useState<FeatureAccess[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rolesOpen, setRolesOpen] = useState(false);


  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    if (selectedRoleId) {
      fetchFeatures(selectedRoleId);
    }
  }, [selectedRoleId]);

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_URL}/roles`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Accept': 'application/json',
        }
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

  const fetchFeatures = async (roleId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/roles/${roleId}/features`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Accept': 'application/json',
        }
      });
      const data = await response.json();
      if (data.success) {
        const featureData = data.data?.features || [];
        if (featureData.length === 0) {
          const defaultFeatures = FEATURE_KEYS.map(f => ({
            id: 0,
            role_id: roleId,
            feature_key: f.key,
            can_read: true,
            can_write: false,
            can_delete: false,
          }));
          setFeatures(defaultFeatures);
        } else {
          const existingKeys = featureData.map((f: FeatureAccess) => f.feature_key);
          const missingFeatures = FEATURE_KEYS
            .filter(f => !existingKeys.includes(f.key))
            .map(f => ({
              id: 0,
              role_id: roleId,
              feature_key: f.key,
              can_read: false,
              can_write: false,
              can_delete: false,
            }));
          setFeatures([...featureData, ...missingFeatures]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch features:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (featureKey: string, permission: 'can_read' | 'can_write' | 'can_delete') => {
    setFeatures(prev => prev.map(f => {
      if (f.feature_key === featureKey) {
        const newValue = !f[permission];
        if (permission === 'can_read' && !newValue) {
          return { ...f, can_read: false, can_write: false, can_delete: false };
        }
        if ((permission === 'can_write' || permission === 'can_delete') && newValue && !f.can_read) {
          return { ...f, can_read: true, [permission]: newValue };
        }
        return { ...f, [permission]: newValue };
      }
      return f;
    }));
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/roles/${selectedRoleId}/features`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ features }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Akses fitur berhasil disimpan!');
      } else {
        alert(data.message || 'Gagal menyimpan akses fitur');
      }
    } catch (error: any) {
      alert(error.message || 'Gagal menyimpan akses fitur');
    } finally {
      setSaving(false);
    }
  };

  const setAllPermissions = (permission: 'can_read' | 'can_write' | 'can_delete', value: boolean) => {
    setFeatures(prev => prev.map(f => {
      if (permission === 'can_read') {
        return value 
          ? { ...f, can_read: true }
          : { ...f, can_read: false, can_write: false, can_delete: false };
      }
      return { ...f, [permission]: value, can_read: value ? true : f.can_read };
    }));
  };

  const selectedRole = roles.find(r => r.id === selectedRoleId);
  const getFeatureLabel = (key: string) => FEATURE_KEYS.find(f => f.key === key)?.label || key;
  const getFeatureDesc = (key: string) => FEATURE_KEYS.find(f => f.key === key)?.description || '';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Akses Fitur</h2>
            <p className="text-sm text-gray-500">Atur permission read/write/delete untuk setiap fitur per role</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !selectedRoleId}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all shadow-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan
          </button>
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
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-b from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fitur
                  </th>
                  <th className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <Eye className="w-3.5 h-3.5" />
                        Read
                      </div>
                      <button
                        onClick={() => setAllPermissions('can_read', true)}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        All
                      </button>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <Pencil className="w-3.5 h-3.5" />
                        Write
                      </div>
                      <button
                        onClick={() => setAllPermissions('can_write', true)}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        All
                      </button>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </div>
                      <button
                        onClick={() => setAllPermissions('can_delete', true)}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        All
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {features.map(feature => (
                  <tr key={feature.feature_key} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Shield className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{getFeatureLabel(feature.feature_key)}</div>
                          <div className="text-xs text-gray-500">{getFeatureDesc(feature.feature_key)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => togglePermission(feature.feature_key, 'can_read')}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                          feature.can_read
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {feature.can_read ? <Check className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => togglePermission(feature.feature_key, 'can_write')}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                          feature.can_write
                            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {feature.can_write ? <Check className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => togglePermission(feature.feature_key, 'can_delete')}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                          feature.can_delete
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {feature.can_delete ? <Check className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
