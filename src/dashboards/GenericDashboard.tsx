import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import DashboardWidgetRenderer, { WidgetConfig, DashboardData } from '../components/DashboardWidgetRenderer';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { Settings, Save, X, Loader2, MessageCircle } from 'lucide-react';

interface GenericDashboardProps {
  roleName: string;
  title: string;
  subtitle?: string;
  jabatanName?: string;
  jabatanId?: number;
  dashboardApiEndpoint?: string; // e.g. '/api/dashboard/kepsek'
}

export default function GenericDashboard({
  roleName,
  title,
  subtitle,
  jabatanName,
  jabatanId,
  dashboardApiEndpoint,
}: GenericDashboardProps) {
  const { settings } = useSettings();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData>({});
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [savingLayout, setSavingLayout] = useState(false);
  const [roleId, setRoleId] = useState<number | null>(null);

  const canEdit = user?.role && ['superadmin', 'admin', 'akademik', 'pembinaan', 'asrama', 'kepsek'].includes(user.role.toLowerCase());

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch widgets configuration from /api/me/widgets
      const widgetsRes = await api.get('/me/widgets');
      if (widgetsRes.success) {
        setWidgets(widgetsRes.data?.sort((a: any, b: any) => a.grid_y - b.grid_y) || []);
      }

      // If admin, fetch roles to find the roleId for this dashboard
      if (canEdit) {
        const rolesRes: any = await api.get('/api/roles');
        if (rolesRes.success) {
          // Map superadmin to admin for widget configuration purposes
          const targetRoleName = roleName.toLowerCase() === 'superadmin' ? 'admin' : roleName.toLowerCase();
          
          const roleObj = rolesRes.data.find((r: any) => r.name.toLowerCase() === targetRoleName);
          if (roleObj) setRoleId(roleObj.id);
        }
      }

      // Fetch dashboard data from role-specific endpoint
      if (dashboardApiEndpoint) {
        const dashRes = await api.get(dashboardApiEndpoint);
        if (dashRes.success || dashRes.stats) {
          setDashboardData(dashRes.data || dashRes);
        }
      } else {
        // Fallback to admin dashboard data
        const dashRes = await api.getDashboardAdmin();
        setDashboardData(dashRes || {});
      }

    } catch (err: any) {
      console.error('GenericDashboard fetch error:', err);
      setError(err.message || 'Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  }, [dashboardApiEndpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveLayout = async () => {
    if (!roleId) {
      alert('Gagal mengidentifikasi Role ID untuk dashboard ini');
      return;
    }
    
    setSavingLayout(true);
    try {
      const res: any = await api.post(`/api/roles/${roleId}/widgets`, { widgets });
      if (res.success) {
        alert('Tata letak berhasil disimpan!');
        setIsEditing(false);
      } else {
        alert(res.message || 'Gagal menyimpan tata letak');
      }
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat menyimpan');
    } finally {
      setSavingLayout(false);
    }
  };

  const updateWidgetSize = (key: string, w: number, x: number) => {
    setWidgets(prev => prev.map(wgt => 
      wgt.widget_key === key ? { ...wgt, grid_w: w, grid_x: x } : wgt
    ));
  };

  const removeWidget = (key: string) => {
    if (window.confirm('Hapus widget ini dari dashboard?')) {
      setWidgets(prev => prev.filter(wgt => wgt.widget_key !== key));
    }
  };

  const moveWidget = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= widgets.length) return;
    
    setWidgets(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[newIndex];
      next[newIndex] = temp;
      return next.map((w, idx) => ({ ...w, grid_y: idx }));
    });
  };

  const handleAddWidget = (key: string) => {
    setWidgets(prev => [
      ...prev,
      {
        widget_key: key,
        grid_x: 0,
        grid_y: prev.length,
        grid_w: 12,
        grid_h: 2,
        is_enabled: true
      }
    ]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <p className="font-medium">Error</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={fetchData}
          className="mt-2 text-sm text-red-600 underline hover:no-underline"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  if (widgets.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-700 p-6 rounded-lg text-center">
        <p className="font-medium">Belum ada widget yang dikonfigurasi</p>
        <p className="text-sm mt-1">
          Silakan hubungi admin untuk mengatur widget dashboard untuk role Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {settings?.logo && (
            <img src={settings.logo} alt="Logo" className="w-16 h-16 object-contain" />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
            {subtitle && <p className="text-gray-600 font-medium">{subtitle}</p>}
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all font-bold text-xs"
              >
                <Settings className="w-4 h-4" />
                Kelola Tampilan
              </button>
            ) : (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                <button
                  onClick={handleSaveLayout}
                  disabled={savingLayout}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 transition-all font-bold text-xs"
                >
                  {savingLayout ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Simpan Layout
                </button>
                <button
                  onClick={() => { setIsEditing(false); fetchData(); }}
                  className="p-2 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-xl transition-colors"
                  title="Batalkan"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dynamic Widgets */}
      <DashboardWidgetRenderer
        widgets={widgets}
        dashboardData={dashboardData}
        role={roleName}
        jabatanName={jabatanName || roleName}
        jabatanId={jabatanId}
        onRefresh={fetchData}
        isEditing={isEditing}
        onUpdateSize={updateWidgetSize}
        onMove={moveWidget}
        onRemove={removeWidget}
        onAdd={handleAddWidget}
      />

      {/* Floating Chat Button */}
      <Link
        to="/chat"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
        title="Chat dengan AI Asisten"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-semibold hidden sm:inline">Chat AI</span>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
      </Link>
    </div>
  );
}

