import { useState, useEffect, useCallback } from 'react';
import { Video, Plus, Calendar, Clock, ExternalLink, Edit, Trash2, Loader2, X } from 'lucide-react';
import { API_URL, getHeaders } from '../../services/api';

interface LiveClass {
  id_live: number;
  judul: string;
  deskripsi: string;
  platform: 'zoom' | 'gmeet';
  meeting_link: string;
  meeting_id: string;
  jadwal_mulai: string;
  durasi_menit: number;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  course_id: number | null;
  course_judul?: string;
}

interface Course {
  id_course: number;
  judul: string;
}

export default function LiveClassPage() {
  const [loading, setLoading] = useState(true);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    judul: '',
    deskripsi: '',
    platform: 'zoom' as 'zoom' | 'gmeet',
    meeting_link: '',
    meeting_id: '',
    jadwal_mulai: '',
    durasi_menit: 60,
    course_id: '' as string,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const res = await fetch(`${API_URL}/mentor/live-class`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setLiveClasses(data.data || []);
      }

      const coursesRes = await fetch(`${API_URL}/mentor/my-courses`, {
        headers: getHeaders()
      });
      const coursesData = await coursesRes.json();
      if (coursesData.success) {
        setCourses(coursesData.data || []);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setForm({
      judul: '', deskripsi: '', platform: 'zoom', meeting_link: '',
      meeting_id: '', jadwal_mulai: '', durasi_menit: 60, course_id: ''
    });
    setEditingId(null);
  };

  const openNewModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (live: LiveClass) => {
    setForm({
      judul: live.judul,
      deskripsi: live.deskripsi || '',
      platform: live.platform,
      meeting_link: live.meeting_link || '',
      meeting_id: live.meeting_id || '',
      jadwal_mulai: live.jadwal_mulai.slice(0, 16), // format for datetime-local
      durasi_menit: live.durasi_menit,
      course_id: live.course_id?.toString() || '',
    });
    setEditingId(live.id_live);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingId 
        ? `${API_URL}/mentor/live-class/${editingId}`
        : `${API_URL}/mentor/live-class`;
      
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { ...getHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          course_id: form.course_id ? parseInt(form.course_id) : null,
        })
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        resetForm();
        fetchData();
      } else {
        alert(data.message || 'Gagal menyimpan');
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Gagal menyimpan live class');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus live class ini?')) return;

    try {
      const res = await fetch(`${API_URL}/mentor/live-class/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      scheduled: 'bg-yellow-100 text-yellow-700',
      live: 'bg-red-100 text-red-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-gray-100 text-gray-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Class</h1>
          <p className="text-gray-600">Jadwalkan meeting Zoom atau Google Meet</p>
        </div>
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" /> Jadwalkan
        </button>
      </div>

      {liveClasses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Live Class</h3>
          <p className="text-gray-500 mb-4">Jadwalkan sesi live pertama Anda</p>
          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" /> Jadwalkan Live Class
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {liveClasses.map((live) => (
            <div key={live.id_live} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{live.judul}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(live.status)}`}>
                      {live.status}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      live.platform === 'zoom' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {live.platform === 'zoom' ? 'Zoom' : 'Google Meet'}
                    </span>
                  </div>
                  {live.deskripsi && (
                    <p className="text-gray-600 text-sm mb-2">{live.deskripsi}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(live.jadwal_mulai)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {live.durasi_menit} menit
                    </span>
                    {live.course_judul && (
                      <span className="text-primary">📚 {live.course_judul}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {live.meeting_link && (
                    <a
                      href={live.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-primary hover:bg-blue-50 rounded-lg"
                      title="Buka Link"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                  <button
                    onClick={() => openEditModal(live)}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(live.id_live)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    title="Hapus"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">
                {editingId ? 'Edit Live Class' : 'Jadwalkan Live Class'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul *</label>
                <input
                  type="text"
                  value={form.judul}
                  onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform *</label>
                  <select
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value as 'zoom' | 'gmeet' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="zoom">Zoom</option>
                    <option value="gmeet">Google Meet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durasi (menit)</label>
                  <input
                    type="number"
                    value={form.durasi_menit}
                    onChange={(e) => setForm({ ...form, durasi_menit: parseInt(e.target.value) || 60 })}
                    min={15}
                    max={480}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jadwal Mulai *</label>
                <input
                  type="datetime-local"
                  value={form.jadwal_mulai}
                  onChange={(e) => setForm({ ...form, jadwal_mulai: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                <input
                  type="url"
                  value={form.meeting_link}
                  onChange={(e) => setForm({ ...form, meeting_link: e.target.value })}
                  placeholder="https://zoom.us/j/... atau https://meet.google.com/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting ID (opsional)</label>
                <input
                  type="text"
                  value={form.meeting_id}
                  onChange={(e) => setForm({ ...form, meeting_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link ke Course (opsional)</label>
                <select
                  value={form.course_id}
                  onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">-- Tidak dikaitkan --</option>
                  {courses.map((c) => (
                    <option key={c.id_course} value={c.id_course}>{c.judul}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
