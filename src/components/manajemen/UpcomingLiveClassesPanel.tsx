import React from 'react'; // eslint-disable-line no-unused-vars
import { Video, Calendar, ExternalLink, Plus, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LiveClass {
  id_live: number;
  judul: string;
  platform: 'zoom' | 'gmeet';
  meeting_link: string;
  jadwal_mulai: string;
  durasi_menit: number;
  status: string;
  course_judul?: string;
}

interface UpcomingLiveClassesPanelProps {
  upcoming: LiveClass[];
  title?: string;
}

export default function UpcomingLiveClassesPanel({ 
  upcoming = [], 
  title = 'Live Class Mendatang' 
}: UpcomingLiveClassesPanelProps) {
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">{title}</h2>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Jadwal Pertemuan Virtual</p>
          </div>
        </div>
        <Link to="/mentor/live-class" className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Tambah
        </Link>
      </div>

      <div className="p-4 space-y-3 overflow-y-auto max-h-[400px]">
        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-3 text-gray-200">
              <Camera className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium text-gray-400">Belum ada jadwal live class</p>
          </div>
        ) : (
          upcoming.map((live) => (
            <div key={live.id_live} className="p-4 rounded-xl bg-gradient-to-br from-red-50/50 to-white border border-red-100 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-sm group-hover:text-red-700 transition-colors truncate">
                    {live.judul}
                  </h4>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span className="text-[11px] text-gray-500 font-bold">{formatDate(live.jadwal_mulai)}</span>
                    <span className="text-[10px] text-gray-400 mx-1">|</span>
                    <span className="text-[11px] text-gray-500 font-bold">{live.durasi_menit} Menit</span>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider shadow-sm ${
                  live.platform === 'zoom' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {live.platform === 'zoom' ? 'Zoom' : 'Meet'}
                </span>
              </div>
              {live.meeting_link && (
                <div className="mt-4 pt-3 border-t border-red-100/50">
                  <a 
                    href={live.meeting_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold transition-all shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Buka Link Meeting
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
