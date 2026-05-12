import { useState, useEffect } from 'react';
import { 
  GraduationCap, FileText, Briefcase, BookOpen, PenTool, 
  ChevronLeft, Loader2, Calendar, ExternalLink, TrendingUp
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { API_URL, getHeaders } from '../../services/api';


export default function SantriAkademikPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (user?.santri_id) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/santri-feature/akademik/${user?.santri_id}`, {
        headers: getHeaders()
      });
      const json = await res.json();
      setData(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const pekan = data?.pekan_ini || {};
  const total = data?.total || {};

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/" className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <GraduationCap className="w-7 h-7" />
              Laporan Akademik
            </h1>
            <p className="text-blue-100 text-sm">Ringkasan pencapaian akademik Anda</p>
          </div>
        </div>

        <p className="text-sm text-blue-100 mb-4">
          <Calendar className="w-4 h-4 inline mr-1" />
          Periode Pekan: {data?.periode_pekan?.start} s/d {data?.periode_pekan?.end}
        </p>

        {/* Pencapaian Pekan Ini */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/santri/review" className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/25 transition-colors">
            <FileText className="w-8 h-8 mx-auto mb-2" />
            <div className="text-3xl font-bold">{pekan.review || 0}</div>
            <div className="text-xs text-blue-100">Review Pekan Ini</div>
          </Link>
          <Link to="/santri/portfolio" className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/25 transition-colors">
            <Briefcase className="w-8 h-8 mx-auto mb-2" />
            <div className="text-3xl font-bold">{pekan.portfolio || 0}</div>
            <div className="text-xs text-blue-100">Portfolio Pekan Ini</div>
          </Link>
          <Link to="/santri/tahfidz" className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/25 transition-colors">
            <BookOpen className="w-8 h-8 mx-auto mb-2" />
            <div className="text-3xl font-bold">{pekan.hafalan || 0}</div>
            <div className="text-xs text-blue-100">Hafalan Pekan Ini</div>
          </Link>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center">
            <PenTool className="w-8 h-8 mx-auto mb-2" />
            <div className="text-3xl font-bold">{pekan.tulisan || 0}</div>
            <div className="text-xs text-blue-100">Tulisan Pekan Ini</div>
          </div>
        </div>
      </div>

      {/* Total Pencapaian */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Total Pencapaian
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-primary/5 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-primary-dark">{total.review || 0}</div>
            <div className="text-sm text-gray-600">Total Review</div>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-emerald-700">{total.portfolio || 0}</div>
            <div className="text-sm text-gray-600">Total Portfolio</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-amber-700">{total.hafalan || 0}</div>
            <div className="text-sm text-gray-600">Total Hafalan</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-purple-700">{total.tulisan || 0}</div>
            <div className="text-sm text-gray-600">Total Tulisan</div>
          </div>
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Review Terbaru</h2>
          <Link to="/santri/review" className="text-sm text-primary hover:underline">Lihat Semua</Link>
        </div>
        <div className="space-y-3">
          {data?.recent_reviews?.map((item: any, i: number) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{item.judul_review}</div>
                <div className="text-xs text-gray-500">{item.jenis_review} • {formatDate(item.created_at)}</div>
              </div>
            </div>
          ))}
          {(!data?.recent_reviews || data.recent_reviews.length === 0) && (
            <p className="text-gray-500 text-center py-4">Belum ada review</p>
          )}
        </div>
      </div>

      {/* Recent Portfolios */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Portfolio Terbaru</h2>
          <Link to="/santri/portfolio" className="text-sm text-primary hover:underline">Lihat Semua</Link>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {data?.recent_portfolios?.map((item: any, i: number) => (
            <div key={i} className="p-4 bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-cyan-600 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">{item.nama_portofolio}</div>
                  {item.techstack && (
                    <div className="text-xs text-gray-500 mt-1">{item.techstack}</div>
                  )}
                  {item.demo_link && (
                    <a href={item.demo_link} target="_blank" rel="noopener noreferrer" 
                       className="inline-flex items-center gap-1 text-xs text-cyan-600 mt-2 hover:underline">
                      <ExternalLink className="w-3 h-3" /> Demo
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
          {(!data?.recent_portfolios || data.recent_portfolios.length === 0) && (
            <p className="text-gray-500 text-center py-4 col-span-2">Belum ada portfolio</p>
          )}
        </div>
      </div>

      {/* Recent Tulisan */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Tulisan Terbaru</h2>
        <div className="space-y-3">
          {data?.recent_tulisan?.map((item: any, i: number) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <PenTool className="w-5 h-5 text-purple-600 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{item.judul}</div>
                <div className="text-xs text-gray-500">{formatDate(item.created_at)}</div>
              </div>
            </div>
          ))}
          {(!data?.recent_tulisan || data.recent_tulisan.length === 0) && (
            <p className="text-gray-500 text-center py-4">Belum ada tulisan</p>
          )}
        </div>
      </div>
    </div>
  );
}
