import React from 'react'; // eslint-disable-line no-unused-vars
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

interface KeuanganSummary {
  saldo: number;
  debet: number;
  kredit: number;
}

interface KeuanganSummaryPanelProps {
  keuangan: KeuanganSummary;
  title?: string;
}

export default function KeuanganSummaryPanel({ 
  keuangan = { saldo: 0, debet: 0, kredit: 0 }, 
  title = 'Ringkasan Keuangan' 
}: KeuanganSummaryPanelProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 flex items-center gap-3 bg-white sticky top-0 z-10">
        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
          <DollarSign className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900">{title}</h2>
          <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Status Kas Saat Ini</p>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 gap-3">
        {/* Saldo Utama */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-5 rounded-2xl text-white shadow-md relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest mb-1">Total Saldo Kas</p>
            <div className="text-2xl font-black">{formatCurrency(keuangan.saldo || 0)}</div>
          </div>
          <Wallet className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 group-hover:scale-110 transition-transform duration-500" />
        </div>

        {/* Debet & Kredit */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Total Masuk</span>
            </div>
            <div className="text-sm font-black text-emerald-700">{formatCurrency(keuangan.debet || 0)}</div>
          </div>
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-3.5 h-3.5 text-red-600" />
              <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider">Total Keluar</span>
            </div>
            <div className="text-sm font-black text-red-700">{formatCurrency(keuangan.kredit || 0)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
