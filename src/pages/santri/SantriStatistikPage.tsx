import { useState, useEffect } from 'react';
import { TrendingUp, Loader2, Calendar, CheckCircle, Clock, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL, getHeaders } from '../../services/api';


export default function SantriStatistikPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (user?.santri_id) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/santri-feature/statistik/${user?.santri_id}`, {
        headers: getHeaders()
      });
      const json = await res.json();
      setData(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  const pekanan = data?.skoring_pekanan;
  const bulanan = data?.skoring_bulanan;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Statistik Kehadiran</h1>

      {/* Skoring Pekanan */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Skoring Pekanan
          </h2>
          <div className="text-right">
            <div className="text-sm text-gray-500">
              {data?.periode_pekan?.start} - {data?.periode_pekan?.end}
            </div>
            <div className={`text-2xl font-bold ${pekanan?.total >= pekanan?.target ? 'text-green-600' : 'text-red-600'}`}>
              {pekanan?.total || 0} / {pekanan?.target || 330}
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div 
            className={`h-4 rounded-full transition-all ${pekanan?.total >= pekanan?.target ? 'bg-green-500' : 'bg-amber-500'}`}
            style={{ width: `${Math.min((pekanan?.total / pekanan?.target) * 100, 100)}%` }}
          ></div>
        </div>

        {/* Detail harian */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Tanggal</th>
                <th className="px-3 py-2 text-center">Poin Harian</th>
                <th className="px-3 py-2 text-center">Poin Event</th>
                <th className="px-3 py-2 text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              {pekanan?.detail?.map((item: any, i: number) => (
                <tr key={i} className="border-b">
                  <td className="px-3 py-2">{item.tanggal}</td>
                  <td className="px-3 py-2 text-center">{item.poin_harian}</td>
                  <td className="px-3 py-2 text-center">{item.poin_event}</td>
                  <td className="px-3 py-2 text-center font-medium">
                    {Number(item.poin_harian) + Number(item.poin_event)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Skoring Bulanan */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-600" />
            Skoring Bulan Ini
          </h2>
          <div className="text-right">
            <div className="text-sm text-gray-500">{data?.bulan_ini}</div>
            <div className="text-2xl font-bold text-teal-600">{bulanan?.total || 0} poin</div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {bulanan?.detail?.map((item: any, i: number) => {
            const total = Number(item.poin_harian) + Number(item.poin_event);
            const intensity = Math.min(total / 50, 1);
            return (
              <div 
                key={i}
                className="aspect-square rounded flex items-center justify-center text-xs"
                style={{ 
                  backgroundColor: `rgba(20, 184, 166, ${intensity})`,
                  color: intensity > 0.5 ? 'white' : 'inherit'
                }}
                title={`${item.tanggal}: ${total} poin`}
              >
                {new Date(item.tanggal).getDate()}
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Bulanan */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-purple-600" />
          Kehadiran Event Bulan Ini
        </h2>
        <div className="space-y-3">
          {data?.event_bulanan?.map((item: any, i: number) => (
            <div key={i} className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-3">
                {item.poin_kehadiran > 0 ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Clock className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <div className="font-medium">{item.nama_agenda}</div>
                  <div className="text-xs text-gray-500">{item.waktu_mulai?.slice(0, 16)}</div>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-sm ${
                item.poin_kehadiran === 10 ? 'bg-green-100 text-green-700' :
                item.poin_kehadiran === 5 ? 'bg-amber-100 text-amber-700' :
                'bg-gray-100 text-gray-500'
              }`}>
                {item.poin_kehadiran} poin
              </span>
            </div>
          ))}
        </div>
        {(!data?.event_bulanan || data.event_bulanan.length === 0) && (
          <div className="text-center py-8 text-gray-500">Tidak ada event bulan ini</div>
        )}
      </div>
    </div>
  );
}
