import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

interface Roadmap {
  id: number;
  nama: string;
  deskripsi: string;
  level: string;
  estimasi_durasi: string;
  konsentrasi_id: number;
  konsentrasi: string;
  total_sections: number;
  total_topics: number;
  estimasi_jam: number;
  kategori: string;
}

const RoadmapListPage: React.FC = () => {
  const [allRoadmaps, setAllRoadmaps] = useState<Roadmap[]>([]);
  const [filteredRoadmaps, setFilteredRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [roadmapData, statsData] = await Promise.all([
        api.getRoadmaps(),
        api.getRoadmapStats(),
      ]);
      setAllRoadmaps(roadmapData || []);
      setFilteredRoadmaps(roadmapData || []);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading roadmaps:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredRoadmaps(allRoadmaps);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredRoadmaps(allRoadmaps.filter(r => 
        (r.nama || '').toLowerCase().includes(term) || 
        (r.deskripsi || '').toLowerCase().includes(term) ||
        (r.konsentrasi || '').toLowerCase().includes(term)
      ));
    }
  }, [searchTerm, allRoadmaps]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-orange-100 text-orange-800';
      case 'Expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getKonsentrasiIcon = (nama: string) => {
    const n = nama?.toLowerCase() || '';
    if (n.includes('backend')) return '⚙️';
    if (n.includes('frontend') || n.includes('css') || n.includes('html')) return '🎨';
    if (n.includes('fullstack')) return '🔄';
    if (n.includes('multimedia') || n.includes('design')) return '🎬';
    if (n.includes('mobile') || n.includes('android') || n.includes('ios') || n.includes('kotlin') || n.includes('swift')) return '📱';
    if (n.includes('devops') || n.includes('docker') || n.includes('kubernetes')) return '🚀';
    if (n.includes('data') || n.includes('python') || n.includes('go')) return '📊';
    if (n.includes('ui') || n.includes('ux')) return '✏️';
    if (n.includes('security')) return '🔒';
    if (n.includes('game')) return '🎮';
    if (n.includes('project')) return '📝';
    return '💻';
  };

  const categories = ['Role-based', 'Skill-based', 'Best Practices', 'Project Ideas'];

  const groupedRoadmaps = categories.reduce((acc, cat) => {
    const items = filteredRoadmaps.filter(r => (r.kategori || 'Skill-based') === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {} as Record<string, Roadmap[]>);

  // Add any roadmaps that don't match standard categories to 'Skill-based' if not already categorized
  const otherRoadmaps = filteredRoadmaps.filter(r => !categories.includes(r.kategori || ''));
  if (otherRoadmaps.length > 0) {
    groupedRoadmaps['Skill-based'] = [...(groupedRoadmaps['Skill-based'] || []), ...otherRoadmaps];
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Learning Roadmap</h1>
        <p className="text-gray-600">Jalur belajar terstruktur untuk berbagai konsentrasi</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="text-3xl font-bold">{stats.total_roadmaps || 0}</div>
            <div className="text-blue-100 text-sm">Total Roadmap</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="text-3xl font-bold">{stats.total_sections || 0}</div>
            <div className="text-green-100 text-sm">Total Section</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="text-3xl font-bold">{stats.total_topics || 0}</div>
            <div className="text-purple-100 text-sm">Total Topic</div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
            <div className="text-3xl font-bold">{stats.santri_with_progress || 0}</div>
            <div className="text-orange-100 text-sm">Santri Aktif</div>
          </div>
        </div>
      )}

      {/* Search Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 sticky top-0 z-10">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Cari roadmap atau konsentrasi... (misal: Frontend, AI Agent, Python, Project)"
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Roadmap Groups */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : Object.keys(groupedRoadmaps).length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-lg font-medium text-gray-900">Belum ada roadmap</h3>
          <p className="text-gray-500">Roadmap untuk kriteria ini belum tersedia</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedRoadmaps).map(([category, items]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-4 border-b pb-2">
                <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wider">{category}</h2>
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {items.length}
                </span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((roadmap) => (
                  <Link
                    key={roadmap.id}
                    to={`/roadmap/${roadmap.id}`}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition group border border-transparent hover:border-primary/20"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-4xl">{getKonsentrasiIcon(roadmap.nama || roadmap.konsentrasi)}</div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(roadmap.level)}`}>
                          {roadmap.level || 'Beginner'}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition">
                        {roadmap.nama}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {roadmap.deskripsi}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <span>📚</span>
                          <span>{roadmap.total_sections} sections</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>📝</span>
                          <span>{roadmap.total_topics} topics</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          ⏱️ {roadmap.estimasi_durasi || `${roadmap.estimasi_jam || 0} jam`}
                        </span>
                        <span className="text-primary text-sm font-medium group-hover:underline">
                          Lihat Detail →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoadmapListPage;
