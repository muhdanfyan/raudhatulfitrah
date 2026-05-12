import { useState, useEffect } from 'react';
import { ArrowLeft, GraduationCap, Loader2, FileText, Briefcase, Calendar, PenTool } from 'lucide-react';
import { API_URL, getHeaders } from '../../services/api';
import { Link } from 'react-router-dom';



interface AkademikData {
  reviews: any[];
  portfolios: any[];
  dailys: any[];
  tulisans: any[];
  stats: {
    total_review: number;
    total_portfolio: number;
    total_daily: number;
    total_tulisan: number;
  };
}

export default function OrtuAkademikPage() {
  const [data, setData] = useState<AkademikData | null>(null);
  const [activeTab, setActiveTab] = useState<'review' | 'portfolio' | 'daily' | 'tulisan'>('review');
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/ortu/akademik`, {
        headers: getHeaders()
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { 
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const tabs = [
    { key: 'review', label: 'Review', icon: FileText },
    { key: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { key: 'daily', label: 'Daily', icon: Calendar },
    { key: 'tulisan', label: 'Tulisan', icon: PenTool },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-gray-500">Data tidak tersedia</div>
    );
  }

  const renderList = () => {
    let items: any[] = [];
    let emptyText = '';

    switch (activeTab) {
      case 'review':
        items = data.reviews;
        emptyText = 'Belum ada review';
        break;
      case 'portfolio':
        items = data.portfolios;
        emptyText = 'Belum ada portfolio';
        break;
      case 'daily':
        items = data.dailys;
        emptyText = 'Belum ada daily report';
        break;
      case 'tulisan':
        items = data.tulisans;
        emptyText = 'Belum ada tulisan';
        break;
    }

    if (items.length === 0) {
      return (
        <div className="p-8 text-center text-gray-500">
          <GraduationCap className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p>{emptyText}</p>
        </div>
      );
    }

    return (
      <div className="divide-y divide-gray-100">
        {items.map((item, idx) => (
          <div key={idx} className="p-4">
            {activeTab === 'review' && (
              <>
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-900">{item.judul_review || 'Review'}</h4>
                  <span className="text-xs text-gray-500">{formatDate(item.created_at)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{item.deskripsi}</p>
                {item.video_link && (
                  <a href={item.video_link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1 inline-block">Video Link</a>
                )}
              </>
            )}
            {activeTab === 'portfolio' && (
              <>
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-900">{item.nama_portofolio || 'Portfolio'}</h4>
                  <span className="text-xs text-gray-500">{formatDate(item.created_at)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{item.deskripsi}</p>
                {item.demo_link && (
                  <a href={item.demo_link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1 inline-block">Demo Link</a>
                )}
              </>
            )}
            {activeTab === 'daily' && (
              <>
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-900">{formatDate(item.tgl_daily)}</h4>
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.status === 'Selesai' ? 'bg-green-100 text-green-700' :
                    item.status === 'Tidak selesai' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{item.status || 'Pending'}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{item.target_daily}</p>
                {item.kendala && (
                  <p className="text-xs text-red-500 mt-1">Kendala: {item.kendala}</p>
                )}
              </>
            )}
            {activeTab === 'tulisan' && (
              <>
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-900">{item.title || 'Tulisan'}</h4>
                  <span className="text-xs text-gray-500">{formatDate(item.created_at)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-3">{item.content}</p>
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/ortu" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Akademik</h1>
          <p className="text-sm text-gray-500">Review, portfolio, & tulisan</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-center">
          <p className="text-xl font-bold text-purple-600">{data.stats.total_review}</p>
          <p className="text-xs text-gray-500">Review</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-center">
          <p className="text-xl font-bold text-primary">{data.stats.total_portfolio}</p>
          <p className="text-xs text-gray-500">Portfolio</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-center">
          <p className="text-xl font-bold text-green-600">{data.stats.total_daily}</p>
          <p className="text-xs text-gray-500">Daily</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-center">
          <p className="text-xl font-bold text-orange-600">{data.stats.total_tulisan}</p>
          <p className="text-xs text-gray-500">Tulisan</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
        {renderList()}
      </div>
    </div>
  );
}
