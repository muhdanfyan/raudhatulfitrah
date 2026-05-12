import { useState, useEffect } from 'react';
import { FileText, CheckCircle, Shield, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { API_URL, getHeaders } from '../services/api';

interface JobDesc {
  id: number;
  jabatan_id: number;
  deskripsi?: string;
  tanggung_jawab?: string;
  wewenang?: string;
}

interface JobdeskPanelProps {
  jabatanName: string; // 'akademik', 'pembinaan', 'asrama'
  title?: string;
  accentColor?: 'blue' | 'emerald' | 'amber' | 'indigo' | 'purple';
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    icon: 'text-blue-600',
    header: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    badge: 'bg-blue-100 text-blue-700',
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    icon: 'text-emerald-600',
    header: 'bg-gradient-to-r from-emerald-600 to-teal-600',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    icon: 'text-amber-600',
    header: 'bg-gradient-to-r from-amber-600 to-orange-600',
    badge: 'bg-amber-100 text-amber-700',
  },
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    icon: 'text-indigo-600',
    header: 'bg-gradient-to-r from-indigo-600 to-purple-600',
    badge: 'bg-indigo-100 text-indigo-700',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    icon: 'text-purple-600',
    header: 'bg-gradient-to-r from-purple-600 to-pink-600',
    badge: 'bg-purple-100 text-purple-700',
  },
};

export default function JobdeskPanel({ jabatanName, title, accentColor = 'blue' }: JobdeskPanelProps) {
  const [loading, setLoading] = useState(true);
  const [jobdesk, setJobdesk] = useState<JobDesc | null>(null);
  const [expanded, setExpanded] = useState(false);

  const colors = colorClasses[accentColor];

  useEffect(() => {
    const fetchJobdesk = async () => {
      try {
        setLoading(true);
        // First get jabatan ID by name
        const jabatanRes = await fetch(`${API_URL}/master/jabatan`, { headers: getHeaders() });
        const jabatanData = await jabatanRes.json();
        
        if (jabatanData.success && jabatanData.data) {
          const jabatan = jabatanData.data.find((j: any) => 
            j.nama_jabatan?.toLowerCase().includes(jabatanName.toLowerCase())
          );
          
          if (jabatan) {
            // Fetch jobdesk for this jabatan
            const jobdeskRes = await fetch(`${API_URL}/crud/jobdesc?jabatan_id=${jabatan.id_jabatan}`, { 
              headers: getHeaders() 
            });
            const jobdeskData = await jobdeskRes.json();
            
            if (jobdeskData.success && jobdeskData.data?.data?.length > 0) {
              setJobdesk(jobdeskData.data.data[0]);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching jobdesk:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobdesk();
  }, [jabatanName]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!jobdesk) {
    return null; // Don't show panel if no jobdesk
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div 
        className={`${colors.header} p-4 cursor-pointer`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{title || `Job Description ${jabatanName}`}</h3>
              <p className="text-white/70 text-sm">Tugas & Tanggung Jawab</p>
            </div>
          </div>
          <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-white" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Content - Always show description, expand for more */}
      <div className="p-5">
        {/* Deskripsi */}
        <div className={`${colors.bg} rounded-xl p-4 border ${colors.border}`}>
          <div 
            className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: jobdesk.deskripsi || '<em>Tidak ada deskripsi.</em>' }}
          />
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className="mt-4 space-y-4 animate-in slide-in-from-top duration-200">
            {/* Tanggung Jawab */}
            {jobdesk.tanggung_jawab && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className={`w-4 h-4 ${colors.icon}`} />
                  <h4 className="text-sm font-bold text-gray-900">Tanggung Jawab Utama</h4>
                </div>
                <div 
                  className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 prose prose-sm max-w-none prose-li:my-0.5"
                  dangerouslySetInnerHTML={{ __html: jobdesk.tanggung_jawab }}
                />
              </div>
            )}

            {/* Wewenang */}
            {jobdesk.wewenang && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className={`w-4 h-4 ${colors.icon}`} />
                  <h4 className="text-sm font-bold text-gray-900">Wewenang / Otoritas</h4>
                </div>
                <div 
                  className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 prose prose-sm max-w-none prose-li:my-0.5"
                  dangerouslySetInnerHTML={{ __html: jobdesk.wewenang }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
