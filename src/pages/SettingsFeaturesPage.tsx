import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Loader2, Settings, Power, Calendar, Search, ChevronDown, ChevronUp } from 'lucide-react';



interface Feature {
  id: number;
  feature_key: string;
  feature_name: string;
  feature_group: string;
  description: string;
  is_active: boolean;
  icon: string;
  sort_order: number;
  scheduled_active_at: string | null;
  scheduled_inactive_at: string | null;
  updated_at: string;
}

const groupLabels: Record<string, string> = {
  akademik: 'Akademik & Tahfidz',
  pembinaan: 'Pembinaan & Tata Tertib',
  asrama: 'Asrama & Operasional',
  keuangan: 'Keuangan & Donasi',
  koperasi: 'Koperasi',
  lainnya: 'Lainnya',
  publik: 'Halaman Publik',
};

export default function SettingsFeaturesPage() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);



  const fetchFeatures = async () => {
    try {
      const json: any = await api.get('/api/settings/features');
      if (json.success) {
        setFeatures(json.data);
        setGroups(json.groups || []);
        // Expand all groups by default
        setExpandedGroups(json.groups || []);
      }
    } catch (err) {
      console.error('Failed to fetch features:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const handleToggle = async (key: string) => {
    setToggling(key);
    try {
      const json: any = await api.put(`/api/settings/features/${key}`);
      if (json.success) {
        setFeatures(prev => prev.map(f =>
          f.feature_key === key ? { ...f, is_active: json.data.is_active } : f
        ));
      }
    } catch (err) {
      console.error('Failed to toggle feature:', err);
    } finally {
      setToggling(null);
    }
  };

  const toggleGroupExpand = (group: string) => {
    setExpandedGroups(prev =>
      prev.includes(group)
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  const filteredFeatures = features.filter(f => {
    const matchSearch = !search ||
      f.feature_name.toLowerCase().includes(search.toLowerCase()) ||
      f.feature_key.toLowerCase().includes(search.toLowerCase());
    const matchGroup = !filterGroup || f.feature_group === filterGroup;
    return matchSearch && matchGroup;
  });

  const groupedFeatures = filteredFeatures.reduce((acc, f) => {
    const group = f.feature_group || 'lainnya';
    if (!acc[group]) acc[group] = [];
    acc[group].push(f);
    return acc;
  }, {} as Record<string, Feature[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Kelola Fitur Aplikasi
          </h1>
          <p className="text-gray-600 mt-1">
            Aktifkan atau nonaktifkan modul sesuai kebutuhan pesantren
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">
            {features.filter(f => f.is_active).length} Aktif
          </span>
          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
            {features.filter(f => !f.is_active).length} Nonaktif
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari fitur..."
            className="border border-gray-300 rounded-lg pl-9 pr-3 py-2 w-56"
          />
        </div>
        <select
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">Semua Grup</option>
          {groups.map(group => (
            <option key={group} value={group}>{groupLabels[group] || group}</option>
          ))}
        </select>
      </div>

      {/* Feature Groups */}
      <div className="space-y-4">
        {Object.entries(groupedFeatures).map(([group, groupFeatures]) => (
          <div key={group} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Group Header */}
            <button
              onClick={() => toggleGroupExpand(group)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition"
            >
              <h2 className="font-semibold text-gray-800">
                {groupLabels[group] || group}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({groupFeatures.length} fitur)
                </span>
              </h2>
              {expandedGroups.includes(group) ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {/* Features List */}
            {expandedGroups.includes(group) && (
              <div className="divide-y divide-gray-100">
                {groupFeatures.map(feature => (
                  <div
                    key={feature.feature_key}
                    className={`flex items-center justify-between p-4 hover:bg-gray-50 transition ${
                      !feature.is_active ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{feature.feature_name}</h3>
                        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                          {feature.feature_key}
                        </code>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{feature.description}</p>
                      {(feature.scheduled_active_at || feature.scheduled_inactive_at) && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                          <Calendar className="w-3 h-3" />
                          {feature.scheduled_active_at && (
                            <span>Aktif: {new Date(feature.scheduled_active_at).toLocaleString('id-ID')}</span>
                          )}
                          {feature.scheduled_inactive_at && (
                            <span>Nonaktif: {new Date(feature.scheduled_inactive_at).toLocaleString('id-ID')}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggle(feature.feature_key)}
                      disabled={toggling === feature.feature_key}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                        feature.is_active
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {toggling === feature.feature_key ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Power className="w-4 h-4" />
                      )}
                      {feature.is_active ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
