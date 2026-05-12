import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { getStudentPhotoUrl } from '../utils/imageUtils';

interface Santri {
  id_santri?: number;
  nama_lengkap_santri?: string;
  nama_panggilan_santri?: string;
  foto_santri?: string;
  foto_url?: string;
  angkatan_nama?: string;
  konsentrasi_nama?: string;
}

interface BelumSetorPanelProps {
  data: Santri[];
  title?: string;
  maxDisplay?: number;
  linkTo?: string;
}

export default function BelumSetorPanel({ 
  data = [], 
  title = 'Belum Setor Hari Ini',
  maxDisplay = 15,
  linkTo = '/tahfidz'
}: BelumSetorPanelProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        </div>
        <div className="flex items-center justify-center py-8 text-center">
          <div>
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-emerald-600 font-semibold">Alhamdulillah!</p>
            <p className="text-gray-500 text-sm mt-1">Semua santri sudah setor hari ini</p>
          </div>
        </div>
      </div>
    );
  }

  const displayData = data.slice(0, maxDisplay);
  const remaining = data.length - maxDisplay;

  return (
    <Link 
      to={linkTo} 
      className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-red-300 hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        </div>
        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
          {data.length} Santri
        </span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-80 overflow-y-auto">
        {displayData.map((santri: Santri, index: number) => (
          <div 
            key={santri.id_santri || index} 
            className="flex flex-col items-center p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 mb-2 flex-shrink-0 border border-red-100 shadow-sm relative group">
              <img
                src={getStudentPhotoUrl(santri.foto_url || santri.foto_santri)}
                alt={santri.nama_panggilan_santri || santri.nama_lengkap_santri}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => { 
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(santri.nama_panggilan_santri || santri.nama_lengkap_santri || 'S')}&background=FEE2E2&color=B91C1C`;
                }}
              />
            </div>
            <span className="text-xs font-medium text-red-700 text-center truncate w-full">
              {santri.nama_panggilan_santri || santri.nama_lengkap_santri?.split(' ')[0] || 'Santri'}
            </span>
          </div>
        ))}
      </div>

      {remaining > 0 && (
        <div className="mt-4 pt-3 border-t border-red-100 text-center">
          <span className="text-sm text-red-600 font-medium">
            + {remaining} santri lainnya →
          </span>
        </div>
      )}
    </Link>
  );
}
