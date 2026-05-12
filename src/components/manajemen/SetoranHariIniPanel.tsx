import { BookOpen, Plus, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStudentPhotoUrl } from '../../utils/imageUtils';

interface SetoranItem {
  id_santri?: number;
  nama_lengkap_santri: string;
  foto_santri?: string;
  foto_url?: string;
  surah: string;
  ayat: string;
  juz_hafalan: string;
  nilaitahfidz: string;
}

interface SetoranHariIniPanelProps {
  setoran: SetoranItem[];
  title?: string;
  maxDisplay?: number;
}

export default function SetoranHariIniPanel({ 
  setoran = [], 
  title = 'Setoran Hari Ini',
  maxDisplay = 10 
}: SetoranHariIniPanelProps) {
  const displayData = setoran.slice(0, maxDisplay);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">{title}</h2>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{setoran.length} Hafalan Tercatat</p>
          </div>
        </div>
        <Link 
          to="/tahfidz" 
          className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
          title="Lihat Detail"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2 max-h-[400px]">
        {displayData.map((item, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-emerald-100 shadow-sm relative group">
              <img
                src={getStudentPhotoUrl(item.foto_url || item.foto_santri)}
                alt={item.nama_lengkap_santri}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => { 
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.nama_lengkap_santri)}&background=D1FAE5&color=059669`;
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <h4 className="font-bold text-gray-900 text-sm truncate">{item.nama_lengkap_santri}</h4>
                <div className="px-2 py-0.5 bg-emerald-600 text-[10px] font-bold text-white rounded-md shadow-sm">
                  Nilai: {item.nilaitahfidz}
                </div>
              </div>
              <p className="text-xs text-gray-600 font-medium">
                {item.surah} <span className="text-gray-400 mx-1">|</span> Ayat {item.ayat}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] bg-white px-2 py-0.5 border border-gray-200 rounded text-gray-500 font-bold uppercase">
                  {item.juz_hafalan}
                </span>
              </div>
            </div>
          </div>
        ))}

        {setoran.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
              <BookOpen className="w-8 h-8 text-gray-200" />
            </div>
            <p className="text-sm font-medium text-gray-400">Belum ada setoran hari ini</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <Link 
          to="/tahfidz" 
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all font-bold text-sm shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          Input Hafalan
        </Link>
      </div>
    </div>
  );
}
