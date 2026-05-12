import React from 'react'; // eslint-disable-line no-unused-vars
import { BookOpen, Users, Plus, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Course {
  id_course: number;
  judul: string;
  status: string;
  materi_count: number;
  enrollments_count: number;
  konsentrasi_relasi?: { nama_konsentrasi: string };
}

interface MentorCoursesPanelProps {
  courses: Course[];
  title?: string;
}

export default function MentorCoursesPanel({ 
  courses = [], 
  title = 'Course Saya' 
}: MentorCoursesPanelProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">{title}</h2>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{courses.length} Materi Kursus</p>
          </div>
        </div>
        <Link to="/lms/courses" className="text-xs text-blue-600 font-bold hover:underline">Lihat Semua</Link>
      </div>

      <div className="p-4 space-y-3 overflow-y-auto max-h-[400px]">
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-3 text-gray-200">
              <Layers className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium text-gray-400 mb-4">Belum ada course</p>
            <Link 
              to="/lms/courses/new" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-xs font-bold transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Buat Course
            </Link>
          </div>
        ) : (
          courses.slice(0, 5).map((course) => (
            <Link 
              key={course.id_course} 
              to={`/lms/courses/${course.id_course}`}
              className="block p-4 rounded-xl bg-gradient-to-br from-blue-50/50 to-white border border-blue-100/50 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-sm group-hover:text-blue-700 transition-colors truncate">
                    {course.judul}
                  </h4>
                  <p className="text-[10px] text-blue-600 font-extrabold uppercase tracking-widest mt-1">
                    {course.konsentrasi_relasi?.nama_konsentrasi || 'Umum'}
                  </p>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter shadow-sm ${
                  course.status === 'published' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {course.status}
                </span>
              </div>
              <div className="flex gap-4 mt-3 pt-3 border-t border-blue-100/30">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase">
                  <Layers className="w-3 h-3" /> {course.materi_count} Materi
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase">
                  <Users className="w-3 h-3" /> {course.enrollments_count} Santri
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
