import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, X, Loader2, GraduationCap, Mail, Sparkles } from 'lucide-react';
import { API_URL, getHeaders } from '../services/api';

interface Mentor {
  id: number;
  email: string;
  name: string;
  santri: number | null;
  konsentrasi: { id_konsentrasi: number; nama_konsentrasi: string }[];
}

interface Konsentrasi {
  id_konsentrasi: number;
  nama_konsentrasi: string;
}

export default function MentorManagementPage() {
  const [loading, setLoading] = useState(true);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [konsentrasiList, setKonsentrasiList] = useState<Konsentrasi[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedKonsentrasi, setSelectedKonsentrasi] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch mentors
      const mentorsRes = await fetch(`${API_URL}/mentor-admin`, {
        headers: getHeaders()
      });
      const mentorsData = await mentorsRes.json();
      if (mentorsData.success) {
        setMentors(mentorsData.data || []);
      }

      // Fetch konsentrasi list
      const konsRes = await fetch(`${API_URL}/master/konsentrasi`, {
        headers: getHeaders()
      });
      const konsData = await konsRes.json();
      // API returns array directly, not {success, data}
      if (Array.isArray(konsData)) {
        setKonsentrasiList(konsData);
      } else if (konsData.success) {
        setKonsentrasiList(konsData.data || []);
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

  const openAssignModal = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setSelectedKonsentrasi('');
    setShowModal(true);
  };

  const handleAssign = async () => {
    if (!selectedMentor || !selectedKonsentrasi) return;
    
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/mentor-admin/assign-konsentrasi`, {
        method: 'POST',
        headers: { ...getHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedMentor.id,
          konsentrasi_id: parseInt(selectedKonsentrasi)
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchData();
      } else {
        alert(data.message || 'Gagal assign konsentrasi');
      }
    } catch (err) {
      console.error('Assign error:', err);
      alert('Gagal assign konsentrasi');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (mentorId: number, konsentrasiId: number) => {
    if (!confirm('Hapus konsentrasi ini dari mentor?')) return;

    try {
      const res = await fetch(`${API_URL}/mentor-admin/remove-konsentrasi`, {
        method: 'POST',
        headers: { ...getHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: mentorId,
          konsentrasi_id: konsentrasiId
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error('Remove error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Get available konsentrasi (not yet assigned to selected mentor)
  const availableKonsentrasi = selectedMentor 
    ? konsentrasiList.filter(k => 
        !selectedMentor.konsentrasi.some(mk => mk.id_konsentrasi === k.id_konsentrasi)
      )
    : konsentrasiList;

  // Color palette for konsentrasi badges
  const colors = [
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-purple-100 text-purple-700 border-purple-200',
    'bg-emerald-100 text-emerald-700 border-emerald-200',
    'bg-orange-100 text-orange-700 border-orange-200',
    'bg-pink-100 text-pink-700 border-pink-200',
    'bg-cyan-100 text-cyan-700 border-cyan-200',
  ];
  const getColor = (index: number) => colors[index % colors.length];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-6 text-white">
        <div className="absolute top-0 right-0 opacity-10">
          <GraduationCap className="w-48 h-48 -mt-8 -mr-8" />
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            Manajemen Mentor
          </h1>
          <p className="text-white/80 mt-1">Kelola mentor dan assign konsentrasi bidang keahlian</p>
          <div className="flex gap-4 mt-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="text-2xl font-bold">{mentors.length}</div>
              <div className="text-sm text-white/80">Total Mentor</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="text-2xl font-bold">{konsentrasiList.length}</div>
              <div className="text-sm text-white/80">Konsentrasi</div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
        <div className="flex gap-3">
          <div className="bg-blue-100 rounded-full p-2 h-fit">
            <GraduationCap className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900">Tentang Assign Konsentrasi</h3>
            <p className="text-sm text-blue-700 mt-1">
              Mentor yang di-assign ke konsentrasi tertentu akan bisa melihat daftar santri, 
              review video, dan portofolio dari santri yang mengambil konsentrasi tersebut 
              melalui menu <strong>"Santri Saya"</strong> di dashboard mentor.
            </p>
          </div>
        </div>
      </div>

      {/* Mentor Cards */}
      {mentors.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Mentor</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Buat user dengan role "mentor" terlebih dahulu di menu <strong>Users</strong>, 
            kemudian kembali ke halaman ini untuk assign konsentrasi.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mentors.map((mentor, idx) => (
            <div 
              key={mentor.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
            >
              {/* Card Header with gradient */}
              <div className="bg-gradient-to-r from-slate-700 to-slate-900 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-full p-3">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{mentor.name || 'Mentor'}</h3>
                    <p className="text-sm text-white/70 flex items-center gap-1 truncate">
                      <Mail className="w-3 h-3" /> {mentor.email}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Card Body */}
              <div className="p-4">
                <div className="mb-3">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Konsentrasi ({mentor.konsentrasi.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mentor.konsentrasi.length === 0 ? (
                      <span className="text-gray-400 text-sm italic">Belum ada konsentrasi</span>
                    ) : (
                      mentor.konsentrasi.map((k, i) => (
                        <span 
                          key={k.id_konsentrasi} 
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getColor(i)}`}
                        >
                          {k.nama_konsentrasi}
                          <button 
                            onClick={() => handleRemove(mentor.id, k.id_konsentrasi)}
                            className="ml-1 bg-gray-200 hover:bg-red-200 text-gray-600 hover:text-red-600 rounded-full p-0.5 transition-colors"
                            title="Hapus konsentrasi"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => openAssignModal(mentor)}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-600/90 hover:to-indigo-600/90 transition-all shadow-sm hover:shadow"
                >
                  <Plus className="w-4 h-4" /> Tambah Konsentrasi
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Modal */}
      {showModal && selectedMentor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Plus className="w-5 h-5" /> Assign Konsentrasi
                </h2>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Mentor Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-full p-3">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedMentor.name}</p>
                  <p className="text-sm text-gray-500">{selectedMentor.email}</p>
                </div>
              </div>

              {/* Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Konsentrasi
                </label>
                {konsentrasiList.length === 0 ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
                    ⚠️ Tidak ada data konsentrasi. Pastikan data master konsentrasi sudah diisi di menu <strong>Master Data</strong>.
                  </div>
                ) : availableKonsentrasi.length === 0 ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                    ✅ Semua konsentrasi sudah di-assign ke mentor ini.
                  </div>
                ) : (
                  <select
                    value={selectedKonsentrasi}
                    onChange={(e) => setSelectedKonsentrasi(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors bg-white"
                  >
                    <option value="">-- Pilih Konsentrasi --</option>
                    {availableKonsentrasi.map((k) => (
                      <option key={k.id_konsentrasi} value={k.id_konsentrasi}>
                        {k.nama_konsentrasi}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Info */}
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
                <strong>💡 Tip:</strong> Mentor bisa di-assign ke lebih dari satu konsentrasi sesuai kebutuhan.
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleAssign}
                  disabled={saving || !selectedKonsentrasi}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-600/90 hover:to-indigo-600/90 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
