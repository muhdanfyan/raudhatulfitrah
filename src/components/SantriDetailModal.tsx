import { useState } from 'react';
import { API_URL, TENANT_ID, getHeaders, getPublicHeaders } from '../services/api';
import { X, User, Award, AlertTriangle, Calendar, BookOpen, MapPin, GraduationCap, Target, Sparkles, Clock, CheckCircle, ExternalLink } from 'lucide-react';
import { Santri, Tahfidz, Portofolio, Presensi, Sanksi } from '../types/santri';
import { getStudentPhotoUrl } from '../utils/imageUtils';

interface SantriDetailModalProps {
  santri: Santri;
  onClose: () => void;
  achievements: {
    tahfidz: Tahfidz[];
    portofolio: Portofolio[];
  };
  discipline: {
    presensi: Presensi[];
    sanksi: Sanksi[];
  };
}

export default function SantriDetailModal({ santri, onClose, achievements, discipline }: SantriDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'profil' | 'pencapaian' | 'kedisiplinan'>('profil');

  const getFotoUrl = () => {
    if (!santri.foto_santri) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(santri.nama_lengkap_santri)}&background=6366f1&color=fff&size=200`;
    }
    return getStudentPhotoUrl(santri.foto_santri, `https://ui-avatars.com/api/?name=${encodeURIComponent(santri.nama_lengkap_santri)}&background=6366f1&color=fff&size=200`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Mondok': return 'from-green-500 to-emerald-600';
      case 'Alumni': return 'from-blue-500 to-indigo-600';
      case 'Mengabdi': return 'from-purple-500 to-violet-600';
      case 'Keluar': return 'from-red-500 to-rose-600';
      case 'Daftar': return 'from-yellow-500 to-amber-600';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Mondok': return 'bg-green-100 text-green-800 border-green-200';
      case 'Alumni': return 'bg-primary/10 text-primary-dark border-blue-200';
      case 'Mengabdi': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Keluar': return 'bg-red-100 text-red-800 border-red-200';
      case 'Daftar': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNilaiColor = (nilai: string) => {
    if (nilai === 'Mumtaz' || nilai === 'Jayyid Jiddan') return 'bg-green-100 text-green-700';
    if (nilai === 'Jayyid') return 'bg-primary/10 text-primary-dark';
    if (nilai === 'Maqbul') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getStatusTahfidzColor = (status: string) => {
    if (status === 'Hafalan Baru') return 'bg-emerald-100 text-emerald-700';
    if (status === 'Murojaah') return 'bg-primary/10 text-primary-dark';
    return 'bg-purple-100 text-purple-700';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all"
          style={{ animation: 'modalSlideIn 0.3s ease-out' }}
        >
          {/* Header dengan Gradient dan Foto */}
          <div className={`relative h-48 bg-gradient-to-br ${getStatusColor(santri.status_santri)}`}>
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="santri-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="2" fill="white"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#santri-pattern)"/>
              </svg>
            </div>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Foto dan Info Dasar */}
            <div className="absolute -bottom-16 left-6 flex items-end gap-4">
              <div className="relative">
                <img
                  src={getFotoUrl()}
                  alt={santri.nama_lengkap_santri}
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-xl bg-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(santri.nama_lengkap_santri)}&background=6366f1&color=fff&size=200`;
                  }}
                />
                {santri.musyrif === 1 && (
                  <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1.5 shadow-lg">
                    <Sparkles className="w-4 h-4 text-yellow-900" />
                  </div>
                )}
              </div>
              <div className="mb-4 text-white">
                <h2 className="text-2xl font-bold drop-shadow-lg">{santri.nama_lengkap_santri}</h2>
                <p className="text-white/90 text-sm">"{santri.nama_panggilan_santri || santri.nama_lengkap_santri.split(' ')[0]}"</p>
              </div>
            </div>

            {/* Badge Status */}
            <div className="absolute top-4 left-6">
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusBadgeColor(santri.status_santri)} shadow-sm`}>
                {santri.status_santri}
              </span>
            </div>
          </div>

          {/* Content Area */}
          <div className="pt-20 px-6 pb-6 max-h-[calc(100vh-250px)] overflow-y-auto">
            {/* Quick Stats */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full text-sm">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span className="text-indigo-700 font-medium">{santri.angkatan_nama || `Angkatan ${santri.angkatan_santri}`}</span>
              </div>
              {santri.konsentrasi_nama && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-full text-sm">
                  <Target className="w-4 h-4 text-purple-600" />
                  <span className="text-purple-700 font-medium">{santri.konsentrasi_nama}</span>
                </div>
              )}
              {santri.asal_daerah_santri && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full text-sm">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">{santri.asal_daerah_santri}</span>
                </div>
              )}
              {santri.musyrif === 1 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 rounded-full text-sm">
                  <Sparkles className="w-4 h-4 text-yellow-600" />
                  <span className="text-yellow-700 font-medium">Musyrif</span>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-1">
                {[
                  { key: 'profil', label: 'Profil', icon: User },
                  { key: 'pencapaian', label: 'Pencapaian', icon: Award },
                  { key: 'kedisiplinan', label: 'Kedisiplinan', icon: AlertTriangle },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`${
                      activeTab === tab.key
                        ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    } flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm rounded-t-lg transition-all`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-4">
              {activeTab === 'profil' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Informasi Pribadi */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Informasi Pribadi
                    </h4>
                    <dl className="space-y-3 text-sm">
                      {[
                        { label: 'Nama Panggilan', value: santri.nama_panggilan_santri },
                        { label: 'TTL', value: `${santri.tempat_lahir_santri || '-'}, ${santri.tanggal_lahir_santri || '-'}` },
                        { label: 'Asal Daerah', value: santri.asal_daerah_santri },
                        { label: 'Domisili', value: santri.kota_domisili_sekarang_santri },
                        { label: 'Kondisi Keluarga', value: santri.kondisi_keluarga_santri },
                        { label: 'Anak Ke / Saudara', value: `${santri.anak_ke_santri || '-'} / ${santri.jumlah_saudara_santri || '-'}` },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-1 border-b border-blue-100/50 last:border-0">
                          <dt className="text-gray-500">{item.label}</dt>
                          <dd className="font-medium text-gray-900">{item.value || '-'}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  {/* Informasi Akademik */}
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-5 border border-purple-100">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-purple-600" />
                      Informasi Akademik
                    </h4>
                    <dl className="space-y-3 text-sm">
                      {[
                        { label: 'Angkatan', value: santri.angkatan_nama || santri.angkatan_santri },
                        { label: 'Konsentrasi', value: santri.konsentrasi_nama },
                        { label: 'Hafalan Quran', value: santri.hafalan_quran_santri },
                        { label: 'Skill/Kelebihan', value: santri.skill_kelebihan_santri },
                        { label: 'Status Musyrif', value: santri.musyrif ? 'Ya' : 'Tidak' },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-1 border-b border-purple-100/50 last:border-0">
                          <dt className="text-gray-500">{item.label}</dt>
                          <dd className="font-medium text-gray-900">{item.value || '-'}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  {/* Motivasi & Target */}
                  {(santri.alasan_mendaftar || santri.target) && (
                    <div className="md:col-span-2 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-amber-600" />
                        Motivasi & Target
                      </h4>
                      <div className="space-y-4">
                        {santri.alasan_mendaftar && (
                          <div>
                            <dt className="text-sm text-gray-500 mb-2">Alasan Mendaftar</dt>
                            <dd className="text-gray-900 bg-white/60 p-3 rounded-lg border border-amber-100">{santri.alasan_mendaftar}</dd>
                          </div>
                        )}
                        {santri.target && (
                          <div>
                            <dt className="text-sm text-gray-500 mb-2">Target</dt>
                            <dd className="text-gray-900 bg-white/60 p-3 rounded-lg border border-amber-100">{santri.target}</dd>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'pencapaian' && (
                <div className="space-y-6">
                  {/* Tahfidz */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-emerald-600" />
                      Riwayat Tahfidz
                      <span className="ml-auto text-xs bg-emerald-200 text-emerald-800 px-2 py-1 rounded-full">
                        {achievements.tahfidz.length} setoran
                      </span>
                    </h4>
                    {achievements.tahfidz.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p>Belum ada data tahfidz</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {achievements.tahfidz.slice(0, 10).map((item) => (
                          <div key={item.id_tahfidz} className="bg-white/70 rounded-lg p-3 border border-emerald-100 hover:shadow-md transition-all">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900">{item.surah}</span>
                                  <span className="text-xs text-gray-500">Ayat {item.ayat}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <Clock className="w-3 h-3" />
                                  {item.tgl_tahfidz}
                                  <span className="text-gray-300">|</span>
                                  {item.juz_hafalan}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusTahfidzColor(item.status)}`}>
                                  {item.status}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getNilaiColor(item.nilai)}`}>
                                  {item.nilai}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Portfolio */}
                  <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-5 border border-violet-100">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-violet-600" />
                      Portfolio
                      <span className="ml-auto text-xs bg-violet-200 text-violet-800 px-2 py-1 rounded-full">
                        {achievements.portofolio.length} karya
                      </span>
                    </h4>
                    {achievements.portofolio.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Award className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p>Belum ada portfolio</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {achievements.portofolio.map((item) => (
                          <div key={item.id_portofolio} className="bg-white/70 rounded-lg p-4 border border-violet-100 hover:shadow-md transition-all group">
                            <h5 className="font-medium text-gray-900 mb-2">{item.nama_portofolio}</h5>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{item.deskripsi}</p>
                            {item.demo_link && (
                              <a 
                                href={item.demo_link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center gap-1 text-sm text-violet-600 hover:text-violet-800 font-medium"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Lihat Demo
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'kedisiplinan' && (
                <div className="space-y-6">
                  {/* Riwayat Presensi */}
                  <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-5 border border-sky-100">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-sky-600" />
                      Riwayat Presensi
                      <span className="ml-auto text-xs bg-sky-200 text-sky-800 px-2 py-1 rounded-full">
                        {discipline.presensi.length} kehadiran
                      </span>
                    </h4>
                    {discipline.presensi.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p>Belum ada data presensi</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {discipline.presensi.slice(0, 15).map((item) => (
                          <div key={item.id_presensi} className="flex items-center justify-between bg-white/70 rounded-lg px-4 py-2 border border-sky-100">
                            <div className="flex items-center gap-3">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="font-medium text-gray-900">{item.agenda}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <span>{item.tanggal}</span>
                              <span className="text-sky-600 font-medium">{item.waktu}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Catatan Pelanggaran */}
                  <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-5 border border-red-100">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-red-700">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      Catatan Pelanggaran
                      <span className="ml-auto text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">
                        {discipline.sanksi.length} sanksi
                      </span>
                    </h4>
                    {discipline.sanksi.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <p className="text-green-700 font-medium">Tidak ada pelanggaran</p>
                        <p className="text-sm text-gray-500">Santri ini memiliki catatan disiplin yang baik</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {discipline.sanksi.map((item) => (
                          <div key={item.id_sanksi} className="bg-white/70 border border-red-100 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium text-red-800">{item.deskripsi_sanksi}</h5>
                                <p className="text-sm text-red-600 mt-1">
                                  Status: <span className="font-medium">{item.status_sanksi}</span>
                                </p>
                              </div>
                              <span className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded">{item.created_at}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Animation keyframes */}
      <style>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
