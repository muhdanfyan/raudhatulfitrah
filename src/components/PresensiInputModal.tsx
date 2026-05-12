import { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, Clock, Calendar } from 'lucide-react';
import { api } from '../services/api';
import { getStudentPhotoUrl } from '../utils/imageUtils';
import { getLocalDateString } from '../utils/date';

interface Santri {
  id_santri: number;
  nama_santri: string;
  foto_santri: string | null;
}

interface Agenda {
  id_agenda: number;
  nama_agenda: string;
  jam_mulai: string;
  jam_selesai: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tanggal: string;
}



export default function PresensiInputModal({ isOpen, onClose, onSuccess, tanggal: initialTanggal }: Props) {
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [agendaList, setAgendaList] = useState<Agenda[]>([]);
  const [selectedAgenda, setSelectedAgenda] = useState<number>(0);
  const [selectedSantri, setSelectedSantri] = useState<number[]>([]);
  const [selectedTanggal, setSelectedTanggal] = useState(initialTanggal);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setSelectedTanggal(initialTanggal);
      fetchData();
    }
  }, [isOpen, initialTanggal]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [santriRes, agendaRes] = await Promise.all([
        api.getSantriList({ status: 'Mondok', per_page: 100 }),
        api.getMasterAgenda(),
      ]);
      
      const mappedSantri = (santriRes || []).map((s: any) => ({
        id_santri: s.id,
        nama_santri: s.name,
        foto_santri: s.photo || null,
      }));
      
      setSantriList(mappedSantri);
      setAgendaList(agendaRes || []);
      
      if (agendaRes && agendaRes.length > 0) {
        setSelectedAgenda(agendaRes[0].id_agenda);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data');
    } finally {
      setLoading(false);
    }
  };

  const toggleSantri = (id: number) => {
    setSelectedSantri(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedSantri.length === santriList.length) {
      setSelectedSantri([]);
    } else {
      setSelectedSantri(santriList.map(s => s.id_santri));
    }
  };

  const handleSubmit = async () => {
    if (!selectedAgenda || selectedSantri.length === 0) {
      setError('Pilih agenda dan minimal 1 santri');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessCount(0);

    let success = 0;
    let skipped = 0;
    let failed = 0;
    const errorDetails: string[] = [];

    for (const santriId of selectedSantri) {
      try {
        await api.createPresensi(santriId, selectedAgenda, selectedTanggal);
        success++;
        setSuccessCount(success);
      } catch (err: any) {
        // Detect "Already present" error (422)
        if (err.message && (err.message.includes('sudah presensi') || err.message.includes('Already present'))) {
          skipped++;
        } else {
          failed++;
          const santri = santriList.find(s => s.id_santri === santriId);
          errorDetails.push(`${santri?.nama_santri}: ${err.message || 'Gagal'}`);
        }
      }
    }

    setSubmitting(false);

    if (failed === 0 && skipped === 0 && success > 0) {
      // 100% success
      onSuccess();
      onClose();
      setSelectedSantri([]);
    } else {
      // Show summary if there were any issues or mixed results
      let summary = '';
      if (success > 0) summary += `${success} berhasil dicatat. `;
      if (skipped > 0) summary += `${skipped} santri sudah presensi (lewati). `;
      if (failed > 0) summary += `${failed} gagal: ${errorDetails.slice(0, 2).join(', ')}`;
      
      setError(summary || 'Proses selesai dengan catatan.');
      
      // If some succeeded, refresh the background list
      if (success > 0) onSuccess();
      
      // Clear selection only for successful ones if we wanted to be fancy, 
      // but for now let user decide to close or retry failed ones.
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Input Presensi Manual</h2>
              <p className="text-sm text-gray-500">Masukkan presensi untuk tanggal tertentu</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-light" />
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Tanggal Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Tanggal Presensi
                  </label>
                  <input
                    type="date"
                    value={selectedTanggal}
                    onChange={(e) => setSelectedTanggal(e.target.value)}
                    max={getLocalDateString()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(selectedTanggal + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>

                {/* Agenda Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Pilih Agenda
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {agendaList.map(agenda => (
                      <button
                        key={agenda.id_agenda}
                        onClick={() => setSelectedAgenda(agenda.id_agenda)}
                        className={`px-3 py-3 rounded-lg text-sm font-medium transition-colors flex flex-col items-center ${
                          selectedAgenda === agenda.id_agenda
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <span>{agenda.nama_agenda}</span>
                        <span className={`text-xs mt-1 ${selectedAgenda === agenda.id_agenda ? 'text-blue-100' : 'text-gray-500'}`}>
                          {agenda.jam_mulai || '--:--'} - {agenda.jam_selesai || '--:--'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Santri Selection */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">
                      Pilih Santri ({selectedSantri.length}/{santriList.length})
                    </label>
                    <button
                      onClick={selectAll}
                      className="text-sm text-primary hover:text-primary-dark"
                    >
                      {selectedSantri.length === santriList.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {santriList.map(santri => (
                      <label
                        key={santri.id_santri}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          selectedSantri.includes(santri.id_santri)
                            ? 'bg-primary/5 border border-blue-200'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSantri.includes(santri.id_santri)}
                          onChange={() => toggleSantri(santri.id_santri)}
                          className="w-4 h-4 text-primary rounded focus:ring-blue-500"
                        />
                        <img
                          src={getStudentPhotoUrl(santri.foto_santri)}
                          alt={santri.nama_santri}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-100"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(santri.nama_santri)}&background=random&size=40`;
                          }}
                        />
                        <span className="text-sm text-gray-900 truncate">{santri.nama_santri}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              {submitting && (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan {successCount}/{selectedSantri.length}...</span>
                </div>
              )}
              {!submitting && successCount > 0 && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>{successCount} presensi tersimpan</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                disabled={submitting}
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || selectedSantri.length === 0 || !selectedAgenda}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    Simpan Presensi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
