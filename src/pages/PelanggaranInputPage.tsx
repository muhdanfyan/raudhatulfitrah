import { useState, useEffect, useCallback } from 'react';
import { API_URL, getHeaders } from '../services/api';
import { Search, AlertTriangle, Check, X, Loader2, User, Shield } from 'lucide-react';



interface Santri {
  id_santri: number;
  nama_lengkap_santri: string;
  foto_santri?: string;
}

interface Tatib {
  id_tatib: number;
  nama_tatib: string;
}

interface Pelanggaran {
  id_langgar: number;
  tatib: number;
  pelanggaran: string;
  sanksi: string;
  tatib_rel?: Tatib;
}

export default function PelanggaranInputPage() {
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [pelanggaranList, setPelanggaranList] = useState<Pelanggaran[]>([]);
  const [tatibList, setTatibList] = useState<Tatib[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [searchSantri, setSearchSantri] = useState('');
  const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null);
  const [selectedPelanggaran, setSelectedPelanggaran] = useState<Pelanggaran | null>(null);
  const [deskripsi, setDeskripsi] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [filterTatib, setFilterTatib] = useState<number | null>(null);


  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const headers = getHeaders();

      // Fetch santri
      const santriRes = await fetch(`${API_URL}/santri?status_santri=mondok&per_page=200`, { headers });
      const santriData = await santriRes.json();
      if (santriData.success) setSantriList(santriData.data?.data || santriData.data || []);

      // Fetch tatib
      const tatibRes = await fetch(`${API_URL}/master/tatib`, { headers });
      const tatibData = await tatibRes.json();
      if (tatibData.success) setTatibList(tatibData.data || []);

      // Fetch pelanggaran (langgar)
      const langgarRes = await fetch(`${API_URL}/master/langgar`, { headers });
      const langgarData = await langgarRes.json();
      if (langgarData.success) setPelanggaranList(langgarData.data || []);

    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredSantri = santriList.filter(s => 
    s.nama_lengkap_santri?.toLowerCase().includes(searchSantri.toLowerCase())
  );

  const filteredPelanggaran = pelanggaranList.filter(p => 
    filterTatib === null || p.tatib === filterTatib
  );

  // Group pelanggaran by tatib
  const groupedPelanggaran = filteredPelanggaran.reduce((acc, p) => {
    const tatibId = p.tatib;
    if (!acc[tatibId]) acc[tatibId] = [];
    acc[tatibId].push(p);
    return acc;
  }, {} as Record<number, Pelanggaran[]>);

  const handleSubmit = async () => {
    if (!selectedSantri || !selectedPelanggaran) return;

    try {
      setSaving(true);
      const headers = getHeaders(true);

      const response = await fetch(`${API_URL}/crud/sanksi`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          santri: selectedSantri.id_santri,
          pelanggaran: selectedPelanggaran.id_langgar,
          deskripsi_sanksi: deskripsi || selectedPelanggaran.pelanggaran,
          status_sanksi: 'Belum Diberikan'
        })
      });

      const result = await response.json();
      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setSelectedPelanggaran(null);
          setDeskripsi('');
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
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
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">Input Pelanggaran</h1>
            <p className="text-red-100">Catat pelanggaran santri dengan cepat dan mudah</p>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-bounce z-50">
          <Check className="w-5 h-5" />
          Pelanggaran berhasil dicatat!
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Step 1: Select Santri */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">1</div>
            <h2 className="text-lg font-bold text-gray-900">Pilih Santri</h2>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama santri..."
              value={searchSantri}
              onChange={(e) => setSearchSantri(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary"
            />
          </div>

          {selectedSantri ? (
            <div className="p-4 bg-primary/5 rounded-lg border-2 border-primary">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-gray-900">{selectedSantri.nama_lengkap_santri}</span>
                </div>
                <button onClick={() => setSelectedSantri(null)} className="text-gray-500 hover:text-red-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredSantri.slice(0, 20).map((santri) => (
                <button
                  key={santri.id_santri}
                  onClick={() => setSelectedSantri(santri)}
                  className="w-full text-left p-3 rounded-lg hover:bg-primary/5 border border-transparent hover:border-blue-300 transition flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium">
                    {santri.nama_lengkap_santri?.charAt(0)}
                  </div>
                  <span className="text-gray-700">{santri.nama_lengkap_santri}</span>
                </button>
              ))}
              {filteredSantri.length === 0 && (
                <p className="text-gray-500 text-center py-4">Tidak ada santri ditemukan</p>
              )}
            </div>
          )}
        </div>

        {/* Step 2: Select Pelanggaran */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-8 h-8 ${selectedSantri ? 'bg-orange-500' : 'bg-gray-300'} text-white rounded-full flex items-center justify-center font-bold`}>2</div>
            <h2 className="text-lg font-bold text-gray-900">Pilih Pelanggaran</h2>
          </div>

          {/* Filter by Tatib */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setFilterTatib(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                filterTatib === null ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Semua
            </button>
            {tatibList.slice(0, 8).map((tatib) => (
              <button
                key={tatib.id_tatib}
                onClick={() => setFilterTatib(tatib.id_tatib)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition truncate max-w-[200px] ${
                  filterTatib === tatib.id_tatib ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tatib.nama_tatib?.replace(/^\d+\.\s*/, '')}
              </button>
            ))}
          </div>

          {!selectedSantri ? (
            <div className="text-center py-12 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Pilih santri terlebih dahulu</p>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto space-y-4">
              {Object.entries(groupedPelanggaran).map(([tatibId, pelanggarans]) => {
                const tatib = tatibList.find(t => t.id_tatib === Number(tatibId));
                return (
                  <div key={tatibId}>
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">{tatib?.nama_tatib}</h3>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {pelanggarans.map((p) => (
                        <button
                          key={p.id_langgar}
                          onClick={() => setSelectedPelanggaran(p)}
                          className={`text-left p-3 rounded-lg border-2 transition ${
                            selectedPelanggaran?.id_langgar === p.id_langgar
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <AlertTriangle className={`w-4 h-4 mt-0.5 ${selectedPelanggaran?.id_langgar === p.id_langgar ? 'text-red-500' : 'text-orange-500'}`} />
                            <span className="text-sm text-gray-700">{p.pelanggaran}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Step 3: Confirm & Submit */}
      {selectedSantri && selectedPelanggaran && (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
            <h2 className="text-lg font-bold">Konfirmasi & Simpan</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-sm text-gray-400">Santri</p>
              <p className="font-semibold">{selectedSantri.nama_lengkap_santri}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-sm text-gray-400">Pelanggaran</p>
              <p className="font-semibold">{selectedPelanggaran.pelanggaran}</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm text-gray-400 block mb-2">Catatan Tambahan (opsional)</label>
            <input
              type="text"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Tambahkan catatan jika perlu..."
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              {saving ? 'Menyimpan...' : 'Catat Pelanggaran'}
            </button>
            <button
              onClick={() => { setSelectedPelanggaran(null); setDeskripsi(''); }}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
