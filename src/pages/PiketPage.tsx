import { useState, useEffect } from 'react';
import { API_URL, getHeaders } from '../services/api';
import { Plus, Trash2, GripVertical, Loader2, X, RefreshCw, Edit2, Calendar, Printer, AlertCircle } from 'lucide-react';
import { getStudentPhotoUrl } from '../utils/imageUtils';



interface Santri {
  id_piketsantri: number;
  id_santri: number;
  nama_lengkap_santri: string;
  nama_panggilan_santri: string;
  foto_santri: string | null;
  priority: number;
}

interface Piket {
  id_piket: number;
  jenis_piket: string;
  hari_piket: string;
  deskripsi: string;
  santri: Santri[];
}

interface AvailableSantri {
  id_santri: number;
  nama_lengkap_santri: string;
  nama_panggilan_santri: string;
  foto_santri: string | null;
}

interface JenisPiket {
  id_jenis_piket: number;
  nama_jenis: string;
  warna: string;
  urutan: number;
}

const HARI_LIST = ['Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu', 'Ahad'];
const WARNA_OPTIONS = [
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'blue', label: 'Biru', class: 'bg-primary-light' },
  { value: 'green', label: 'Hijau', class: 'bg-green-500' },
  { value: 'purple', label: 'Ungu', class: 'bg-purple-500' },
  { value: 'red', label: 'Merah', class: 'bg-red-500' },
  { value: 'yellow', label: 'Kuning', class: 'bg-yellow-500' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
  { value: 'gray', label: 'Abu', class: 'bg-gray-500' },
];

const getColorClass = (warna: string) => {
  return WARNA_OPTIONS.find(w => w.value === warna)?.class || 'bg-gray-500';
};

