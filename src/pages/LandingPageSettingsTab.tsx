import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Plus, Edit2, Trash2, Loader2, Save, X, ChevronDown, ChevronUp,
  Layout, Layers, Award, Star, BookOpen, MessageSquare, Eye, EyeOff
} from 'lucide-react';

interface TableConfig {
  key: string;
  title: string;
  primary_key: string;
  columns: string[];
  hidden_columns: string[];
  fields: Record<string, FieldConfig>;
  relations: Record<string, any[]>;
}

interface FieldConfig {
  type: string;
  label: string;
  required?: boolean;
  options?: Record<string, string>;
  readonly?: boolean;
  placeholder?: string;
}

interface LandingTable {
  key: string;
  title: string;
  icon: any;
  description: string;
}

const LANDING_TABLES: LandingTable[] = [
  { key: 'landing_sections', title: 'Section Landing', icon: Layout, description: 'Kelola visibilitas & urutan section' },
  { key: 'landing_learning_modes', title: 'Program Belajar', icon: Layers, description: 'Pilihan program (Boarding, Non-Boarding, dll)' },
  { key: 'landing_features', title: 'Mengapa Memilih Kami', icon: Award, description: 'Keunggulan pondok' },
  { key: 'landing_characteristics', title: 'Karakteristik', icon: Star, description: '9 Karakteristik pembelajaran' },
  { key: 'landing_programs', title: 'Program Lainnya', icon: BookOpen, description: 'Program keagamaan & lainnya' },
  { key: 'landing_greeting', title: 'Kata Sambutan', icon: MessageSquare, description: 'Sambutan pimpinan pondok' },
];

