import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Loader2, CheckCircle, XCircle, Search, AlertTriangle, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';



interface SantriRequirement {
  santri: { id: number; name: string; foto_url?: string };
  review: number;
  portfolio: number;
  hafalan_baru: number;
  murojaah: number;
  murojaah_lama: number;
  murojaah_pekanan: number;
  tasmi: number;
  tulisan: number;
  sanksi: number;
  skoring: number;
  terpenuhi: boolean;
}

interface RequirementData {
  periode: { mulai: string; selesai: string; hari_mulai: string; hari_selesai: string };
  targets: { 
    review: number; 
    portfolio: number; 
    hafalan_baru: number; 
    murojaah: number;
    murojaah_lama: number;
    murojaah_pekanan: number;
    tasmi: number;
    tulisan: number; 
    sanksi: number; 
    skoring: number 
  };
  summary: { total_santri: number; terpenuhi: number; belum_terpenuhi: number };
  santri: SantriRequirement[];
}

const REQ_CONFIG: { [key: string]: { label: string; isSanksi?: boolean } } = {
    review: { label: 'Review' },
    portfolio: { label: 'Portfolio' },
    hafalan_baru: { label: 'Hafalan' },
    // murojaah: { label: 'Murojaah' },
    // murojaah_lama: { label: 'Murojaah Lama' },
    // murojaah_pekanan: { label: 'Murojaah Pekanan' },
    tasmi: { label: 'Tasmi' },
    tulisan: { label: 'Tulisan' },
    sanksi: { label: 'Sanksi', isSanksi: true },
    skoring: { label: 'Skoring' },
};

export default function RequirementPage() {
  const [data, setData] = useState<RequirementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'terpenuhi' | 'belum'>('all');
  const [weekOffset, setWeekOffset] = useState<number>(0);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const json: any = await api.get(`/api/requirement/all?week_offset=${weekOffset}`);
        if (json.status === 'success') {
          setData(json.data);
        } else {
          setError(json.message || 'Gagal memuat data');
        }
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [weekOffset]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        {error || 'Data tidak tersedia'}
      </div>
    );
  }

  const filteredSantri = data.santri.filter(s => {
    const matchSearch = s.santri.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (filter === 'terpenuhi' ? s.terpenuhi : !s.terpenuhi);
    return matchSearch && matchFilter;
  });

  const getStatusColor = (current: number, target: number, isSanksi = false) => {
    if (isSanksi) {
      return current === target ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
    }
    return current >= target ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
  };

  const getWeekLabel = () => {
    if (weekOffset === 0) return 'Pekan Ini';
    if (weekOffset === -1) return 'Pekan Lalu';
    return `${Math.abs(weekOffset)} Pekan Lalu`;
  };

  // Identify requirements to show (target > 0 or sanksi)
  const activeReqKeys = Object.keys(REQ_CONFIG).filter(key => {
    if (key === 'sanksi') return true;
    const target = (data.targets as any)[key] || 0;
    return target > 0;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Requirement Pekanan</h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-gray-600">
            Periode: {data.periode.hari_mulai} - {data.periode.hari_selesai} ({data.periode.mulai} s/d {data.periode.selesai})
          </p>
          
          {/* Week Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset(prev => prev - 1)}
              disabled={weekOffset <= -12}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Pekan Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            
            <button
              onClick={() => setWeekOffset(0)}
              disabled={weekOffset === 0}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
                weekOffset === 0 
                  ? 'bg-primary text-white' 
                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              {getWeekLabel()}
            </button>
            
            <button
              onClick={() => setWeekOffset(prev => prev + 1)}
              disabled={weekOffset >= 0}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Pekan Selanjutnya"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>


      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="text-sm text-gray-500">Total Santri</div>
          <div className="text-2xl font-bold text-gray-900">{data.summary.total_santri}</div>
        </div>
        <div className="bg-green-50 rounded-xl shadow-sm border border-green-200 p-4">
          <div className="text-sm text-green-600">Terpenuhi</div>
          <div className="text-2xl font-bold text-green-700">{data.summary.terpenuhi}</div>
        </div>
        <div className="bg-red-50 rounded-xl shadow-sm border border-red-200 p-4">
          <div className="text-sm text-red-600">Belum Terpenuhi</div>
          <div className="text-2xl font-bold text-red-700">{data.summary.belum_terpenuhi}</div>
        </div>
      </div>

      {/* Target Info */}
      <div className="bg-primary/5 rounded-xl p-4 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Target Pekanan</h3>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {activeReqKeys.map(key => (
            <div key={key}>
              <span className="text-primary font-medium">{REQ_CONFIG[key].label}:</span> {(data.targets as any)[key]}
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari santri..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilter('terpenuhi')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${filter === 'terpenuhi' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            <CheckCircle className="w-4 h-4" /> Terpenuhi
          </button>
          <button
            onClick={() => setFilter('belum')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${filter === 'belum' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            <XCircle className="w-4 h-4" /> Belum
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Santri</th>
                {activeReqKeys.map(key => (
                  <th key={key} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {REQ_CONFIG[key].label}
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSantri.map((s) => (
                <tr key={s.santri.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {s.santri.foto_url ? (
                        <img src={s.santri.foto_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                          {s.santri.name.charAt(0)}
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-900 leading-tight">{s.santri.name}</span>
                    </div>
                  </td>
                  
                  {activeReqKeys.map(key => {
                    const current = (s as any)[key] || 0;
                    const target = (data.targets as any)[key] || 0;
                    const isSanksi = REQ_CONFIG[key].isSanksi;
                    
                    return (
                      <td key={key} className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(current, target, isSanksi)}`}>
                          {current}/{target}
                        </span>
                      </td>
                    );
                  })}

                  <td className="px-4 py-3 text-center">
                    {(() => {
                      const isAllGreen = activeReqKeys.every(key => {
                        const current = (s as any)[key] || 0;
                        const target = (data.targets as any)[key] || 0;
                        const isSanksi = REQ_CONFIG[key].isSanksi;
                        return isSanksi ? current === target : current >= target;
                      });

                      return isAllGreen ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-500 mx-auto transition-transform hover:scale-110 cursor-help" />
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredSantri.length === 0 && (
          <div className="text-center py-12 text-gray-500">Tidak ada data</div>
        )}
      </div>
    </div>
  );
}