export default function PiketPage() {
  const [data, setData] = useState<Record<string, Piket[]>>({});
  const [loading, setLoading] = useState(true);
  const [jenisList, setJenisList] = useState<JenisPiket[]>([]);
  const [selectedJenis, setSelectedJenis] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [jenisError, setJenisError] = useState<string | null>(null);
  const [jenisLoading, setJenisLoading] = useState(true); // Loading state specifically for jenis data
  const [initialLoadComplete, setInitialLoadComplete] = useState(false); // Track initial load completion

  const [showAddSantri, setShowAddSantri] = useState<number | null>(null);
  const [availableSantri, setAvailableSantri] = useState<AvailableSantri[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [draggedItem, setDraggedItem] = useState<{ santri: Santri; fromPiketId: number } | null>(null);
  
  // Modal state untuk tambah piket (hari)
  const [showAddPiket, setShowAddPiket] = useState(false);
  const [newPiketHari, setNewPiketHari] = useState('Senin');

  // Modal state untuk kelola jenis piket
  const [showJenisModal, setShowJenisModal] = useState(false);
  const [editingJenis, setEditingJenis] = useState<JenisPiket | null>(null);
  const [jenisForm, setJenisForm] = useState({ nama_jenis: '', warna: 'gray' });

  useEffect(() => {
    fetchJenisPiket();
  }, []); // Only run once on component mount

  useEffect(() => {
    // Mark selectedJenis as complete once jenisList is loaded
    if (jenisList.length > 0 && !selectedJenis) {
      setSelectedJenis(jenisList[0].nama_jenis);
    } else if (jenisList.length === 0 && !jenisError && !jenisLoading) {
      // If no jenisList and no error, try to fetch again or show empty state
      setSelectedJenis('');
    }
  }, [jenisList, jenisError, jenisLoading, selectedJenis]);

  useEffect(() => {
    if (selectedJenis) {
      fetchData();
    }
  }, [selectedJenis]);

  const fetchJenisPiket = async () => {
    setJenisLoading(true); // Set jenis loading to true
    try {
      const res = await fetch(`${API_URL}/piket/jenis`, {
        headers: getHeaders()
      });
      if (!res.ok) {
        if (res.status === 404) {
          setJenisError('Fitur piket belum diaktifkan atau endpoint tidak ditemukan');
        } else {
          const errorResult = await res.json().catch(() => ({}));
          setJenisError(errorResult.message || `Error ${res.status}: Gagal memuat jenis piket`);
        }
        return;
      }
      const result = await res.json();
      if (result.success) {
        setJenisList(result.data || []);
        setJenisError(null); // Clear any previous error
      } else {
        setJenisError(result.message || 'Gagal memuat jenis piket');
      }
    } catch (err) {
      console.error('Error fetching jenis piket:', err);
      setJenisError('Koneksi gagal: Tidak dapat mengakses server');
    } finally {
      setJenisLoading(false); // Make sure to always set loading to false
      setInitialLoadComplete(true); // Mark that initial load is complete
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null); // Clear previous error
    try {
      const res = await fetch(`${API_URL}/piket`, {
        headers: getHeaders()
      });
      if (!res.ok) {
        if (res.status === 404) {
          setError('Fitur piket belum diaktifkan atau endpoint tidak ditemukan');
        } else {
          const errorResult = await res.json().catch(() => ({}));
          setError(errorResult.message || `Error ${res.status}: Gagal memuat data piket`);
        }
        setLoading(false);
        return;
      }
      const result = await res.json();
      if (result.success) {
        setData(result.data || {});
        setError(null); // Clear any previous error
      } else {
        setError(result.message || 'Gagal memuat data piket');
      }
    } catch (err) {
      console.error('Error fetching piket:', err);
      setError('Koneksi gagal: Tidak dapat mengakses server');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSantri = async (piketId: number) => {
    setLoadingAvailable(true);
    try {
      const res = await fetch(`${API_URL}/piket/available-santri?piket_id=${piketId}`, {
        headers: getHeaders()
      });
      const result = await res.json();
      if (result.success) {
        setAvailableSantri(result.data || []);
      }
    } catch (err) {
      console.error('Error fetching available santri:', err);
    } finally {
      setLoadingAvailable(false);
    }
  };

  const handleAddSantri = async (piketId: number, santriId: number) => {
    setActionLoading(`add-${piketId}-${santriId}`);
    try {
      const res = await fetch(`${API_URL}/piket/assign`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ piket_id: piketId, santri_id: santriId })
      });
      const result = await res.json();
      if (result.success) {
        fetchData();
        setShowAddSantri(null);
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error('Error assigning santri:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveSantri = async (piketsantriId: number) => {
    if (!confirm('Hapus santri dari piket ini?')) return;
    setActionLoading(`remove-${piketsantriId}`);
    try {
      const res = await fetch(`${API_URL}/piket/remove/${piketsantriId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const result = await res.json();
      if (result.success) {
        fetchData();
      }
    } catch (err) {
      console.error('Error removing santri:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddPiket = async () => {
    setActionLoading('add-piket');
    try {
      const res = await fetch(`${API_URL}/piket/store`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({
          jenis_piket: selectedJenis,
          hari_piket: newPiketHari,
        })
      });
      const result = await res.json();
      if (result.success) {
        fetchData();
        setShowAddPiket(false);
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error('Error adding piket:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeletePiket = async (piketId: number, hari: string) => {
    if (!confirm(`Hapus jadwal piket ${selectedJenis} hari ${hari}? Semua santri yang ditugaskan akan dihapus.`)) return;
    setActionLoading(`delete-piket-${piketId}`);
    try {
      const res = await fetch(`${API_URL}/piket/delete/${piketId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const result = await res.json();
      if (result.success) {
        fetchData();
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error('Error deleting piket:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // ========== CRUD Jenis Piket ==========
  const openJenisModal = (jenis?: JenisPiket) => {
    if (jenis) {
      setEditingJenis(jenis);
      setJenisForm({ nama_jenis: jenis.nama_jenis, warna: jenis.warna });
    } else {
      setEditingJenis(null);
      setJenisForm({ nama_jenis: '', warna: 'gray' });
    }
    setShowJenisModal(true);
  };

  const handleSaveJenis = async () => {
    if (!jenisForm.nama_jenis.trim()) {
      alert('Nama jenis piket harus diisi');
      return;
    }
    setActionLoading('save-jenis');
    try {
      const url = editingJenis 
        ? `${API_URL}/piket/jenis/${editingJenis.id_jenis_piket}`
        : `${API_URL}/piket/jenis`;
      const method = editingJenis ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: getHeaders(true),
        body: JSON.stringify(jenisForm)
      });
      const result = await res.json();
      if (result.success) {
        fetchJenisPiket();
        setShowJenisModal(false);
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error('Error saving jenis:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteJenis = async (jenis: JenisPiket) => {
    if (!confirm(`Hapus jenis piket "${jenis.nama_jenis}"?`)) return;
    setActionLoading(`delete-jenis-${jenis.id_jenis_piket}`);
    try {
      const res = await fetch(`${API_URL}/piket/jenis/${jenis.id_jenis_piket}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const result = await res.json();
      if (result.success) {
        fetchJenisPiket();
        if (selectedJenis === jenis.nama_jenis && jenisList.length > 1) {
          setSelectedJenis(jenisList.find(j => j.nama_jenis !== jenis.nama_jenis)?.nama_jenis || '');
        }
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error('Error deleting jenis:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Jadwal Piket - Pondok Informatika</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; margin-bottom: 5px; }
          .subtitle { text-align: center; color: #666; margin-bottom: 25px; }
          .section { margin-bottom: 25px; page-break-inside: avoid; }
          .section-title { font-size: 16px; font-weight: bold; margin-bottom: 8px; padding: 8px 12px; border-radius: 4px; color: white; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f5f5f5; font-weight: bold; }
          .hari { font-weight: bold; background: #f9f9f9; width: 15%; }
          .no-data { color: #999; font-style: italic; }
          .bg-orange { background: #f97316; }
          .bg-blue { background: #3b82f6; }
          .bg-green { background: #22c55e; }
          .bg-purple { background: #a855f7; }
          .bg-red { background: #ef4444; }
          .bg-yellow { background: #eab308; color: #333; }
          .bg-pink { background: #ec4899; }
          .bg-gray { background: #6b7280; }
          @media print {
            body { padding: 10px; }
            @page { margin: 1cm; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <h1>Jadwal Piket Santri</h1>
        <p class="subtitle">Pondok Informatika Al-Hikmah</p>
        
        ${jenisList.map(jenis => {
          const pikets = data[jenis.nama_jenis] || [];
          return `
            <div class="section">
              <div class="section-title bg-${jenis.warna}">${jenis.nama_jenis}</div>
              <table>
                <thead>
                  <tr>
                    <th class="hari">Hari</th>
                    <th>Santri Bertugas</th>
                  </tr>
                </thead>
                <tbody>
                  ${HARI_LIST.map(hari => {
                    const piket = pikets.find((p: Piket) => p.hari_piket === hari);
                    const santriNames = piket?.santri.map((s: Santri) => s.nama_panggilan_santri || s.nama_lengkap_santri).join(', ') || '-';
                    return `
                      <tr>
                        <td class="hari">${hari}</td>
                        <td>${piket ? santriNames : '<span class="no-data">-</span>'}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          `;
        }).join('')}
        
        <p style="margin-top: 20px; font-size: 12px; color: #999; text-align: right;">
          Dicetak: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleDragStart = (santri: Santri, fromPiketId: number) => {
    setDraggedItem({ santri, fromPiketId });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (toPiketId: number) => {
    if (!draggedItem || draggedItem.fromPiketId === toPiketId) {
      setDraggedItem(null);
      return;
    }

    setActionLoading(`move-${draggedItem.santri.id_piketsantri}`);
    try {
      const res = await fetch(`${API_URL}/piket/move`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({
          piketsantri_id: draggedItem.santri.id_piketsantri,
          new_piket_id: toPiketId
        })
      });
      const result = await res.json();
      if (result.success) {
        fetchData();
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error('Error moving santri:', err);
    } finally {
      setDraggedItem(null);
      setActionLoading(null);
    }
  };

  const handleAddPiketForDay = async (hari: string) => {
    setActionLoading(`add-piket-${hari}`);
    try {
      const res = await fetch(`${API_URL}/piket/store`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({
          jenis_piket: selectedJenis,
          hari_piket: hari,
        })
      });

      if (!res.ok) {
        if (res.status === 404) {
          setError('Fitur piket belum diaktifkan atau endpoint tidak ditemukan');
        } else {
          const errorResult = await res.json().catch(() => ({}));
          setError(errorResult.message || `Error ${res.status}: Gagal membuat jadwal piket`);
        }
        setActionLoading(null);
        return;
      }

      const result = await res.json();
      if (result.success) {
        fetchData(); // Refresh the data
      } else {
        setError(result.message || 'Gagal membuat jadwal piket');
      }
    } catch (err) {
      console.error('Error adding piket for day:', err);
      setError('Koneksi gagal: Tidak dapat membuat jadwal piket');
    } finally {
      setActionLoading(null);
    }
  };

  const currentPikets = data[selectedJenis] || [];

  // Show loader only during initial load, not when errors occur
  if (loading && !initialLoadComplete) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jadwal Piket</h1>
          <p className="text-gray-600">Kelola jadwal piket santri dengan drag & drop</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-2 bg-primary-light text-white rounded-lg hover:bg-primary"
            title="Cetak jadwal"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Cetak</span>
          </button>
          <button onClick={fetchData} className="p-2 hover:bg-gray-100 rounded-lg" title="Refresh">
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-700 font-medium">Kesalahan</p>
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={fetchData}
                className="mt-2 text-sm text-red-700 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                Coba lagi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Jenis Piket Error */}
      {jenisError && !error && ( // Only show jenisError if there's no main error
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm text-orange-700 font-medium">Info</p>
              <p className="text-sm text-orange-600">{jenisError}</p>
              <button
                onClick={fetchJenisPiket}
                className="mt-2 text-sm text-orange-700 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                Muat ulang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Jenis Tabs */}
      {jenisList.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {jenisList.map((jenis) => (
            <button
              key={jenis.id_jenis_piket}
              onClick={() => setSelectedJenis(jenis.nama_jenis)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                selectedJenis === jenis.nama_jenis
                  ? `${getColorClass(jenis.warna)} text-white`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {jenis.nama_jenis}
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <h3 className="font-medium text-gray-900 mb-2">Belum ada jenis piket</h3>
          <p className="text-gray-600 text-sm mb-4">
            {jenisError
              ? jenisError
              : "Fitur jadwal piket belum diatur atau endpoint API tidak ditemukan."
            }
          </p>
          <button
            onClick={fetchJenisPiket}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light text-white rounded-lg hover:bg-primary text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Muat Ulang
          </button>
        </div>
      )}

      {/* Kanban Board */}
      {jenisList.length > 0 && selectedJenis && !error && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {HARI_LIST.map((hari) => {
          const piket = currentPikets.find(p => p.hari_piket === hari);

          return (
            <div
              key={hari}
              className={`bg-white rounded-xl border-2 transition ${
                draggedItem ? 'border-dashed border-blue-300' : 'border-gray-200'
              }`}
              onDragOver={handleDragOver}
              onDrop={() => piket && handleDrop(piket.id_piket)}
            >
              {/* Column Header */}
              <div className={`p-3 rounded-t-lg ${getColorClass(jenisList.find(j => j.nama_jenis === selectedJenis)?.warna || 'gray')} bg-opacity-10`}>
                <h3 className="font-semibold text-gray-800 text-center">{hari}</h3>
                <p className="text-xs text-gray-500 text-center">
                  {piket ? `${piket.santri.length} santri` : 'Belum ada'}
                </p>
              </div>

              {/* Santri List */}
              <div className="p-2 space-y-2 min-h-[200px]">
                {piket?.santri.map((s) => (
                  <div
                    key={s.id_piketsantri}
                    draggable
                    onDragStart={() => handleDragStart(s, piket.id_piket)}
                    className={`p-2 bg-gray-50 rounded-lg border border-gray-200 cursor-move hover:shadow-md transition group ${
                      actionLoading === `move-${s.id_piketsantri}` ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <img
                        src={getStudentPhotoUrl(s.foto_santri, '/default-avatar.png')}
                        alt={s.nama_panggilan_santri}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {s.nama_panggilan_santri || s.nama_lengkap_santri}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveSantri(s.id_piketsantri)}
                        disabled={actionLoading === `remove-${s.id_piketsantri}`}
                        className="p-1 text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition"
                      >
                        {actionLoading === `remove-${s.id_piketsantri}` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add Santri Button */}
                {piket && (
                  <div className="relative">
                    <button
                      onClick={() => {
                        if (showAddSantri === piket.id_piket) {
                          setShowAddSantri(null);
                        } else {
                          setShowAddSantri(piket.id_piket);
                          fetchAvailableSantri(piket.id_piket);
                        }
                      }}
                      className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-primary-light transition flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-sm">Tambah</span>
                    </button>

                    {/* Dropdown */}
                    {showAddSantri === piket.id_piket && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                        <div className="p-2 border-b flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Pilih Santri</span>
                          <button onClick={() => setShowAddSantri(null)}>
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                        {loadingAvailable ? (
                          <div className="p-4 text-center">
                            <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />
                          </div>
                        ) : availableSantri.length === 0 ? (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            Semua santri sudah ditugaskan
                          </div>
                        ) : (
                          availableSantri.map((s) => (
                            <button
                              key={s.id_santri}
                              onClick={() => handleAddSantri(piket.id_piket, s.id_santri)}
                              disabled={actionLoading === `add-${piket.id_piket}-${s.id_santri}`}
                              className="w-full p-2 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                            >
                              <img
                                src={getStudentPhotoUrl(s.foto_santri, '/default-avatar.png')}
                                alt={s.nama_panggilan_santri}
                                className="w-6 h-6 rounded-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
                              />
                              <span className="text-sm text-gray-700 truncate">
                                {s.nama_panggilan_santri || s.nama_lengkap_santri}
                              </span>
                              {actionLoading === `add-${piket.id_piket}-${s.id_santri}` && (
                                <Loader2 className="w-4 h-4 animate-spin ml-auto" />
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* No Piket Placeholder */}
                {!piket && (
                  <button
                    onClick={() => handleAddPiketForDay(hari)}
                    disabled={actionLoading?.startsWith('add-piket-')}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary hover:text-primary-light flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading === `add-piket-${hari}` ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Membuat...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Tambahkan Jadwal</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Kelola Jenis Piket */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">Kelola Jenis Piket</h3>
          </div>
          <button
            onClick={() => openJenisModal()}
            className="px-3 py-1.5 bg-primary-light text-white rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-primary"
          >
            <Plus className="w-4 h-4" />
            Tambah Jenis
          </button>
        </div>
        
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Nama Jenis</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Warna</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {jenisList.map((jenis) => (
                  <tr key={jenis.id_jenis_piket} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-3">
                      <span className="font-medium text-gray-800">{jenis.nama_jenis}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block w-6 h-6 rounded ${getColorClass(jenis.warna)}`}></span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => openJenisModal(jenis)}
                        className="p-1.5 text-primary-light hover:bg-primary/5 rounded mr-1"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteJenis(jenis)}
                        disabled={actionLoading === `delete-jenis-${jenis.id_jenis_piket}`}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                        title="Hapus"
                      >
                        {actionLoading === `delete-jenis-${jenis.id_jenis_piket}` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Kelola Jadwal Piket per Hari */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">Kelola Jadwal {selectedJenis}</h3>
          </div>
          <button
            onClick={() => setShowAddPiket(true)}
            className={`px-3 py-1.5 ${getColorClass(jenisList.find(j => j.nama_jenis === selectedJenis)?.warna || 'gray')} text-white rounded-lg text-sm font-medium flex items-center gap-1 hover:opacity-90`}
          >
            <Plus className="w-4 h-4" />
            Tambah Hari
          </button>
        </div>
        
        <div className="p-4">
          {currentPikets.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>Belum ada jadwal piket untuk {selectedJenis}</p>
              <p className="text-sm">Klik "Tambah Hari" untuk membuat jadwal baru</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {currentPikets.map((piket) => (
                <div
                  key={piket.id_piket}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">{piket.hari_piket}</span>
                    <button
                      onClick={() => handleDeletePiket(piket.id_piket, piket.hari_piket)}
                      disabled={actionLoading === `delete-piket-${piket.id_piket}`}
                      className="p-1 text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition"
                      title="Hapus jadwal"
                    >
                      {actionLoading === `delete-piket-${piket.id_piket}` ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">{piket.santri.length} santri</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Tambah Piket */}
      {showAddPiket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Tambah Jadwal {selectedJenis}</h3>
              <button onClick={() => setShowAddPiket(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Hari</label>
              <select
                value={newPiketHari}
                onChange={(e) => setNewPiketHari(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary"
              >
                {HARI_LIST.filter(h => !currentPikets.some(p => p.hari_piket === h)).map((hari) => (
                  <option key={hari} value={hari}>{hari}</option>
                ))}
              </select>
              {HARI_LIST.filter(h => !currentPikets.some(p => p.hari_piket === h)).length === 0 && (
                <p className="text-sm text-amber-600 mt-2">Semua hari sudah memiliki jadwal</p>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddPiket(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                onClick={handleAddPiket}
                disabled={actionLoading === 'add-piket' || HARI_LIST.filter(h => !currentPikets.some(p => p.hari_piket === h)).length === 0}
                className={`flex-1 px-4 py-2 ${getColorClass(jenisList.find(j => j.nama_jenis === selectedJenis)?.warna || 'gray')} text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2`}
              >
                {actionLoading === 'add-piket' && <Loader2 className="w-4 h-4 animate-spin" />}
                Tambah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah/Edit Jenis Piket */}
      {showJenisModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editingJenis ? 'Edit' : 'Tambah'} Jenis Piket</h3>
              <button onClick={() => setShowJenisModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Jenis</label>
                <input
                  type="text"
                  value={jenisForm.nama_jenis}
                  onChange={(e) => setJenisForm({ ...jenisForm, nama_jenis: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary"
                  placeholder="Contoh: Masak, Ronda, dll"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Warna</label>
                <div className="grid grid-cols-4 gap-2">
                  {WARNA_OPTIONS.map((w) => (
                    <button
                      key={w.value}
                      onClick={() => setJenisForm({ ...jenisForm, warna: w.value })}
                      className={`h-10 rounded-lg ${w.class} ${jenisForm.warna === w.value ? 'ring-2 ring-offset-2 ring-gray-800' : ''}`}
                      title={w.label}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowJenisModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                onClick={handleSaveJenis}
                disabled={actionLoading === 'save-jenis'}
                className="flex-1 px-4 py-2 bg-primary-light text-white rounded-lg hover:bg-primary disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === 'save-jenis' && <Loader2 className="w-4 h-4 animate-spin" />}
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-700 mb-2">Petunjuk:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>- Drag & drop santri antar hari untuk memindahkan</li>
          <li>- Klik tombol + untuk menambah santri ke jadwal</li>
          <li>- Hover santri lalu klik ikon trash untuk menghapus</li>
          <li>- Kelola jadwal di bagian bawah (tambah/hapus hari)</li>
        </ul>
      </div>
    </div>
  );
}
