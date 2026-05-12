import { useState, useEffect } from 'react';
import { API_URL, getHeaders } from '../services/api';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { 
  Loader2, Plus, Pencil, Trash2, Eye, Search, 
  ChevronLeft, ChevronRight, X, Save, ArrowLeft, Database
} from 'lucide-react';
import SearchableSelect from '../components/SearchableSelect';
import { getStudentPhotoUrl } from '../utils/imageUtils';


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
  accept?: string;
}

interface TableItem {
  key: string;
  title: string;
  table: string;
}

export default function DataPage() {
  const { tableKey } = useParams<{ tableKey?: string }>();
  const [searchParams] = useSearchParams();
  const whereField = searchParams.get('where');
  const whereValue = searchParams.get('value');

  const [tables, setTables] = useState<TableItem[]>([]);
  const [config, setConfig] = useState<TableConfig | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Search
  const [search, setSearch] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  // Delete
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);


  // Fetch available tables
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await fetch(`${API_URL}/crud/tables`, {
          headers: getHeaders()
        });
        const json = await res.json();
        if (json.success) {
          setTables(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch tables:', err);
      }
    };
    fetchTables();
  }, []);

  // Fetch config when tableKey changes
  useEffect(() => {
    if (!tableKey) {
      setConfig(null);
      setData([]);
      setLoading(false);
      return;
    }

    const fetchConfig = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/crud/${tableKey}/config`, {
          headers: getHeaders()
        });
        const json = await res.json();
        if (json.success) {
          setConfig(json.data);
        } else {
          setError(json.message || 'Gagal memuat konfigurasi');
        }
      } catch (err: any) {
        setError(err.message || 'Gagal memuat konfigurasi');
      }
    };
    fetchConfig();
  }, [tableKey]);

  // Fetch data when config or page changes
  useEffect(() => {
    if (!tableKey || !config) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        let url = `${API_URL}/crud/${tableKey}?page=${currentPage}&per_page=15`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (whereField && whereValue) url += `&where=${whereField}&value=${whereValue}`;

        const res = await fetch(url, {
          headers: getHeaders()
        });
        const json = await res.json();
        if (json.success) {
          setData(json.data.items);
          setTotalPages(json.data.last_page);
          setTotal(json.data.total);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tableKey, config, currentPage, search, whereField, whereValue]);

  const handleCreate = () => {
    setModalMode('create');
    setSelectedItem(null);
    setFormData({});
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setModalMode('edit');
    setSelectedItem(item);
    setFormData({ ...item });
    setShowModal(true);
  };

  const handleView = (item: any) => {
    setModalMode('view');
    setSelectedItem(item);
    setFormData({ ...item });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);

    try {
      const url = modalMode === 'create' 
        ? `${API_URL}/crud/${tableKey}`
        : `${API_URL}/crud/${tableKey}/${selectedItem[config.primary_key]}`;

      const method = modalMode === 'create' ? 'POST' : 'PUT';

      // Check if has file (single or multiple)
      const hasFile = Object.entries(config.fields).some(
        ([key, field]) => field.type === 'file' && (
          formData[key] instanceof File || 
          (Array.isArray(formData[key]) && formData[key].some((f: any) => f instanceof File))
        )
      );

      let res;
      if (hasFile) {
        const fd = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            // Handle multiple files
            if (Array.isArray(value) && value.some((f: any) => f instanceof File)) {
              value.forEach((file: File) => {
                fd.append(`${key}[]`, file);
              });
            } else {
              fd.append(key, value as any);
            }
          }
        });
        if (method === 'PUT') fd.append('_method', 'PUT');
        
        res = await fetch(url, {
          method: 'POST',
          headers: getHeaders(),
          body: fd,
        });
      } else {
        res = await fetch(url, {
          method,
          headers: getHeaders(true),
          body: JSON.stringify(formData),
        });
      }

      const json = await res.json();
      if (json.success) {
        setShowModal(false);
        // Refresh data
        setCurrentPage(1);
        const dataRes = await fetch(`${API_URL}/crud/${tableKey}?page=1&per_page=15`, {
          headers: getHeaders()
        });
        const dataJson = await dataRes.json();
        if (dataJson.success) {
          setData(dataJson.data.items);
          setTotalPages(dataJson.data.last_page);
          setTotal(dataJson.data.total);
        }
      } else {
        alert(json.message || 'Gagal menyimpan data');
      }
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId || !config) return;
    setDeleting(true);

    try {
      const res = await fetch(`${API_URL}/crud/${tableKey}/${deleteId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        setDeleteId(null);
        setData(data.filter(item => item[config.primary_key] !== deleteId));
        setTotal(total - 1);
      } else {
        alert(json.message || 'Gagal menghapus data');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const getDisplayValue = (item: any, col: string, asElement = false) => {
    // Check if has relation name
    if (item[col + '_nama']) {
      return item[col + '_nama'];
    }
    
    // Check if it's an image field
    const isImageField = col === 'gambar' || col === 'foto' || col === 'thumbnail' || col === 'image' || col === 'file_daily' || col === 'foto_santri';
    
    // Check for multiple images (gambar_urls)
    const multipleUrls = item[col + '_urls'];
    if (isImageField && Array.isArray(multipleUrls) && multipleUrls.length > 0) {
      if (asElement) {
        return (
          <div className="flex items-center gap-1">
            <img 
              src={getCloudinaryThumb(multipleUrls[0])} 
              alt={col}
              className="w-12 h-12 object-cover rounded-lg border border-gray-200"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=No+Image';
              }}
            />
            {multipleUrls.length > 1 && (
              <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                +{multipleUrls.length - 1}
              </span>
            )}
          </div>
        );
      }
      return `📷 ${multipleUrls.length} Gambar`;
    }
    
    // Check for single image (has _url suffix available or is a URL)
    const imageUrl = item[col + '_url'] || (typeof item[col] === 'string' && item[col].startsWith('http') ? item[col] : null);
    if (imageUrl && isImageField) {
      if (asElement) {
        return (
          <img 
            src={getStudentPhotoUrl(imageUrl)} 
            alt={col}
            className="w-12 h-12 object-cover rounded-lg border border-gray-200"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=No+Image';
            }}
          />
        );
      }
      return '📷 Gambar';
    }
    
    const value = item[col];
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Ya' : 'Tidak';
    if (col.includes('created_at') || col.includes('updated_at') || col.includes('tgl')) {
      return new Date(value).toLocaleDateString('id-ID');
    }
    return String(value);
  };
  
  // Helper to get Cloudinary thumbnail URL
  const getCloudinaryThumb = (url: string, width = 100, height = 100) => {
    if (!url) return url;
    // Check if it's a Cloudinary URL
    if (url.includes('res.cloudinary.com')) {
      // Insert transformation after /upload/
      return url.replace('/upload/', `/upload/c_fill,w_${width},h_${height},q_auto,f_auto/`);
    }
    return url;
  };

  const renderField = (field: string, fieldConfig: FieldConfig) => {
    const value = formData[field] ?? '';
    const isDisabled = modalMode === 'view';

    if (fieldConfig.type === 'relation') {
      const options = config?.relations[field] || [];
      const selectOptions = options.map((opt: any) => {
        const keys = Object.keys(opt);
        const idKey = keys.find(k => k.includes('id_') || k === 'id') || keys[0];
        const nameKey = keys.find(k => k.includes('nama') || k.includes('name')) || keys[1];
        return { value: opt[idKey], label: opt[nameKey] };
      });
      
      // Use SearchableSelect for santri relations or when options > 10
      const isSantriRelation = field.includes('santri') || field.includes('pj') || field.includes('musyrif') || field.includes('pejabat');
      if (options.length > 10 || isSantriRelation) {
        return (
          <SearchableSelect
            options={selectOptions}
            value={value || 0}
            onChange={(val) => setFormData({ ...formData, [field]: val })}
            disabled={isDisabled}
            placeholder="-- Pilih --"
            searchPlaceholder="Cari nama..."
            showAvatar={isSantriRelation}
          />
        );
      }
      
      return (
        <select
          value={value}
          onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
          disabled={isDisabled}
          className="w-full border border-gray-300 rounded-lg p-2.5 disabled:bg-gray-100"
          required={fieldConfig.required}
        >
          <option value="">-- Pilih --</option>
          {selectOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    }

    if (fieldConfig.type === 'select') {
      return (
        <select
          value={value}
          onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
          disabled={isDisabled}
          className="w-full border border-gray-300 rounded-lg p-2.5 disabled:bg-gray-100"
          required={fieldConfig.required}
        >
          <option value="">-- Pilih --</option>
          {Object.entries(fieldConfig.options || {}).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      );
    }

    if (fieldConfig.type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
          disabled={isDisabled}
          rows={3}
          className="w-full border border-gray-300 rounded-lg p-2.5 disabled:bg-gray-100"
          required={fieldConfig.required}
        />
      );
    }

    if (fieldConfig.type === 'checkbox') {
      return (
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => setFormData({ ...formData, [field]: e.target.checked ? 1 : 0 })}
          disabled={isDisabled}
          className="w-5 h-5"
        />
      );
    }

    if (fieldConfig.type === 'file') {
      const isImage = fieldConfig.accept?.includes('image');
      const isMultiple = (fieldConfig as any).multiple;
      const maxFiles = (fieldConfig as any).max || 5;
      
      // Handle multiple files
      const existingUrls: string[] = formData[field + '_urls'] || [];
      const newFiles: File[] = Array.isArray(value) ? value : (value instanceof File ? [value] : []);
      const existingUrl = formData[field + '_url'] || (typeof value === 'string' && value.startsWith('http') ? value : null);
      
      if (isMultiple) {
        return (
          <div className="space-y-3">
            {/* Multiple Image Previews */}
            {isImage && (existingUrls.length > 0 || newFiles.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {existingUrls.map((url, idx) => (
                  <div key={`existing-${idx}`} className="relative">
                    <img src={url} alt={`Preview ${idx + 1}`} className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200" />
                    {!isDisabled && (
                      <button
                        type="button"
                        onClick={() => {
                          const newUrls = existingUrls.filter((_, i) => i !== idx);
                          setFormData({ ...formData, [field + '_urls']: newUrls });
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                {newFiles.map((file, idx) => (
                  <div key={`new-${idx}`} className="relative">
                    <img src={URL.createObjectURL(file)} alt={`New ${idx + 1}`} className="w-24 h-24 object-cover rounded-lg border-2 border-blue-300" />
                    <button
                      type="button"
                      onClick={() => {
                        const updatedFiles = newFiles.filter((_, i) => i !== idx);
                        setFormData({ ...formData, [field]: updatedFiles.length > 0 ? updatedFiles : null });
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Multiple Upload Input */}
            {!isDisabled && (existingUrls.length + newFiles.length) < maxFiles && (
              <div className="relative">
                <input
                  type="file"
                  id={`file-${field}`}
                  accept={fieldConfig.accept || '*'}
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const currentFiles = Array.isArray(value) ? value : [];
                    const combined = [...currentFiles, ...files].slice(0, maxFiles - existingUrls.length);
                    setFormData({ ...formData, [field]: combined });
                  }}
                  className="hidden"
                />
                <label
                  htmlFor={`file-${field}`}
                  className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-400 hover:bg-primary/5 transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-600">
                    Klik untuk upload gambar (maks {maxFiles}, tersisa {maxFiles - existingUrls.length - newFiles.length})
                  </span>
                </label>
              </div>
            )}
          </div>
        );
      }
      
      // Single file upload
      const previewUrl = value instanceof File ? URL.createObjectURL(value) : existingUrl;
      
      return (
        <div className="space-y-3">
          {/* Image Preview */}
          {isImage && previewUrl && (
            <div className="relative inline-block">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
              />
              {!isDisabled && value && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, [field]: null, [field + '_url']: null })}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
          
          {/* Upload Input */}
          {!isDisabled && (
            <div className="relative">
              <input
                type="file"
                id={`file-${field}`}
                accept={fieldConfig.accept || '*'}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.files?.[0] })}
                className="hidden"
              />
              <label
                htmlFor={`file-${field}`}
                className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-400 hover:bg-primary/5 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-600">
                  {value instanceof File ? value.name : 'Klik untuk upload gambar'}
                </span>
              </label>
            </div>
          )}
          
          {/* File name for non-image */}
          {!isImage && value && typeof value === 'string' && (
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              File: {value.split('/').pop()}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        type={fieldConfig.type === 'number' ? 'number' : fieldConfig.type === 'date' ? 'date' : fieldConfig.type === 'time' ? 'time' : 'text'}
        value={value}
        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
        disabled={isDisabled}
        className="w-full border border-gray-300 rounded-lg p-2.5 disabled:bg-gray-100"
        required={fieldConfig.required}
      />
    );
  };

  // State for table search
  const [tableSearch, setTableSearch] = useState('');

  // Filter tables based on search
  const filteredTables = tables.filter(table => 
    table.title.toLowerCase().includes(tableSearch.toLowerCase()) ||
    table.table.toLowerCase().includes(tableSearch.toLowerCase()) ||
    table.key.toLowerCase().includes(tableSearch.toLowerCase())
  );

  // Table selector view
  if (!tableKey) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Data Master</h1>
            <p className="text-gray-600">Pilih tabel yang ingin dikelola ({filteredTables.length} tabel)</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari tabel..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-primary"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
            />
            {tableSearch && (
              <button
                onClick={() => setTableSearch('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {filteredTables.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Tidak ada tabel yang cocok dengan "{tableSearch}"
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTables.map((table) => (
              <Link
                key={table.key}
                to={`/data/${table.key}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Database className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{table.title}</h3>
                    <p className="text-sm text-gray-500">{table.table}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (loading && !config) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link to="/data" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{config?.title}</h1>
            <p className="text-gray-600">Total: {total} data</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Tambah</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-light" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Tidak ada data</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {config?.columns.map((col) => (
                    <th key={col} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {config.fields[col]?.label || col.replace(/_/g, ' ')}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {config?.columns.map((col) => (
                      <td key={col} className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                        {getDisplayValue(item, col, true)}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleView(item)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded" title="Lihat">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEdit(item)} className="p-1.5 text-primary hover:bg-primary/5 rounded" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(item[config!.primary_key])} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Halaman {currentPage} dari {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showModal && config && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {modalMode === 'create' ? 'Tambah' : modalMode === 'edit' ? 'Edit' : 'Detail'} {config.title}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {Object.entries(config.fields).map(([field, fieldConfig]) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {fieldConfig.label}
                      {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderField(field, fieldConfig)}
                  </div>
                ))}
              </div>
              {modalMode !== 'view' && (
                <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    <Save className="w-4 h-4" />
                    Simpan
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={() => setDeleteId(null)} />
            <div className="relative bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Konfirmasi Hapus</h3>
              <p className="text-gray-600 mb-6">Apakah Anda yakin ingin menghapus data ini?</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
