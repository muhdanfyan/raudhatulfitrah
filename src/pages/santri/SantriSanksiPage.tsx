import { useState, useEffect } from 'react';
import { AlertTriangle, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL, getHeaders } from '../../services/api';

export default function SantriSanksiPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({ list: [], aktif: 0 });

  useEffect(() => {
    if (user?.santri_id) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/santri-feature/sanksi/${user?.santri_id}`, {
        headers: getHeaders()
      });
      const json = await res.json();
      setData(json.data || { list: [], aktif: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const s = status?.toLowerCase().trim();
    switch (s) {
      case 'sudah diberikan': return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'ditinjau kembali': return <Clock className="w-5 h-5 text-amber-600" />;
      case 'dibatalkan': return <XCircle className="w-5 h-5 text-gray-400" />;
      default: return <AlertTriangle className="w-5 h-5 text-rose-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase().trim();
    switch (s) {
      case 'sudah diberikan': return 'bg-emerald-500 text-white shadow-md shadow-emerald-200/50';
      case 'ditinjau kembali': return 'bg-amber-500 text-white shadow-md shadow-amber-200/50';
      case 'dibatalkan': return 'bg-gray-400 text-white shadow-sm shadow-gray-200/50';
      default: return 'bg-rose-500 text-white shadow-md shadow-rose-200/50';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 pb-10">
      <h1 className="text-2xl font-bold text-gray-900">Sanksi Saya</h1>

      {/* Warning jika ada sanksi aktif */}
      {data.aktif > 0 && (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-rose-600" />
            <div>
              <h3 className="font-bold text-rose-800">Perhatian!</h3>
              <p className="text-sm text-rose-600 font-medium">
                Anda memiliki {data.aktif} sanksi yang belum diselesaikan
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-rose-50 rounded-xl p-4 text-center border border-rose-100 shadow-sm shadow-rose-100/50 transition-all hover:scale-[1.02]">
          <div className="text-2xl font-bold text-rose-700">{data.aktif}</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Aktif</div>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100 shadow-sm shadow-amber-100/50 transition-all hover:scale-[1.02]">
          <div className="text-2xl font-bold text-amber-700">
            {data.list?.filter((s: any) => s.status_sanksi?.toLowerCase().trim() === 'ditinjau kembali').length || 0}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Ditinjau</div>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100 shadow-sm shadow-emerald-100/50 transition-all hover:scale-[1.02]">
          <div className="text-2xl font-bold text-emerald-700">
            {data.list?.filter((s: any) => s.status_sanksi?.toLowerCase().trim() === 'sudah diberikan').length || 0}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Selesai</div>
        </div>
      </div>

      {/* Daftar Sanksi */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <Clock className="w-5 h-5 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Riwayat Sanksi</h2>
        </div>
        
        <div className="space-y-4">
          {data.list?.map((item: any, i: number) => {
            const s = item.status_sanksi?.toLowerCase().trim();
            const isEmerald = s === 'sudah diberikan';
            const isAmber = s === 'ditinjau kembali';
            
            return (
              <div key={i} className={`rounded-2xl p-5 border transition-all ${
                isEmerald 
                  ? 'bg-emerald-50/30 border-emerald-100 hover:bg-emerald-50/50 shadow-sm shadow-emerald-100/20' 
                  : (isAmber ? 'bg-amber-50/30 border-amber-100 hover:bg-amber-50/50 shadow-sm shadow-amber-100/20' : 'bg-rose-50/30 border-rose-100 hover:bg-rose-50/50 shadow-sm shadow-rose-100/20')
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="mt-1">
                      {getStatusIcon(item.status_sanksi)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-lg leading-tight">{item.nama_pelanggaran}</div>
                      <div className="text-sm font-medium text-gray-400 mt-1">{item.nama_tatib}</div>
                      <div className="text-[10px] font-bold text-gray-300 mt-3 flex items-center gap-1 uppercase tracking-tighter">
                        <Clock className="w-3 h-3" />
                        {item.created_at?.slice(0, 10)}
                      </div>
                    </div>
                  </div>
                  <span className={`shrink-0 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.05em] shadow-md transition-all ${getStatusColor(item.status_sanksi)}`}>
                    {item.status_sanksi}
                  </span>
                </div>
                
                {item.sanksi_standar && (
                  <div className="mt-4 p-4 bg-white/60 rounded-xl text-sm border border-white shadow-sm">
                    <strong className="text-gray-900 font-bold block mb-1">Amanah Sanksi:</strong>
                    <div className="text-gray-700 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: item.sanksi_standar }} />
                  </div>
                )}
                
                {item.keterangan && (
                  <div className="mt-3 text-xs text-indigo-600 font-medium bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/50">
                    <span className="opacity-60">Catatan:</span> {item.keterangan}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {data.list?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            Tidak ada riwayat sanksi
          </div>
        )}
      </div>
    </div>
  );
}
