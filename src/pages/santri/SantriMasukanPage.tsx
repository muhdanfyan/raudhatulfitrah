import { useState, useEffect } from 'react';
import { MessageSquare, Plus, Loader2, CheckCircle, Clock, ChevronLeft, Send, Users, Reply, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { API_URL, getHeaders } from '../../services/api';


const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['clean']
  ],
};

const quillFormats = ['bold', 'italic', 'underline', 'list', 'bullet'];

export default function SantriMasukanPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [jabatan, setJabatan] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    masukan: '',
    bidang: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.santri_id) {
      fetchData();
      fetchJabatan();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/santri-feature/masukan/${user?.santri_id}`, {
        headers: getHeaders()
      });
      const json = await res.json();
      setData(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJabatan = async () => {
    try {
      const res = await fetch(`${API_URL}/master/jabatan`, {
        headers: getHeaders()
      });
      const json = await res.json();
      setJabatan(json.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(`${API_URL}/santri-feature/masukan`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({
          ...formData,
          santri: user?.santri_id
        })
      });
      fetchData();
      setShowForm(false);
      setFormData({ masukan: '', bidang: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const stripHtml = (html: string) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; icon: any; label: string; border: string }> = {
      'diterima': { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle, label: 'Diterima', border: 'border-emerald-200' },
      'ditolak': { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Ditolak', border: 'border-red-200' },
      'dipending': { bg: 'bg-amber-100', text: 'text-amber-700', icon: AlertCircle, label: 'Dipending', border: 'border-amber-200' },
      'belum diterima': { bg: 'bg-gray-100', text: 'text-gray-600', icon: Clock, label: 'Menunggu', border: 'border-gray-200' }
    };
    return configs[status] || configs['belum diterima'];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto" />
          <p className="mt-3 text-gray-500">Memuat masukan...</p>
        </div>
      </div>
    );
  }

  const stats = {
    total: data.length,
    diterima: data.filter(d => d.status === 'diterima').length,
    ditolak: data.filter(d => d.status === 'ditolak').length,
    menunggu: data.filter(d => d.status === 'belum diterima' || d.status === 'dipending').length,
    dengan_tanggapan: data.filter(d => d.tanggapan && stripHtml(d.tanggapan).trim()).length
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Masukan & Saran</h1>
              <p className="text-orange-100 text-sm">Sampaikan kritik dan saran untuk pondok</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Kirim</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mt-6">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-orange-100">Total</div>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{stats.diterima}</div>
            <div className="text-xs text-orange-100">Diterima</div>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{stats.menunggu}</div>
            <div className="text-xs text-orange-100">Menunggu</div>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{stats.dengan_tanggapan}</div>
            <div className="text-xs text-orange-100">Ditanggapi</div>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4">
            <h2 className="text-lg font-bold text-white">Kirim Masukan Baru</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Bidang Tujuan */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Bidang Tujuan <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {jabatan.map((j: any) => (
                  <button
                    key={j.id_jabatan}
                    type="button"
                    onClick={() => setFormData({...formData, bidang: String(j.id_jabatan)})}
                    className={`p-3 rounded-xl text-sm font-medium transition-all border-2 ${
                      formData.bidang === String(j.id_jabatan)
                        ? 'bg-orange-100 text-orange-700 border-orange-300'
                        : 'bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    {j.nama_jabatan}
                  </button>
                ))}
              </div>
            </div>

            {/* Masukan with WYSIWYG */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Isi Masukan <span className="text-red-500">*</span>
              </label>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <ReactQuill
                  theme="snow"
                  value={formData.masukan}
                  onChange={(value) => setFormData({...formData, masukan: value})}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Tulis masukan, saran, atau kritik Anda secara jelas dan konstruktif..."
                  className="bg-white"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting || !formData.bidang}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? 'Mengirim...' : 'Kirim Masukan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Riwayat */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 px-1">Riwayat Masukan</h2>
        
        {data.map((item: any, i: number) => {
          const statusConfig = getStatusConfig(item.status);
          const StatusIcon = statusConfig.icon;
          const hasTanggapan = item.tanggapan && stripHtml(item.tanggapan).trim();
          
          return (
            <div key={i} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              {/* Header */}
              <div className={`px-5 py-3 flex items-center justify-between ${statusConfig.bg} border-b ${statusConfig.border}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg bg-white/60`}>
                    <StatusIcon className={`w-4 h-4 ${statusConfig.text}`} />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">{item.nama_bidang}</span>
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{formatDate(item.created_at)}</span>
              </div>

              {/* Masukan Content */}
              <div className="p-5">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">Masukan Anda:</div>
                    <div 
                      className="prose prose-sm max-w-none text-gray-800 bg-gray-50 rounded-xl p-4"
                      dangerouslySetInnerHTML={{ __html: item.masukan }}
                    />
                  </div>
                </div>

                {/* Tanggapan */}
                {hasTanggapan && (
                  <div className="mt-4 ml-11">
                    <div className="relative">
                      {/* Connection line */}
                      <div className="absolute -left-7 top-0 bottom-0 w-px bg-gradient-to-b from-blue-300 to-transparent"></div>
                      
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md">
                          <Reply className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-semibold text-primary-dark">Tanggapan dari {item.nama_bidang}</span>
                            {item.updated_at && item.updated_at !== item.created_at && (
                              <span className="text-xs text-gray-400">{formatDate(item.updated_at)}</span>
                            )}
                          </div>
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm">
                            <div 
                              className="prose prose-sm max-w-none text-gray-800"
                              dangerouslySetInnerHTML={{ __html: item.tanggapan }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* No Response Yet */}
                {!hasTanggapan && item.status !== 'belum diterima' && (
                  <div className="mt-4 ml-11">
                    <div className="flex items-center gap-2 text-gray-400 text-sm italic">
                      <Clock className="w-4 h-4" />
                      <span>Belum ada tanggapan</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {data.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600">Belum ada masukan</h3>
            <p className="text-gray-400 mt-1">Klik "Kirim" untuk menyampaikan masukan pertama Anda</p>
          </div>
        )}
      </div>

      {/* Custom Quill Styles */}
      <style>{`
        .ql-container { font-family: inherit; font-size: 14px; min-height: 150px; }
        .ql-editor { min-height: 150px; }
        .ql-toolbar { border-top-left-radius: 0.75rem; border-top-right-radius: 0.75rem; background: #f9fafb; border-color: #e5e7eb; }
        .ql-container { border-bottom-left-radius: 0.75rem; border-bottom-right-radius: 0.75rem; border-color: #e5e7eb; }
        .ql-editor.ql-blank::before { color: #9ca3af; font-style: normal; }
        .prose p { margin: 0.25em 0; }
        .prose ul, .prose ol { margin: 0.5em 0; padding-left: 1.5em; }
      `}</style>
    </div>
  );
}
