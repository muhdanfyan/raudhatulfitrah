import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, AlertTriangle, Loader2, Scale, Clock, ChevronDown, ChevronUp, Printer } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL, getHeaders } from '../../services/api';

interface Tatib {
  id_tatib: number;
  nama_tatib: string;
  deskripsi_tatib: string;
}

interface Pelanggaran {
  pelanggaran: string;
  sanksi: string;
  pj_sanksi?: string;
  nama_pj?: string;
  nama_tatib: string;
}

interface SanksiPribadi {
  nama_pelanggaran: string;
  sanksi_standar: string;
  status_sanksi: string;
  nama_tatib: string;
  created_at: string;
}

export default function SantriTatibPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tatibList, setTatibList] = useState<Tatib[]>([]);
  const [pelanggaranList, setPelanggaranList] = useState<Pelanggaran[]>([]);
  const [sanksiPribadi, setSanksiPribadi] = useState<SanksiPribadi[]>([]);
  const [sanksiAktif, setSanksiAktif] = useState(0);
  const [expandedRules, setExpandedRules] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (user?.santri_id) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/santri-feature/tatib/${user?.santri_id}`, {
        headers: getHeaders()
      });
      const json = await res.json();
      if (json.status === 'success' || json.success) {
        setTatibList(json.data?.tatib || []);
        setPelanggaranList(json.data?.pelanggaran || []);
        setSanksiPribadi(json.data?.sanksi_pribadi?.list || []);
        setSanksiAktif(json.data?.sanksi_pribadi?.aktif || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRule = (id: number) => {
    setExpandedRules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-3">
        <BookOpen className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Tata Tertib & Konsekuensi</h1>
      </div>

      {/* Alert if has active sanctions */}
      {Number(sanksiAktif) > 0 && (
        <div 
          onClick={() => navigate('/santri/sanksi')}
          className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm cursor-pointer hover:bg-rose-100 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-rose-100 p-3 rounded-xl group-hover:bg-rose-200 transition-colors">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h3 className="font-bold text-rose-800">Perhatian Kedisiplinan</h3>
              <p className="text-sm text-rose-700">
                Anda memiliki <strong>{sanksiAktif} sanksi</strong> yang sedang aktif atau perlu ditindaklanjuti.
              </p>
            </div>
          </div>
          <ChevronUp className="w-5 h-5 text-rose-400 rotate-90" />
        </div>
      )}

      {/* Integrated Rules & Violations Section */}
      <div className="space-y-4">
        {tatibList.map((tatib) => {
          const relatedViolations = pelanggaranList.filter(v => v.nama_tatib === tatib.nama_tatib);
          const isExpanded = expandedRules[tatib.id_tatib];
          
          return (
            <div key={tatib.id_tatib} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header Aturan */}
              <div 
                onClick={() => toggleRule(tatib.id_tatib)}
                className="p-5 bg-gradient-to-r from-blue-50 to-white border-b border-blue-50 cursor-pointer hover:from-blue-100 transition-colors flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-blue-900 leading-tight">
                    {tatib.nama_tatib}
                  </h2>
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-blue-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-blue-400 shrink-0" />}
              </div>

              {isExpanded && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="p-5 border-b border-gray-50">
                    {tatib.deskripsi_tatib ? (
                      <div 
                        className="text-sm text-gray-600 prose prose-sm max-w-none prose-p:leading-relaxed prose-li:my-1" 
                        dangerouslySetInnerHTML={{ __html: tatib.deskripsi_tatib }}
                      />
                    ) : (
                      <p className="text-xs italic text-gray-400">Tidak ada deskripsi tambahan.</p>
                    )}
                  </div>

                  {/* Daftar Pelanggaran Terkait */}
                  {relatedViolations.length > 0 && (
                    <div className="p-5 bg-white">
                      <div className="flex items-center gap-2 mb-3">
                        <Scale className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                          Konsekuensi Pelanggaran
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {relatedViolations.map((v, idx) => (
                          <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col h-full">
                            <div className="font-semibold text-gray-800 text-sm mb-2">
                              {v.pelanggaran}
                            </div>
                            <div className="flex gap-2 text-sm flex-1">
                              <span className="text-red-500 font-bold shrink-0">Sanksi:</span>
                              <div 
                                className="text-gray-700 prose prose-sm max-w-none prose-p:m-0"
                                dangerouslySetInnerHTML={{ __html: v.sanksi }}
                              />
                            </div>
                            {v.pj_sanksi && (
                              <div className="mt-4 pt-2 border-t border-gray-200/50 flex items-center justify-between">
                                <span className="text-[10px] bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded-lg font-bold uppercase">
                                  PJ: {v.nama_pj || `Admin ID ${v.pj_sanksi}`}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        
        {tatibList.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Data tata tertib belum tersedia.</p>
          </div>
        )}
      </div>

      {/* Sanksi Pribadi Section - Separate as it's personal history */}
      {sanksiPribadi.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden mt-10">
          <div className="p-5 bg-red-50 border-b border-red-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-bold text-red-900">Riwayat Sanksi Saya</h2>
            </div>
            <span className="text-xs font-bold bg-red-200 text-red-700 px-2 py-1 rounded-full">
              {sanksiPribadi.length} Total
            </span>
          </div>
          <div className="p-5 space-y-3">
            {sanksiPribadi.slice(0, 5).map((item, idx) => {
              const s = item.status_sanksi?.toLowerCase().trim();
              const isEmerald = s === 'sudah diberikan';
              
              return (
                <div key={idx} className={`p-4 rounded-xl border transition-all ${
                  isEmerald 
                    ? 'bg-emerald-50 border-emerald-100 shadow-sm shadow-emerald-100/30' 
                    : 'bg-rose-50 border-rose-100 shadow-sm shadow-rose-100/30'
                }`}>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="font-bold text-gray-900">{item.nama_pelanggaran}</div>
                      <div className="text-xs text-gray-500 font-medium mt-0.5">{item.nama_tatib}</div>
                      <div className="text-[10px] text-gray-400 mt-2 flex items-center gap-1 uppercase tracking-tighter">
                        <Clock className="w-3 h-3" />
                        {item.created_at?.slice(0, 10)}
                      </div>
                    </div>
                    <span className={`shrink-0 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md transition-all ${
                      isEmerald 
                        ? 'bg-emerald-500 text-white shadow-emerald-200/50' 
                        : 'bg-rose-500 text-white shadow-rose-200/50'
                    }`}>
                      {item.status_sanksi}
                    </span>
                  </div>
                  {item.sanksi_standar && (
                    <div className="mt-3 p-3 bg-white/50 rounded-lg text-sm border border-gray-100/50">
                      <strong className="text-gray-900 font-bold block mb-1">Amanah Sanksi:</strong>
                      <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.sanksi_standar }} />
                    </div>
                  )}
                </div>
              );
            })}
            
            {sanksiPribadi.length > 5 && (
              <p className="text-center text-xs text-gray-400 py-2 italic">
                Menampilkan 5 data terbaru...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Print Button */}
      <div className="flex justify-center pt-10 no-print">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-all shadow-lg active:scale-95"
        >
          <Printer className="w-5 h-5" />
          <span className="font-bold">Cetak Tata Tertib</span>
        </button>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .pb-20 { padding-bottom: 0 !important; }
          .shadow-sm, .shadow-md, .shadow-lg, .shadow-xl { shadow: none !important; border: 1px solid #eee !important; }
          .bg-gradient-to-r { background: #f8fafc !important; color: #1e3a8a !important; }
          .bg-gray-50 { background: white !important; }
          .border-gray-100 { border-color: #eee !important; }
          /* Ensure all accordions are visible when printing */
          .animate-in { display: block !important; }
        }
      `}</style>
    </div>
  );
}
