import React from 'react'; // eslint-disable-line no-unused-vars
import { ClipboardCheck, ExternalLink, Target } from 'lucide-react';

interface DailyReport {
  nama_lengkap_santri: string;
  target: string;
  link_belajar?: string;
  waktu?: string;
}

interface DailyReportHariIniPanelProps {
  reports: DailyReport[];
  title?: string;
}

export default function DailyReportHariIniPanel({ 
  reports = [], 
  title = 'Daily Report Hari Ini' 
}: DailyReportHariIniPanelProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">{title}</h2>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Progress Harian Santri</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3 overflow-y-auto max-h-[400px]">
        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-3 text-gray-200">
              <Target className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium text-gray-400">Belum ada daily report hari ini</p>
          </div>
        ) : (
          reports.map((daily, index) => (
            <div key={index} className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-200 transition-colors group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-sm truncate group-hover:text-blue-700 transition-colors">
                    {daily.nama_lengkap_santri}
                  </h4>
                  <div className="mt-2 text-xs text-gray-600 font-medium leading-relaxed italic bg-white p-2 rounded-lg border border-gray-100 ring-1 ring-blue-50/50">
                    "{daily.target}"
                  </div>
                </div>
              </div>
              {daily.link_belajar && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <a href={daily.link_belajar} target="_blank" rel="noopener noreferrer" 
                     className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Lihat Bukti Belajar
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
