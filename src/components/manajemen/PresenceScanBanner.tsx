import React from 'react'; // eslint-disable-line no-unused-vars
import { QrCode, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PresenceScanBannerProps {
  color?: 'blue' | 'amber' | 'indigo' | 'emerald';
  title?: string;
  subtitle?: string;
}

export default function PresenceScanBanner({ 
  color = 'blue', 
  title = 'Scan QR Presensi',
  subtitle = 'Scan kartu santri untuk mencatat kehadiran'
}: PresenceScanBannerProps) {
  
  const themes = {
    blue: 'from-blue-600 to-indigo-600 shadow-blue-200/50 hover:shadow-blue-300/50',
    amber: 'from-amber-600 to-orange-600 shadow-amber-200/50 hover:shadow-amber-300/50',
    indigo: 'from-indigo-600 to-purple-600 shadow-indigo-200/50 hover:shadow-indigo-300/50',
    emerald: 'from-emerald-600 to-teal-600 shadow-emerald-200/50 hover:shadow-emerald-300/50'
  };

  const glowBg = {
    blue: 'bg-blue-400/20',
    amber: 'bg-amber-400/20',
    indigo: 'bg-indigo-400/20',
    emerald: 'bg-emerald-400/20'
  };

  return (
    <Link
      to="/presensi/scan"
      className={`block bg-gradient-to-r ${themes[color]} rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 group overflow-hidden relative border border-white/10`}
    >
      {/* Decorative circle */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-5">
          <div className={`${glowBg[color]} p-4 rounded-2xl backdrop-blur-sm border border-white/20 transform group-hover:rotate-6 transition-transform duration-300`}>
            <QrCode className="w-9 h-9 text-white group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">{title}</h3>
            <p className="text-white/80 text-sm font-medium mt-0.5">{subtitle}</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-md group-hover:translate-x-2 transition-transform shadow-inner">
          <ArrowRight className="w-6 h-6" />
        </div>
      </div>
    </Link>
  );
}
