import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Users, Video, Calendar, Plus, ExternalLink, Loader2 } from 'lucide-react';
import StatCard from '../components/StatCard';
import { Link } from 'react-router-dom';
import { API_URL, getHeaders } from '../services/api';

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

interface Course {
  id_course: number;
  judul: string;
  status: string;
  materi_count: number;
  enrollments_count: number;
  konsentrasi_relasi?: { nama_konsentrasi: string };
}

interface DashboardData {
  total_courses: number;
  published_courses: number;
  total_enrollments: number;
  completed_enrollments: number;
  completion_rate: number;
  upcoming_live: LiveClass[];
  konsentrasi: { id_konsentrasi: number; nama_konsentrasi: string }[];
}

export default function MentorDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const dashRes = await fetch(`${API_URL}/mentor/dashboard`, {
        headers: getHeaders()
      });
      const dashData = await dashRes.json();
      if (dashData.success) {
        setData(dashData.data);
      }

      // Fetch my courses
      const coursesRes = await fetch(`${API_URL}/mentor/my-courses`, {
        headers: getHeaders()
      });
      const coursesData = await coursesRes.json();
      if (coursesData.success) {
        setCourses(coursesData.data || []);
      }

    } catch (err: any) {
      setError(err.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  const stats = [
    { title: 'Total Courses', value: data?.total_courses || 0, icon: BookOpen, color: 'blue' },
    { title: 'Published', value: data?.published_courses || 0, icon: BookOpen, color: 'emerald' },
    { title: 'Enrolled Santri', value: data?.total_enrollments || 0, icon: Users, color: 'violet' },
    { title: 'Completion Rate', value: `${data?.completion_rate || 0}%`, icon: Users, color: 'cyan' },
  ];

  const quickMenu = [
    { title: 'Buat Course', href: '/lms/courses/new', icon: '➕', desc: 'Tambah course baru' },
    { title: 'My Courses', href: '/lms/courses', icon: '📚', desc: 'Kelola course saya' },
    { title: 'Live Class', href: '/mentor/live-class', icon: '🎥', desc: 'Jadwalkan meeting' },
    { title: 'Evaluasi', href: '/lms/evaluasi/grading', icon: '✅', desc: 'Review submission' },
  ];

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Mentor</h1>
        <p className="text-gray-600">Kelola course dan pantau progress santri</p>
      </div>

      {/* Konsentrasi Badge */}
      {data?.konsentrasi && data.konsentrasi.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">Bidang Anda:</span>
          {data.konsentrasi.map((k) => (
            <span key={k.id_konsentrasi} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              {k.nama_konsentrasi}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Menu */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickMenu.map((menu, index) => (
          <Link
            key={index}
            to={menu.href}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition group"
          >
            <div className="text-3xl mb-2">{menu.icon}</div>
            <h3 className="font-semibold text-gray-900 group-hover:text-primary">{menu.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{menu.desc}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Live Classes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Video className="w-5 h-5 text-red-500" />
              Live Class Mendatang
            </h2>
            <Link to="/mentor/live-class" className="text-sm text-primary hover:underline flex items-center gap-1">
              <Plus className="w-4 h-4" /> Tambah
            </Link>
          </div>
          <div className="space-y-3">
            {(!data?.upcoming_live || data.upcoming_live.length === 0) ? (
              <p className="text-gray-500 text-sm text-center py-4">Belum ada jadwal live class</p>
            ) : (
              data.upcoming_live.map((live) => (
                <div key={live.id_live} className="p-3 rounded-lg bg-gradient-to-r from-red-50 to-orange-50 border border-red-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{live.judul}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {formatDate(live.jadwal_mulai)} • {live.durasi_menit} menit
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      live.platform === 'zoom' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {live.platform === 'zoom' ? 'Zoom' : 'Google Meet'}
                    </span>
                  </div>
                  {live.meeting_link && (
                    <a 
                      href={live.meeting_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" /> Buka Link
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Courses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Course Saya
            </h2>
            <Link to="/lms/courses" className="text-sm text-primary hover:underline">Lihat Semua →</Link>
          </div>
          <div className="space-y-3">
            {courses.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm mb-3">Belum ada course</p>
                <Link 
                  to="/lms/courses/new" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4" /> Buat Course
                </Link>
              </div>
            ) : (
              courses.slice(0, 5).map((course) => (
                <Link 
                  key={course.id_course} 
                  to={`/lms/courses/${course.id_course}`}
                  className="block p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{course.judul}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {course.konsentrasi_relasi?.nama_konsentrasi || 'Umum'}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      course.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {course.status}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>{course.materi_count} materi</span>
                    <span>{course.enrollments_count} enrolled</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
