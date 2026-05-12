import { useState, useEffect } from 'react';
import { API_URL, getHeaders } from '../../services/api';
import { Lock, Loader2, Save, Eye, Edit3, Trash2, Check, X } from 'lucide-react';

interface Feature {
  feature_key: string;
  can_read: boolean;
  can_write: boolean;
  can_delete: boolean;
}

interface Role {
  id: number;
  name: string;
}

const FEATURE_LABELS: Record<string, string> = {
  data_santri: 'Data Santri',
  tahfidz: 'Tahfidz',
  presensi: 'Presensi',
  ibadah: 'Ibadah',
  tatib: 'Tata Tertib',
  lms: 'LMS',
  roadmap: 'Roadmap',
  rapor: 'Rapor',
  keuangan: 'Keuangan',
  inventaris: 'Inventaris',
  piket: 'Piket',
  koperasi: 'Koperasi',
  ppdb: 'PPDB',
  settings: 'Settings',
  users: 'Users',
};

export default function FeatureAccessTab() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);


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

  const fetchFeatures = async (roleId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/roles/${roleId}/features`, {
        headers: getHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setFeatures(data.data.features);
      }
    } catch (error) {
      console.error('Failed to fetch features:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      fetchFeatures(selectedRole);
      setHasChanges(false);
    }
  }, [selectedRole]);

  const togglePermission = (featureKey: string, permission: 'can_read' | 'can_write' | 'can_delete') => {
    setFeatures(features.map(f => {
      if (f.feature_key === featureKey) {
        return { ...f, [permission]: !f[permission] };
      }
      return f;
    }));
    setHasChanges(true);
  };

  const toggleAllForFeature = (featureKey: string) => {
    setFeatures(features.map(f => {
      if (f.feature_key === featureKey) {
        const allEnabled = f.can_read && f.can_write && f.can_delete;
        return { ...f, can_read: !allEnabled, can_write: !allEnabled, can_delete: !allEnabled };
      }
      return f;
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/roles/${selectedRole}/features`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ features })
      });
      const data = await response.json();
      if (data.success) {
        setHasChanges(false);
        alert('Akses fitur berhasil disimpan');
      } else {
        alert(data.message || 'Gagal menyimpan');
      }
    } catch (error) {
      console.error('Failed to save features:', error);
    } finally {
      setSaving(false);
    }
  };

  const selectedRoleName = roles.find(r => r.id === selectedRole)?.name || '';

  const PermissionButton = ({
    active,
    onClick,
    icon: Icon,
    label,
    colorClass
  }: {
    active: boolean;
    onClick: () => void;
    icon: any;
    label: string;
    colorClass: string;
  }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
        active ? colorClass : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
      }`}
      title={label}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Akses Fitur (RBAC)</h2>
          <p className="text-sm text-gray-500">Atur hak akses Read/Write/Delete per role</p>
        </div>
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all shadow-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Perubahan
          </button>
        )}
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
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Akses untuk <span className="text-primary capitalize">{selectedRoleName}</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fitur</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Read</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Write</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Delete</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Toggle All</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {features.map((feature) => (
                  <tr key={feature.feature_key} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {FEATURE_LABELS[feature.feature_key] || feature.feature_key}
                      </div>
                      <div className="text-xs text-gray-500">{feature.feature_key}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <PermissionButton
                        active={feature.can_read}
                        onClick={() => togglePermission(feature.feature_key, 'can_read')}
                        icon={Eye}
                        label="Read"
                        colorClass="bg-blue-100 text-blue-700"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <PermissionButton
                        active={feature.can_write}
                        onClick={() => togglePermission(feature.feature_key, 'can_write')}
                        icon={Edit3}
                        label="Write"
                        colorClass="bg-green-100 text-green-700"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <PermissionButton
                        active={feature.can_delete}
                        onClick={() => togglePermission(feature.feature_key, 'can_delete')}
                        icon={Trash2}
                        label="Delete"
                        colorClass="bg-red-100 text-red-700"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleAllForFeature(feature.feature_key)}
                        className={`p-2 rounded-lg transition-all ${
                          feature.can_read && feature.can_write && feature.can_delete
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                        title="Toggle All"
                      >
                        {feature.can_read && feature.can_write && feature.can_delete ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
