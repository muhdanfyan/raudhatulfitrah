import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Target, Check, Loader2, Moon, Sun, BookOpen, Heart, Utensils, Users } from 'lucide-react';
import { API_URL, getHeaders } from '../services/api';

interface SantriIbadah {
  id_santri: number;
  nama_lengkap_santri: string;
  foto_santri: string | null;
  witir: number;
  dhuha: number;
  rawatib: number;
  dzikir_pagipetang: number;
  murojaah: number;
  puasa_sunnah: number;
  amalan_tidur: number;
  ngajar: number;
  total: number;
}

const IBADAH_FIELDS = [
  { key: 'witir', label: 'Witir', icon: Moon, color: 'from-indigo-500 to-purple-600' },
  { key: 'dhuha', label: 'Dhuha', icon: Sun, color: 'from-amber-500 to-orange-600' },
  { key: 'rawatib', label: 'Rawatib', icon: Heart, color: 'from-pink-500 to-rose-600' },
  { key: 'dzikir_pagipetang', label: 'Dzikir', icon: BookOpen, color: 'from-emerald-500 to-teal-600' },
  { key: 'murojaah', label: 'Murojaah', icon: BookOpen, color: 'from-blue-500 to-cyan-600' },
  { key: 'puasa_sunnah', label: 'Puasa', icon: Utensils, color: 'from-violet-500 to-purple-600' },
  { key: 'amalan_tidur', label: 'Tidur', icon: Moon, color: 'from-slate-500 to-gray-600' },
  { key: 'ngajar', label: 'Ngajar', icon: Users, color: 'from-green-500 to-emerald-600' },
];

interface Props {
  maxDisplay?: number;
  showLink?: boolean;
}

export default function IbadahReportPanel({ maxDisplay = 5, showLink = true }: Props) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SantriIbadah[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const todayDate = new Date().toISOString().split('T')[0];
      const res = await fetch(`${API_URL}/santri-feature/ibadah/today?tanggal=${todayDate}`, {
        headers: getHeaders()
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch ibadah:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      </div>
    );
  }

  const totalIbadah = data.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        {showLink ? (
          <Link to="/ibadah" className="flex items-center gap-2 hover:opacity-80">
            <Target className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-gray-900">Ibadah Hari Ini</h2>
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-gray-900">Ibadah Hari Ini</h2>
          </div>
        )}
        <span className="text-sm text-emerald-600 font-medium">
          {data.length} santri
        </span>
      </div>

      {data.length > 0 ? (
        <>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {data.slice(0, maxDisplay).map((santri) => (
              <div key={santri.id_santri} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                  {santri.nama_lengkap_santri.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{santri.nama_lengkap_santri}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {IBADAH_FIELDS.map(({ key, label, color }) => {
                      const done = (santri as any)[key] === 1;
                      return done ? (
                        <span key={key} className={`inline-flex items-center gap-0.5 bg-gradient-to-r ${color} text-white px-1.5 py-0.5 rounded text-xs`}>
                          <Check className="w-2.5 h-2.5" />
                          {label}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">{santri.total}/8</p>
                </div>
              </div>
            ))}
          </div>
          
          {data.length > maxDisplay && showLink && (
            <Link 
              to="/ibadah" 
              className="block text-center text-sm text-emerald-600 hover:text-emerald-700 mt-3 py-2 border-t"
            >
              Lihat semua {data.length} santri →
            </Link>
          )}
          
          <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-gray-500">
            <span>{data.length} santri mencatat</span>
            <span>Total: {totalIbadah} ibadah</span>
          </div>
        </>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <Target className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p>Belum ada santri mencatat ibadah hari ini</p>
        </div>
      )}
    </div>
  );
}
