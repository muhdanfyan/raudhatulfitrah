import { Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

// Removed unused PresensiItem interface

interface PresensiHariIniTableProps {
  presensi: any[]; // Changed to any to handle mixed data sources easily
  title?: string;
}

export default function PresensiHariIniTable({ 
  presensi = [], 
  title = 'Presensi Hari Ini'
}: PresensiHariIniTableProps) {
  const displayData = presensi; // Show all students

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'on-time':
      case 'pertamax':
        return { 
          color: 'text-emerald-500', 
          hoverColor: 'hover:text-emerald-600',
          bgColor: 'bg-emerald-50',
          label: 'Hadir', 
          icon: CheckCircle 
        };
      case 'telat':
        return { 
          color: 'text-amber-500', 
          hoverColor: 'hover:text-amber-600',
          bgColor: 'bg-amber-50',
          label: 'Telat', 
          icon: Clock 
        };
      default:
        return { 
          color: 'text-red-500', 
          hoverColor: 'hover:text-red-600',
          bgColor: 'bg-red-50',
          label: 'Absen', 
          icon: AlertCircle 
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">{title}</h2>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Kehadiran 5 Waktu</p>
          </div>
        </div>
        <Link to="/presensi" className="text-xs text-indigo-600 font-bold hover:underline">Detail</Link>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead className="bg-gray-50/50">
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-3 font-bold text-gray-400 uppercase tracking-tighter">Santri</th>
              <th className="text-center py-3 px-1 font-bold text-gray-400 uppercase tracking-tighter w-12">Shb</th>
              <th className="text-center py-3 px-1 font-bold text-gray-400 uppercase tracking-tighter w-12">Prd</th>
              <th className="text-center py-3 px-1 font-bold text-gray-400 uppercase tracking-tighter w-12">Dzh</th>
              <th className="text-center py-3 px-1 font-bold text-gray-400 uppercase tracking-tighter w-12">Asr</th>
              <th className="text-center py-3 px-1 font-bold text-gray-400 uppercase tracking-tighter w-12">Mgr</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {displayData.map((item, index) => {
              const name = item.nama_lengkap_santri || item.nama_santri || 'Santri';
              return (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-1.5 px-3">
                    <div className="font-semibold text-gray-900 truncate">{name}</div>
                  </td>
                  {[item.shubuh, item.waktu_produktif, item.dzuhur, item.ashar, item.maghrib_isya].map((status, i) => {
                    const info = getStatusInfo(status);
                    const Icon = info.icon;
                    return (
                      <td key={i} className="py-1.5 px-1 text-center">
                        <div className="flex justify-center">
                          <div 
                            className={`p-1.5 rounded-lg transition-all duration-300 ${info.bgColor} ${info.color} ${info.hoverColor} cursor-help`}
                            title={info.label}
                          >
                            <Icon className="w-4 h-4" strokeWidth={3} />
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {presensi.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <p className="text-sm font-medium text-gray-400">Belum ada data presensi hari ini</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
