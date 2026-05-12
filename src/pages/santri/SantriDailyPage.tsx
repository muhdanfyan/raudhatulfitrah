import { useState, useEffect, useRef } from 'react';
import { 
  Target, Plus, Edit2, Loader2, CheckCircle, XCircle, Clock, 
  ChevronLeft, Upload, Image, Link as LinkIcon, AlertCircle, X,
  Calendar, FileText, Play, Pause, Square
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTimeTracking, formatElapsedTime } from '../../contexts/TimeTrackingContext';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getLocalDateString } from '../../utils/date';
import { API_URL, TENANT_ID, getHeaders } from '../../services/api';


const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['link'],
    ['clean']
  ],
};

const quillFormats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'color', 'background', 'list', 'bullet', 'align', 'link'
];

export default function SantriDailyPage() {
  const { user } = useAuth();
  const { isRunning, elapsedSeconds, start, stop } = useTimeTracking();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    target_daily: '',
    link_belajar: '',
    status: 'Belum Selesai',
    kendala: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lastSession, setLastSession] = useState<{ duration: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStopTimer = () => {
    const session = stop();
    if (session) {
      setLastSession({ duration: session.duration });
    }
  };

  useEffect(() => {
    if (user?.santri_id) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/santri-feature/daily/${user?.santri_id}`, {
        headers: getHeaders()
      });
      const json = await res.json();
      setData(json.data);
      if (json.data?.today) {
        setFormData({
          target_daily: json.data.today.target_daily || '',
          link_belajar: json.data.today.link_belajar || '',
          status: json.data.today.status || 'Belum Selesai',
          kendala: json.data.today.kendala || ''
        });
        if (json.data.today.file_daily) {
          // Check if it's already a full URL (Cloudinary)
          const fileUrl = json.data.today.file_daily.startsWith('http') 
            ? json.data.today.file_daily 
            : `${API_URL}/storage/daily/${json.data.today.file_daily}`;
          setPreviewUrl(fileUrl);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const isUpdate = !!data?.today;
      const url = isUpdate 
        ? `${API_URL}/santri-feature/daily/${data.today.id_daily}`
        : `${API_URL}/santri-feature/daily`;

      const formDataObj = new FormData();
      formDataObj.append('santri', String(user?.santri_id));
      formDataObj.append('target_daily', formData.target_daily);
      formDataObj.append('link_belajar', formData.link_belajar);
      formDataObj.append('status', formData.status);
      formDataObj.append('kendala', formData.kendala);
      if (selectedFile) {
        formDataObj.append('file_daily', selectedFile);
      }
      if (isUpdate) {
        formDataObj.append('_method', 'PUT');
      }

      await fetch(url, {
        method: 'POST',
        headers: getHeaders(), // Note: for FormData, getHeaders() usually shouldn't set Content-Type
        body: formDataObj
      });
      
      setSelectedFile(null);
      fetchData();
      setShowForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; icon: any; label: string }> = {
      'Selesai': { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle, label: 'Selesai' },
      'Belum Selesai': { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock, label: 'Belum Selesai' },
      'Tidak selesai': { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Tidak Selesai' },
      'Pending Besok': { bg: 'bg-primary/10', text: 'text-primary-dark', icon: AlertCircle, label: 'Pending' }
    };
    return configs[status] || configs['Belum Selesai'];
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Hari Ini';
    if (date.toDateString() === yesterday.toDateString()) return 'Kemarin';
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="mt-3 text-gray-500">Memuat data target...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Daily Tracking</h1>
              <p className="text-purple-100 text-sm">Catat target dan tracking waktu belajar</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl transition-colors"
          >
            {data?.today ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span className="hidden sm:inline">{data?.today ? 'Update' : 'Tambah'}</span>
          </button>
        </div>

        {/* Timer Controls */}
        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4">
          {!data?.today ? (
            <div className="text-center py-2">
              <div className="flex items-center justify-center gap-2 text-purple-200 mb-2">
                <AlertCircle className="w-5 h-5" />
                <span>Belum ada target hari ini</span>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 mx-auto bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Input Target Dulu
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Time Tracking</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-2xl font-bold">
                    {formatElapsedTime(elapsedSeconds)}
                  </span>
                  {!isRunning ? (
                    <button
                      onClick={start}
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Mulai
                    </button>
                  ) : (
                    <button
                      onClick={handleStopTimer}
                      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      <Square className="w-4 h-4" />
                      Stop
                    </button>
                  )}
                </div>
              </div>
              {isRunning && (
                <div className="mt-3 p-2 bg-emerald-500/30 rounded-lg text-sm">
                  <span className="font-medium">Target:</span>{' '}
                  <span dangerouslySetInnerHTML={{ __html: data.today.target_daily.substring(0, 100) + '...' }} />
                </div>
              )}
              {lastSession && !isRunning && (
                <div className="mt-2 text-sm text-purple-200">
                  Sesi terakhir: {formatElapsedTime(lastSession.duration)}
                </div>
              )}
            </>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{data?.list?.length || 0}</div>
            <div className="text-xs text-purple-100">Total Target</div>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">
              {data?.list?.filter((d: any) => d.status === 'Selesai').length || 0}
            </div>
            <div className="text-xs text-purple-100">Selesai</div>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">
              {data?.list?.length > 0 
                ? Math.round((data?.list?.filter((d: any) => d.status === 'Selesai').length / data.list.length) * 100)
                : 0}%
            </div>
            <div className="text-xs text-purple-100">Tingkat Selesai</div>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
            <h2 className="text-lg font-bold text-white">
              {data?.today ? 'Update Target Hari Ini' : 'Masukkan Target Baru'}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Target with WYSIWYG */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Target Hari Ini <span className="text-red-500">*</span>
              </label>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <ReactQuill
                  theme="snow"
                  value={formData.target_daily}
                  onChange={(value) => setFormData({...formData, target_daily: value})}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Tuliskan target belajar hari ini..."
                  className="bg-white"
                  style={{ minHeight: '150px' }}
                />
              </div>
            </div>

            {/* Link & Status */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <LinkIcon className="w-4 h-4 inline mr-1" />
                  Link Belajar
                </label>
                <input
                  type="text"
                  value={formData.link_belajar}
                  onChange={(e) => setFormData({...formData, link_belajar: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Belum Selesai', 'Selesai', 'Tidak selesai', 'Pending Besok'].map((status) => {
                    const config = getStatusConfig(status);
                    const isSelected = formData.status === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setFormData({...formData, status})}
                        className={`p-2 rounded-lg text-xs font-medium transition-all border-2 ${
                          isSelected 
                            ? `${config.bg} ${config.text} border-current` 
                            : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'
                        }`}
                      >
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Upload Gambar */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Image className="w-4 h-4 inline mr-1" />
                Bukti Screenshot / Foto
              </label>
              <div className="relative">
                {previewUrl ? (
                  <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-purple-300 bg-purple-50">
                    <img src={previewUrl} alt="Preview" className="w-full max-h-64 object-contain" />
                    <button
                      type="button"
                      onClick={removeFile}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all"
                  >
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600">Klik untuk upload gambar</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF (Maks. 5MB)</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Kendala with WYSIWYG */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Kendala (Opsional)
              </label>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <ReactQuill
                  theme="snow"
                  value={formData.kendala}
                  onChange={(value) => setFormData({...formData, kendala: value})}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Ceritakan kendala yang dihadapi..."
                  className="bg-white"
                  style={{ minHeight: '100px' }}
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Simpan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Today's Target - render HTML */}
      {data?.today && !showForm && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Target className="w-5 h-5" />
              <span className="font-semibold">Target Hari Ini</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusConfig(data.today.status).bg} ${getStatusConfig(data.today.status).text}`}>
              {data.today.status}
            </span>
          </div>
          <div className="p-5">
            <div 
              className="prose prose-sm max-w-none text-gray-800"
              dangerouslySetInnerHTML={{ __html: data.today.target_daily }}
            />
            {data.today.file_daily && (
              <div className="mt-4">
                <img 
                  src={data.today.file_daily.startsWith('http') ? data.today.file_daily : `${API_URL}/storage/daily/${data.today.file_daily}`} 
                  alt="Bukti" 
                  className="rounded-xl max-h-48 object-contain border"
                />
              </div>
            )}
            {data.today.link_belajar && (
              <a 
                href={data.today.link_belajar.startsWith('http') ? data.today.link_belajar : `https://${data.today.link_belajar}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-3 text-sm text-emerald-600 hover:underline"
              >
                <LinkIcon className="w-4 h-4" /> Link Belajar
              </a>
            )}
            {data.today.kendala && stripHtml(data.today.kendala).trim() && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="text-sm text-amber-800">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  <strong>Kendala:</strong>
                  <div 
                    className="prose prose-sm max-w-none mt-1"
                    dangerouslySetInnerHTML={{ __html: data.today.kendala }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History - render HTML */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="px-5 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Riwayat Target</h2>
        </div>
        <div className="divide-y max-h-[500px] overflow-y-auto">
          {data?.list?.filter((item: any) => item.tgl_daily !== getLocalDateString()).map((item: any, i: number) => {
            const statusConfig = getStatusConfig(item.status);
            const StatusIcon = statusConfig.icon;
            return (
              <div key={i} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-xl ${statusConfig.bg} flex-shrink-0`}>
                    <StatusIcon className={`w-5 h-5 ${statusConfig.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(item.tgl_daily)}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                        {item.status}
                      </span>
                    </div>
                    <div 
                      className="prose prose-sm max-w-none text-gray-800 line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: item.target_daily }}
                    />
                    {item.file_daily && (
                      <img 
                        src={item.file_daily.startsWith('http') ? item.file_daily : `${API_URL}/storage/daily/${item.file_daily}`} 
                        alt="Bukti"
                        className="mt-2 rounded-lg max-h-32 object-contain border"
                      />
                    )}
                    {item.kendala && stripHtml(item.kendala).trim() && (
                      <div className="text-xs text-gray-500 mt-2">
                        <strong>Kendala:</strong>
                        <div 
                          className="prose prose-xs max-w-none inline"
                          dangerouslySetInnerHTML={{ __html: item.kendala }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {(!data?.list || data.list.length === 0) && (
            <div className="p-8 text-center text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Belum ada riwayat target</p>
            </div>
          )}
        </div>
      </div>

      {/* Custom Quill Styles */}
      <style>{`
        .ql-container {
          font-family: inherit;
          font-size: 14px;
          min-height: 120px;
        }
        .ql-editor {
          min-height: 120px;
        }
        .ql-toolbar {
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
          background: #f9fafb;
          border-color: #e5e7eb;
        }
        .ql-container {
          border-bottom-left-radius: 0.75rem;
          border-bottom-right-radius: 0.75rem;
          border-color: #e5e7eb;
        }
        .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
        .prose h1 { font-size: 1.5em; font-weight: bold; margin: 0.5em 0; }
        .prose h2 { font-size: 1.25em; font-weight: bold; margin: 0.5em 0; }
        .prose h3 { font-size: 1.1em; font-weight: bold; margin: 0.5em 0; }
        .prose ul { list-style-type: disc; padding-left: 1.5em; margin: 0.5em 0; }
        .prose ol { list-style-type: decimal; padding-left: 1.5em; margin: 0.5em 0; }
        .prose p { margin: 0.5em 0; }
        .prose a { color: #6366f1; text-decoration: underline; }
      `}</style>
    </div>
  );
}
