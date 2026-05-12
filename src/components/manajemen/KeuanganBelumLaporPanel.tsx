import React from 'react'; // eslint-disable-line no-unused-vars
import { AlertCircle, FileWarning } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

interface KeuanganLog {
  aktifitas_keuangan: string;
  tgl_keuangan: string;
  nominal_keuangan: number;
  jenis_keuangan: string;
}

interface KeuanganBelumLaporPanelProps {
  logs: KeuanganLog[];
  title?: string;
}

export default function KeuanganBelumLaporPanel({ 
  logs = [], 
  title = 'Transaksi Belum Dilaporkan' 
}: KeuanganBelumLaporPanelProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">{title}</h2>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{logs.length} Menunggu Laporan</p>
          </div>
        </div>
      </div>

      <div className="p-2 space-y-2 overflow-y-auto max-h-[400px]">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-3 text-gray-200">
              <FileWarning className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium text-gray-400">Semua transaksi sudah dilaporkan!</p>
          </div>
        ) : (
          logs.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-transparent hover:border-red-100 hover:bg-red-50/30 transition-all group">
              <div className="min-w-0">
                <div className="font-bold text-gray-900 text-sm truncate group-hover:text-red-700">{item.aktifitas_keuangan}</div>
                <div className="text-[10px] text-gray-500 font-medium mt-0.5">{item.tgl_keuangan}</div>
              </div>
              <div className={`font-black text-sm shrink-0 ml-4 ${item.jenis_keuangan === 'Debet' ? 'text-emerald-600' : 'text-red-600'}`}>
                {item.jenis_keuangan === 'Debet' ? '+' : '-'}{formatCurrency(item.nominal_keuangan)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