export default function LandingPageSettingsTab() {
  const [activeTable, setActiveTable] = useState<string>('landing_sections');
  const [config, setConfig] = useState<TableConfig | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  
  // Expanded sections for accordion view
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    landing_sections: true,
  });
  
  // Section visibility state (from tb_landing_sections)
  const [sectionVisibility, setSectionVisibility] = useState<Record<string, boolean>>({});
  const [togglingSection, setTogglingSection] = useState<string | null>(null);

  // Map table keys to section_key in tb_landing_sections
  const TABLE_TO_SECTION_KEY: Record<string, string> = {
    'landing_learning_modes': 'learning_modes',
    'landing_features': 'features',
    'landing_characteristics': 'characteristics',
    'landing_programs': 'programs',
    'landing_greeting': 'greeting',
  };

  useEffect(() => {
    fetchSectionVisibility();
  }, []);

  useEffect(() => {
    if (activeTable) {
      fetchConfig();
      fetchData();
    }
  }, [activeTable]);

  const fetchSectionVisibility = async () => {
    try {
      const json: any = await api.get('/api/crud/landing_sections?per_page=100');
      if (json.success) {
        const items = Array.isArray(json.data) ? json.data : (json.data?.data || []);
        const visibility: Record<string, boolean> = {};
        items.forEach((item: any) => {
          visibility[item.section_key] = item.is_visible === 1 || item.is_visible === '1' || item.is_visible === true;
        });
        setSectionVisibility(visibility);
      }
    } catch (err) {
      console.error('Failed to fetch section visibility:', err);
    }
  };

  const toggleSectionVisibility = async (tableKey: string) => {
    const sectionKey = TABLE_TO_SECTION_KEY[tableKey];
    if (!sectionKey) return;
    
    setTogglingSection(tableKey);
    try {
      // First get the section id
      const json: any = await api.get('/api/crud/landing_sections?per_page=100');
      if (json.success) {
        const items = Array.isArray(json.data) ? json.data : (json.data?.data || []);
        const section = items.find((item: any) => item.section_key === sectionKey);
        if (section) {
          const newVisibility = !sectionVisibility[sectionKey];
          // Update the section
          const updateJson: any = await api.put(`/api/crud/landing_sections/${section.id_section}`, { is_visible: newVisibility ? 1 : 0 });
          if (updateJson.success) {
            setSectionVisibility(prev => ({ ...prev, [sectionKey]: newVisibility }));
            setMessage({ type: 'success', text: `Section ${newVisibility ? 'ditampilkan' : 'disembunyikan'} di landing page` });
            setTimeout(() => setMessage(null), 2000);
          }
        }
      }
    } catch (err) {
      console.error('Failed to toggle section:', err);
      setMessage({ type: 'error', text: 'Gagal mengubah visibilitas section' });
    } finally {
      setTogglingSection(null);
    }
  };

  const fetchConfig = async () => {
    try {
      const json: any = await api.get(`/api/crud/${activeTable}/config`);
      if (json.success) {
        setConfig(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch config:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const json: any = await api.get(`/api/crud/${activeTable}?per_page=100`);
      if (json.success) {
        // Handle different response formats
        let items = [];
        if (Array.isArray(json.data)) {
          items = json.data;
        } else if (json.data?.data && Array.isArray(json.data.data)) {
          items = json.data.data;
        } else if (typeof json.data === 'object' && json.data !== null) {
          items = Object.values(json.data).filter(Array.isArray)[0] || [];
        }
        setData(items);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({});
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ ...item });
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (!config) return;
    
    const confirmDelete = window.confirm('Yakin ingin menghapus data ini?');
    if (!confirmDelete) return;
    
    try {
      const json: any = await api.delete(`/api/crud/${activeTable}/${item[config.primary_key]}`);
      if (json.success) {
        setMessage({ type: 'success', text: 'Data berhasil dihapus' });
        fetchData();
      } else {
        setMessage({ type: 'error', text: json.message || 'Gagal menghapus data' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    }
    
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = async () => {
    if (!config) return;
    
    setSaving(true);
    try {
      let json: any;
      if (editingItem) {
        json = await api.put(`/api/crud/${activeTable}/${editingItem[config.primary_key]}`, formData);
      } else {
        json = await api.post(`/api/crud/${activeTable}`, formData);
      }
      
      if (json.success) {
        setMessage({ type: 'success', text: editingItem ? 'Data berhasil diupdate' : 'Data berhasil ditambahkan' });
        setShowModal(false);
        fetchData();
      } else {
        setMessage({ type: 'error', text: json.message || 'Gagal menyimpan data' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    } finally {
      setSaving(false);
    }
    
    setTimeout(() => setMessage(null), 3000);
  };

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
    setActiveTable(key);
  };

  const renderField = (fieldKey: string, fieldConfig: FieldConfig) => {
    const value = formData[fieldKey] ?? '';
    
    if (fieldConfig.type === 'select') {
      return (
        <select
          value={value}
          onChange={(e) => setFormData({ ...formData, [fieldKey]: e.target.value })}
          disabled={fieldConfig.readonly}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        >
          <option value="">-- Pilih --</option>
          {fieldConfig.options && Object.entries(fieldConfig.options).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      );
    }
    
    if (fieldConfig.type === 'relation' && config?.relations[fieldKey]) {
      const relationData = config.relations[fieldKey];
      const isKepengelolaan = fieldKey === 'pengurus_id' && relationData.some((opt: any) => opt.foto_santri !== undefined);
      
      // Get selected pengurus info for preview
      const selectedPengurus = isKepengelolaan && value 
        ? relationData.find((opt: any) => String(opt.id_kepengelolaan) === String(value))
        : null;
      
      return (
        <div className="space-y-2">
          <select
            value={value}
            onChange={(e) => setFormData({ ...formData, [fieldKey]: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Pilih --</option>
            {relationData.map((opt: any) => {
              const keys = Object.keys(opt);
              const idKey = keys[0];
              const displayKey = isKepengelolaan ? 'display_name' : keys[1];
              return (
                <option key={opt[idKey]} value={opt[idKey]}>{opt[displayKey]}</option>
              );
            })}
          </select>
          
          {/* Preview for kepengelolaan (pengurus) */}
          {isKepengelolaan && selectedPengurus && (
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              {selectedPengurus.foto_santri ? (
                <img 
                  src={selectedPengurus.foto_santri} 
                  alt={selectedPengurus.nama_lengkap_santri}
                  className="w-20 h-20 rounded-full object-cover border-3 border-white shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center border-3 border-white shadow-lg">
                  <span className="text-2xl text-white font-bold">{(selectedPengurus.nama_lengkap_santri || 'P').charAt(0)}</span>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-blue-700">{selectedPengurus.nama_jabatan}</p>
                <p className="font-medium text-gray-900">{selectedPengurus.nama_lengkap_santri}</p>
                <p className="text-xs text-gray-500 mt-1">Preview tampilan di landing page</p>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    if (fieldConfig.type === 'textarea' || fieldConfig.type === 'wysiwyg') {
      return (
        <textarea
          value={value}
          onChange={(e) => setFormData({ ...formData, [fieldKey]: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={fieldConfig.placeholder}
        />
      );
    }
    
    if (fieldConfig.type === 'number') {
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => setFormData({ ...formData, [fieldKey]: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={fieldConfig.placeholder}
        />
      );
    }
    
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => setFormData({ ...formData, [fieldKey]: e.target.value })}
        disabled={fieldConfig.readonly}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        placeholder={fieldConfig.placeholder}
      />
    );
  };

  const renderCellValue = (item: any, col: string) => {
    const value = item[col];
    
    // Handle boolean/status fields
    if (col === 'is_active' || col === 'is_visible' || col === 'is_featured') {
      return value === 1 || value === '1' || value === true ? (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
          <Eye className="w-3 h-3" /> Aktif
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
          <EyeOff className="w-3 h-3" /> Nonaktif
        </span>
      );
    }
    
    // Handle icon field - show icon name with emoji
    if (col === 'icon') {
      const iconEmojis: Record<string, string> = {
        'Home': '🏠', 'Sun': '☀️', 'Laptop': '💻', 'Zap': '⚡', 'BookOpen': '📖',
        'Users': '👥', 'Star': '⭐', 'Award': '🏆', 'Shield': '🛡️', 'Heart': '❤️',
        'Clock': '🕐', 'GraduationCap': '🎓', 'Briefcase': '💼', 'Globe': '🌍',
        'Cpu': '🖥️', 'Layout': '📐', 'MessageSquare': '💬', 'RefreshCw': '🔄',
        'Lightbulb': '💡', 'CheckCircle': '✅', 'Code': '💻',
      };
      return <span>{iconEmojis[value] || '📌'} {value}</span>;
    }
    
    // Handle color gradient
    if (col === 'color') {
      return value ? (
        <div className={`w-20 h-6 rounded bg-gradient-to-r ${value}`} title={value} />
      ) : '-';
    }
    
    // Truncate long text
    if (typeof value === 'string' && value.length > 50) {
      return value.substring(0, 50) + '...';
    }
    
    return value ?? '-';
  };

  const currentTableConfig = LANDING_TABLES.find(t => t.key === activeTable);

  return (
    <div className="space-y-4">
      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Accordion Tables */}
      <div className="space-y-2">
        {LANDING_TABLES.map((table) => {
          const Icon = table.icon;
          const isExpanded = expandedSections[table.key] && activeTable === table.key;
          const sectionKey = TABLE_TO_SECTION_KEY[table.key];
          const isVisible = sectionKey ? sectionVisibility[sectionKey] !== false : true;
          const canToggle = table.key !== 'landing_sections'; // Can't toggle the sections table itself
          
          return (
            <div key={table.key} className={`bg-white rounded-xl border overflow-hidden ${!isVisible && canToggle ? 'border-gray-200 opacity-60' : 'border-gray-200'}`}>
              {/* Header - Clickable */}
              <div className={`flex items-center justify-between px-4 py-3 ${isExpanded ? 'bg-blue-50 border-b border-gray-200' : 'hover:bg-gray-50'} transition-colors`}>
                <button
                  onClick={() => toggleSection(table.key)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <div className={`p-2 rounded-lg ${isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-medium ${isExpanded ? 'text-blue-900' : 'text-gray-900'}`}>{table.title}</h3>
                      {!isVisible && canToggle && (
                        <span className="px-1.5 py-0.5 text-xs bg-gray-200 text-gray-500 rounded">Hidden</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{table.description}</p>
                  </div>
                </button>
                <div className="flex items-center gap-3">
                  {/* Toggle Visibility Button */}
                  {canToggle && (
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSectionVisibility(table.key); }}
                      disabled={togglingSection === table.key}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isVisible ? 'bg-green-500' : 'bg-gray-300'} ${togglingSection === table.key ? 'opacity-50' : ''}`}
                      title={isVisible ? 'Tampil di landing page' : 'Tersembunyi di landing page'}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isVisible ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  )}
                  <button onClick={() => toggleSection(table.key)} className="p-1">
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
              </div>

              {/* Content - Expandable */}
              {isExpanded && (
                <div className="p-4">
                  {/* Add Button */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-500">
                      {data.length} data
                    </span>
                    <button
                      onClick={handleCreate}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah
                    </button>
                  </div>

                  {/* Data Table */}
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                  ) : data.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Belum ada data
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            {config?.columns.map((col) => (
                              <th key={col} className="px-3 py-2 text-left font-medium text-gray-600 whitespace-nowrap">
                                {config.fields[col]?.label || col.replace(/_/g, ' ')}
                              </th>
                            ))}
                            <th className="px-3 py-2 text-right font-medium text-gray-600">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {data.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              {config?.columns.map((col) => (
                                <td key={col} className="px-3 py-2 whitespace-nowrap">
                                  {renderCellValue(item, col)}
                                </td>
                              ))}
                              <td className="px-3 py-2 text-right whitespace-nowrap">
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg mr-1"
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Form */}
      {showModal && config && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                {editingItem ? 'Edit' : 'Tambah'} {currentTableConfig?.title}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
              {config.fields && Object.entries(config.fields).map(([fieldKey, fieldConfig]) => (
                <div key={fieldKey}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {fieldConfig.label}
                    {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderField(fieldKey, fieldConfig)}
                </div>
              ))}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
