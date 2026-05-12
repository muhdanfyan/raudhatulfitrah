import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

// Helper to extract YouTube video ID
const getYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Helper to get optimized thumbnail URL (with YouTube fallback)
const getThumbnailUrl = (course: Course, width = 400, height = 160) => {
  const url = course.thumbnail_url || course.thumbnail;
  
  // 1. If has image thumbnail, use it
  if (url) {
    if (url.includes('res.cloudinary.com')) {
      return url.replace('/upload/', `/upload/c_fill,w_${width},h_${height},q_auto,f_auto/`);
    }
    return url;
  }
  
  // 2. Fallback to YouTube thumbnail if video_url exists
  if (course.video_url) {
    const videoId = getYouTubeVideoId(course.video_url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
  }
  
  return null;
};

interface Course {
  id_course: number;
  judul: string;
  deskripsi: string;
  thumbnail_url: string | null;
  thumbnail: string | null;
  video_url?: string | null;
  status: 'draft' | 'published' | 'archived';
  durasi_menit: number;
  materi_count: number;
  quiz_count: number;
  enrolled_count: number;
  enrollments_count: number;
  konsentrasi_relasi?: {
    id_konsentrasi: number;
    nama_konsentrasi: string;
  };
}

const LmsCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', search: '' });

  useEffect(() => {
    fetchCourses();
  }, [filter]);

  const fetchCourses = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.search) params.append('search', filter.search);
      
      const res = await api.get(`/lms/courses?${params.toString()}`);
      // Response: { success: true, data: { data: [...], current_page, ... } }
      // Paginated response has data.data for items
      const items = res.data?.data || res.data || [];
      setCourses(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Fetch courses error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin hapus course ini? Semua materi dan quiz akan ikut terhapus.')) return;
    try {
      await api.delete(`/lms/courses/${id}`);
      fetchCourses();
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus course');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-red-100 text-red-800'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>{status}</span>;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">LMS - Kelola Courses</h1>
          <p className="text-gray-600 text-sm mt-1">
            Buat course berdasarkan{' '}
            <Link to="/roadmap" className="text-primary hover:underline">
              Learning Roadmap →
            </Link>
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/roadmap"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            🗺️ Roadmap
          </Link>
          <Link
            to="/lms/courses/new"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Tambah Course
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Cari judul..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          className="border rounded-lg px-3 py-2 w-64"
        />
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">Semua Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course.id_course} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="h-40 bg-gradient-to-r from-blue-500 to-purple-600 relative">
              {getThumbnailUrl(course) ? (
                <img 
                  src={getThumbnailUrl(course)!} 
                  alt={course.judul} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/50">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              )}
              <div className="absolute top-2 right-2">{getStatusBadge(course.status)}</div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">{course.judul}</h3>
              {course.deskripsi ? (
                <div 
                  className="text-gray-600 text-sm line-clamp-2 mb-3 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: course.deskripsi }}
                />
              ) : (
                <p className="text-gray-400 text-sm italic mb-3">Tidak ada deskripsi</p>
              )}
              <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <span className="text-primary-light">📚</span> {course.materi_count || 0} Materi
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-purple-500">📝</span> {course.quiz_count || 0} Quiz
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-green-500">👥</span> {course.enrolled_count || course.enrollments_count || 0} Santri
                </span>
              </div>
              {course.konsentrasi_relasi && (
                <p className="text-xs text-gray-400 mb-3">
                  🏷️ {course.konsentrasi_relasi.nama_konsentrasi}
                </p>
              )}
              <div className="flex gap-2">
                <Link
                  to={`/lms/courses/${course.id_course}/edit`}
                  className="flex-1 bg-primary text-white text-center py-2 rounded hover:bg-primary-dark text-sm"
                >
                  Kelola
                </Link>
                <button
                  onClick={() => handleDelete(course.id_course)}
                  className="px-3 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
        {courses.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <p className="mb-4">Belum ada course.</p>
            <Link to="/lms/courses/new" className="text-primary hover:underline">
              Buat course pertama &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default LmsCoursesPage;
