import React from 'react'; // eslint-disable-line no-unused-vars
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface MenuItem {
  title: string;
  href: string;
  icon: string;
  desc: string;
}

interface QuickMenuPanelProps {
  items?: MenuItem[];
  title?: string;
}

export default function QuickMenuPanel({ 
  items, 
  title = 'Menu Cepat' 
}: QuickMenuPanelProps) {
  const { user } = useAuth();
  
  // Default menus based on role if no items provided
  const getDefaultMenu = () => {
    switch (user?.role) {
      case 'akademik':
        return [
          { title: 'Tata Tertib', href: '/tatib', icon: '⚖️', desc: 'Kelola peraturan' },
          { title: 'LMS Courses', href: '/lms/courses', icon: '📚', desc: 'Kelola materi' },
          { title: 'Mentor', href: '/mentor-management', icon: '👨‍🏫', desc: 'Assign mentor' },
          { title: 'Roadmap', href: '/roadmap-admin', icon: '🗺️', desc: 'Kelola roadmap' },
        ];
      case 'mentor':
        return [
          { title: 'Buat Course', href: '/lms/courses/new', icon: '➕', desc: 'Tambah baru' },
          { title: 'My Courses', href: '/lms/courses', icon: '📚', desc: 'Kelola course' },
          { title: 'Live Class', href: '/mentor/live-class', icon: '🎥', desc: 'Jadwal meeting' },
          { title: 'Evaluasi', href: '/lms/evaluasi/grading', icon: '✅', desc: 'Grading' },
        ];
      default:
        return [
          { title: 'Data Santri', href: '/data-santri', icon: '👥', desc: 'Daftar santri' },
          { title: 'Presensi', href: '/presensi', icon: '📅', desc: 'Cek kehadiran' },
          { title: 'Keuangan', href: '/keuangan', icon: '💰', desc: 'Laporan kas' },
          { title: 'Pengaturan', href: '/settings', icon: '⚙️', desc: 'Setting sistem' },
        ];
    }
  };

  const menuItems = items || getDefaultMenu();

  return (
    <div className="bg-transparent">
      {title && <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {menuItems.map((menu, index) => (
          <Link
            key={index}
            to={menu.href}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform">{menu.icon}</div>
            <h3 className="font-bold text-gray-900 text-sm group-hover:text-primary transition-colors">{menu.title}</h3>
            <p className="text-[10px] text-gray-500 font-medium mt-1 uppercase tracking-tight line-clamp-1">{menu.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
