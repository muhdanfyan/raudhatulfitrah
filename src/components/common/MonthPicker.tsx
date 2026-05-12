import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface MonthPickerProps {
  periode: string;
  onChange: (periode: string) => void;
  dark?: boolean;
}

export default function MonthPicker({ periode, onChange, dark = false }: MonthPickerProps) {
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const monthPickerRef = useRef<HTMLDivElement>(null);

  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const years = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (monthPickerRef.current && !monthPickerRef.current.contains(event.target as Node)) {
        setShowMonthPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatPeriode = (p: string) => {
    if (!p || !p.includes('-')) return 'Pilih Periode';
    try {
      const [year, month] = p.split('-');
      const monthIdx = parseInt(month, 10) - 1;
      return `${months[monthIdx]} ${year}`;
    } catch {
      return p;
    }
  };

  const getPrevMonth = () => {
    const [y, m] = (periode || '').split('-').map(Number);
    if (!y || !m) return periode;
    const d = new Date(y, m - 2, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const getNextMonth = () => {
    const [y, m] = (periode || '').split('-').map(Number);
    if (!y || !m) return periode;
    const d = new Date(y, m, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  return (
    <div 
      className={`flex items-center gap-2 rounded-2xl p-1 border-2 relative z-[999] ${
        dark ? 'bg-slate-800 border-indigo-500/50 text-white' : 'bg-white border-blue-500/30 text-gray-800 shadow-xl'
      }`} 
      ref={monthPickerRef}
      style={{ minWidth: '240px', boxShadow: dark ? '0 0 20px rgba(59, 130, 246, 0.2)' : 'none' }}
    >
      <button 
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onChange(getPrevMonth());
        }} 
        className={`p-2.5 rounded-xl transition-all ${dark ? 'hover:bg-white/10' : 'hover:bg-blue-50 text-blue-600'}`}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <div 
        onClick={() => setShowMonthPicker(!showMonthPicker)}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 cursor-pointer rounded-xl transition-all ${
          dark ? 'hover:bg-white/10' : 'hover:bg-blue-50'
        }`}
      >
        <Calendar className="w-5 h-5 text-blue-500" />
        <span className="font-black text-sm whitespace-nowrap uppercase italic tracking-tighter">
          {formatPeriode(periode)}
        </span>
      </div>

      <button 
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onChange(getNextMonth());
        }} 
        className={`p-2.5 rounded-xl transition-all ${dark ? 'hover:bg-white/10' : 'hover:bg-blue-50 text-blue-600'}`}
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {showMonthPicker && (
        <div 
          className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[320px] bg-white rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.2)] border border-gray-100 p-6 z-[1000] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {years.map(year => (
              <div key={year} className="space-y-3">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] border-b border-blue-50 pb-2">
                  Tahun {year}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {months.map((month, idx) => {
                    const monthStr = String(idx + 1).padStart(2, '0');
                    const p = `${year}-${monthStr}`;
                    const isActive = periode === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          onChange(p);
                          setShowMonthPicker(false);
                        }}
                        className={`py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
                          isActive 
                            ? 'bg-blue-600 text-white shadow-lg' 
                            : 'bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                      >
                        {month.substring(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
