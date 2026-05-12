import { useState, useEffect } from 'react';
import { API_URL, getHeaders } from '../../services/api';
import { LayoutGrid, Loader2, Save, Check, X, Eye, EyeOff } from 'lucide-react';

interface Widget {
  id?: number;
  widget_key: string;
  is_enabled: boolean;
  grid_x: number;
  grid_y: number;
  grid_w: number;
  grid_h: number;
}

interface Role {
  id: number;
  name: string;
}

const WIDGET_LABELS: Record<string, string> = {
  stat_card: 'Statistik Card',
  masukan_panel: 'Panel Masukan',
  current_activity: 'Aktivitas Sekarang',
  jobdesk_panel: 'Panel Jobdesk',
  sop_checklist: 'SOP Checklist',
  tugas_admin: 'Tugas Admin',
  proker_status: 'Status Proker',
  belum_setor: 'Belum Setor',
  ibadah_report: 'Laporan Ibadah',
};

export default function WidgetMappingTab() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [availableWidgets, setAvailableWidgets] = useState<string[]>([]);
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

  const fetchWidgets = async (roleId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/roles/${roleId}/widgets`, {
        headers: getHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setWidgets(data.data.widgets);
        setAvailableWidgets(data.data.available_widgets);
      }
    } catch (error) {
      console.error('Failed to fetch widgets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      fetchWidgets(selectedRole);
      setHasChanges(false);
    }
  }, [selectedRole]);

  const toggleWidget = (widgetKey: string) => {
    const existing = widgets.find(w => w.widget_key === widgetKey);
    if (existing) {
      setWidgets(widgets.map(w => 
        w.widget_key === widgetKey ? { ...w, is_enabled: !w.is_enabled } : w
      ));
    } else {
      setWidgets([...widgets, {
        widget_key: widgetKey,
        is_enabled: true,
        grid_x: 0,
        grid_y: widgets.length * 2,
        grid_w: 4,
        grid_h: 2
      }]);
    }
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/roles/${selectedRole}/widgets`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ widgets })
      });
      const data = await response.json();
      if (data.success) {
        setHasChanges(false);
        alert('Widget berhasil disimpan');
      } else {
        alert(data.message || 'Gagal menyimpan');
      }
    } catch (error) {
      console.error('Failed to save widgets:', error);
    } finally {
      setSaving(false);
    }
  };

  const selectedRoleName = roles.find(r => r.id === selectedRole)?.name || '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Widget per Role</h2>
          <p className="text-sm text-gray-500">Atur widget yang tampil di dashboard tiap role</p>
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
              <LayoutGrid className="w-5 h-5" />
              Widget untuk <span className="text-primary capitalize">{selectedRoleName}</span>
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableWidgets.map((widgetKey) => {
                const widget = widgets.find(w => w.widget_key === widgetKey);
                const isEnabled = widget?.is_enabled ?? false;

                return (
                  <div
                    key={widgetKey}
                    onClick={() => toggleWidget(widgetKey)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isEnabled
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isEnabled ? 'bg-green-100' : 'bg-gray-200'}`}>
                          {isEnabled ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-500" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{WIDGET_LABELS[widgetKey] || widgetKey}</p>
                          <p className="text-xs text-gray-500">{widgetKey}</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isEnabled ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {isEnabled ? <Check className="w-4 h-4 text-white" /> : <X className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
