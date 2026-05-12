import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

// Helper to get Cloudinary optimized URL
const getCloudinaryUrl = (url: string | null, width = 400, height = 160) => {
  if (!url) return null;
  if (url.includes('res.cloudinary.com')) {
    return url.replace('/upload/', `/upload/c_fill,w_${width},h_${height},q_auto,f_auto/`);
  }
  return url;
};

interface Course {
  id_course: number;
  judul: string;
  deskripsi: string;
  thumbnail_url: string | null;
  durasi_menit: number;
  materi_count: number;
  quiz_count: number;
  is_enrolled: boolean;
  enrollment_status: string | null;
  progress_percent: number;
}

const SantriLmsPage: React.FC = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'enrolled' | 'catalog'>('enrolled');

  useEffect(() => {
    if (user?.santri_id) {
      fetchCourses();
    }
  }, [user?.santri_id]);

  const fetchCourses = async () => {
    try {
      const res = await api.get(`/santri-feature/lms/${user?.santri_id}/courses`);
      // res is already the parsed JSON: {success: true, data: {enrolled: [], available: []}}
      const data = res.data || res;
      setEnrolledCourses(data.enrolled || []);
      setAvailableCourses(data.available || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: number) => {
    try {
      await api.post(`/santri-feature/lms/${user?.santri_id}/courses/${courseId}/enroll`);
      fetchCourses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal enroll');
    }
  };

  const getStatusBadge = (status: string | null, progress: number) => {
    if (status === 'completed') return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Selesai</span>;
    if (status === 'in_progress') return <span className="px-2 py-1 bg-primary/10 text-primary-dark rounded-full text-xs">{progress}%</span>;
    return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Baru</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to="/" className="text-white/80 hover:text-white mb-2 inline-block">&larr; Dashboard</Link>
            <h1 className="text-3xl font-bold text-white">Learning Center</h1>
            <p className="text-white/80">Pelajari materi dan kerjakan quiz</p>
          </div>
          <Link
            to="/roadmap"
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            🗺️ Learning Roadmap
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 text-white">
            <p className="text-3xl font-bold">{enrolledCourses.length}</p>
            <p className="text-sm opacity-80">Course Terdaftar</p>
          </div>
          <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 text-white">
            <p className="text-3xl font-bold">{enrolledCourses.filter(c => c.enrollment_status === 'in_progress').length}</p>
            <p className="text-sm opacity-80">Sedang Berjalan</p>
          </div>
          <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 text-white">
            <p className="text-3xl font-bold">{enrolledCourses.filter(c => c.enrollment_status === 'completed').length}</p>
            <p className="text-sm opacity-80">Selesai</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('enrolled')}
            className={`px-6 py-2 rounded-full font-medium transition ${activeTab === 'enrolled' ? 'bg-white text-purple-600' : 'bg-white/20 text-white hover:bg-white/30'}`}
          >
            Course Saya ({enrolledCourses.length})
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-6 py-2 rounded-full font-medium transition ${activeTab === 'catalog' ? 'bg-white text-purple-600' : 'bg-white/20 text-white hover:bg-white/30'}`}
          >
            Katalog ({availableCourses.length})
          </button>
        </div>

        {/* Enrolled Courses */}
        {activeTab === 'enrolled' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map(course => (
              <Link
                key={course.id_course}
                to={`/santri/lms/course/${course.id_course}`}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
              >
                <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                  {course.thumbnail_url && <img src={getCloudinaryUrl(course.thumbnail_url) || ''} alt="" className="w-full h-full object-cover" />}
                  <div className="absolute top-2 right-2">{getStatusBadge(course.enrollment_status, course.progress_percent)}</div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-1">{course.judul}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{course.deskripsi}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{course.materi_count} Materi</span>
                    <span>{course.quiz_count} Quiz</span>
                  </div>
                  {course.enrollment_status !== 'enrolled' && (
                    <div className="mt-3">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${course.progress_percent}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
            {enrolledCourses.length === 0 && (
              <div className="col-span-full text-center py-12 text-white/80">
                <p className="text-lg mb-2">Belum ada course terdaftar</p>
                <button onClick={() => setActiveTab('catalog')} className="text-white underline">Lihat Katalog</button>
              </div>
            )}
          </div>
        )}

        {/* Available Courses */}
        {activeTab === 'catalog' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map(course => (
              <div key={course.id_course} className="bg-white rounded-xl overflow-hidden shadow-lg">
                <div className="h-32 bg-gradient-to-r from-green-500 to-teal-600">
                  {course.thumbnail_url && <img src={getCloudinaryUrl(course.thumbnail_url) || ''} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-1">{course.judul}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{course.deskripsi}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <span>{course.materi_count} Materi</span>
                    <span>{course.quiz_count} Quiz</span>
                    <span>{course.durasi_menit} menit</span>
                  </div>
                  <button
                    onClick={() => handleEnroll(course.id_course)}
                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-2 rounded-lg font-medium hover:opacity-90"
                  >
                    Daftar Course
                  </button>
                </div>
              </div>
            ))}
            {availableCourses.length === 0 && (
              <div className="col-span-full text-center py-12 text-white/80">
                <p>Semua course sudah terdaftar</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SantriLmsPage;
