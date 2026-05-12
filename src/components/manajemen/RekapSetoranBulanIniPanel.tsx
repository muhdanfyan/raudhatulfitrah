import React from 'react'; // eslint-disable-line no-unused-vars
import { Calendar, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RekapItem {
  nama_lengkap_santri: string;
  total_setoran: number;
}

interface RekapSetoranBulanIniPanelProps {
  rekap: RekapItem[];
  title?: string;
  maxDisplay?: number;
}

export default function RekapSetoranBulanIniPanel({ 
  rekap = [], 
  title = 'Rekap Setoran Bulan Ini',
  maxDisplay = 20 
}: RekapSetoranBulanIniPanelProps) {
  const displayData = rekap.slice(0, maxDisplay);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">{title}</h2>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Statistik Bulanan</p>
          </div>
        </div>
        <Link to="/tahfidz" className="text-xs text-emerald-600 font-bold hover:underline">Detail</Link>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/50">
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">No</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Santri</th>
              <th className="text-center py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {displayData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-4 text-gray-500 font-medium">{index + 1}</td>
                <td className="py-3 px-4">
                  <div className="font-bold text-gray-900">{item.nama_lengkap_santri}</div>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm ${
                    item.total_setoran > 0 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {item.total_setoran}
                  </span>
                </td>
              </tr>
            ))}
            {rekap.length === 0 && (
              <tr>
                <td colSpan={3} className="py-12 text-center">
                  <Calendar className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-400">Belum ada data bulan ini</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
