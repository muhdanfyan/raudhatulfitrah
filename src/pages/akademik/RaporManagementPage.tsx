import { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Search, 
  ChevronLeft,
  ChevronRight,
  Printer,
  Camera,
  Award,
  Clock,
  BookOpen,
  Sparkles,
  LayoutGrid,
  List as ListIcon,
  Shield
} from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { api } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';

// DEBUG: Force visibility of the component area

interface Santri { id_santri: number; nama_lengkap_santri: string; foto_santri?: string; program_santri?: string; angkatan_santri?: string; }
interface Kuantitas {
  productive: { jam_produktif: number; hari_tracking: number; review: number; review_avg_nilai: number; portfolio: number; };
  rabbani: { hari_ibadah: number; witir: number; dhuha: number; rawatib: number; puasa_sunnah: number; dzikir: number; hafalan_baru: number; murojaah: number; tahfidz_avg_nilai: number; tahfidz_grade_score: number; tahfidz_total_setoran: number; };
  intelligent: { quiz: number; quiz_avg_score: number; course_progress: number; course_avg_progress: number; skill_progress: number; skill_avg_level: number; };
  discipline: { presensi_hadir: number; total_hari: number; sanksi: number; skor_disiplin: number; prosentase_disiplin: number; };
  ethic: { piket: number; };
}
interface Cohort { max_review: number; max_portfolio: number; avg_ziyadah: number; avg_murojaah: number; avg_tahfidz_nilai: number; max_tahfidz_total_bobot: number; }
interface RaporItem { santri: Santri; kuantitas: Kuantitas; cohort: Cohort; }

export default function RaporManagementPage() {
  const { settings } = useSettings();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RaporItem[]>([]);
  const [filteredData, setFilteredData] = useState<RaporItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [periode, setPeriode] = useState(() => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`; });
  const [periodType, setPeriodType] = useState<'monthly' | 'semester'>('monthly');
  const [semesterYear, setSemesterYear] = useState(() => new Date().getFullYear());
  const [semesterNum, setSemesterNum] = useState<1 | 2>(() => new Date().getMonth() < 6 ? 1 : 2);
  const [selectedSantri, setSelectedSantri] = useState<RaporItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [capturing, setCapturing] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);
  const primaryColor = settings?.warnaUtama || '#0f172a';
  useEffect(() => { fetchData(); }, [periode, periodType, semesterYear, semesterNum]);
  useEffect(() => {
    setFilteredData(searchQuery ? data.filter(item => item.santri.nama_lengkap_santri.toLowerCase().includes(searchQuery.toLowerCase())) : data);
    // Synchronize selectedSantri if data changes (e.g. after period change)
    if (selectedSantri && data.length > 0) {
      const updated = data.find(item => item.santri.id_santri === selectedSantri.santri.id_santri);
      if (updated) setSelectedSantri(updated);
    }
  }, [searchQuery, data]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const json = periodType === 'semester'
        ? await api.getRaporManagementSemester(semesterYear, semesterNum)
        : await api.getRaporManagementRealtime(periode);
      
      if (json.success) setData(json.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const formatPeriode = (p: string) => { const [year, month] = p.split('-'); const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']; return `${months[parseInt(month) - 1]} ${year}`; };
  const formatSemester = () => `${semesterNum === 1 ? 'Genap' : 'Ganjil'} - ${semesterYear}`;
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const getTahfidzLabel = (score: number) => {
    if (score >= 9.0) return 'Mumtaz';
    if (score >= 8.0) return 'Jayyid Jiddan';
    if (score >= 7.0) return 'Jayyid';
    if (score >= 6.0) return 'Maqbul';
    return 'Dhaif';
  };

  const handlePrint = () => {
    if (!selectedSantri) return;
    const s = selectedSantri.santri;
    const k = selectedSantri.kuantitas;
    const c = selectedSantri.cohort;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    // Use system primary color
    const pc = primaryColor;
    
    printWindow.document.write(`
      <html><head><title>Rapor PRIDE - ${s.nama_lengkap_santri}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        body { font-family: 'Inter', sans-serif; background: #f3f4f6; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
        
        .capture-container {
          width: 400px;
          aspect-ratio: 4/5;
          background: #fff;
          border-radius: 24px;
          padding: 16px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .poster-wrapper {
          width: calc(100% - 24px);
          aspect-ratio: 1/1;
          border-radius: 16px;
          padding: 3px;
          background: linear-gradient(135deg, ${pc}, ${pc}40, #e5e7eb);
          position: relative;
        }
        
        .poster-card {
          width: 100%;
          height: 100%;
          background: #f8fafc;
          border-radius: 12px;
          position: relative;
          overflow: hidden;
        }
        
        .grid-bg {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(#f3f4f6 1px, transparent 1px), linear-gradient(90deg, #f3f4f6 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        .content {
          position: relative;
          height: 100%;
          padding: 20px 20px 12px 20px;
          display: flex;
          flex-direction: column;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        
        .title-box {
          background: ${pc};
          color: white;
          padding: 8px 16px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .title-box p:first-child { font-size: 12px; font-weight: 700; line-height: 1.2; }
        .title-box p:last-child { font-size: 16px; font-weight: 900; line-height: 1.2; }
        
        .period-badge {
          background: white;
          border: 2px solid ${pc};
          color: ${pc};
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .main-area {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        
        .stat-column {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 68px;
          flex-shrink: 0;
        }
        
        .stat-bubble {
          background: white;
          border: 1px solid #e5e7eb;
          padding: 6px 8px;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .stat-bubble.primary { background: ${pc}; border-color: ${pc}; }
        .stat-bubble.primary .stat-value { color: white; }
        .stat-bubble.primary .stat-label { color: rgba(255,255,255,0.9); }
        
        .stat-value { font-size: 14px; font-weight: 700; color: #1f2937; line-height: 1; }
        .stat-label { font-size: 7px; font-weight: 500; color: #6b7280; line-height: 1; margin-top: 2px; }
        
        .center-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        
        .blob {
          position: absolute;
          inset: -16px;
          background: ${pc}15;
          border-radius: 60% 40% 55% 45% / 45% 55% 45% 55%;
        }
        
        .photo {
          position: relative;
          width: 144px;
          height: 144px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid white;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
          z-index: 10;
        }
        
        .photo-placeholder {
          position: relative;
          width: 144px;
          height: 144px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${pc}, ${pc}99);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 4px solid white;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
          z-index: 10;
        }
        
        .photo-placeholder span { font-size: 30px; font-weight: 700; color: white; }
        
        .name-section {
          text-align: center;
          margin-top: 8px;
          z-index: 20;
        }
        
        .name-section h1 { font-size: 12px; font-weight: 900; color: #111827; line-height: 1.2; }
        .name-section p.program { font-size: 9px; color: #6b7280; font-weight: 500; }
        .name-section p.angkatan { font-size: 8px; color: #9ca3af; }
        
        .bottom-stats {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
        }
        
        .bottom-stat {
          padding: 6px 12px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .bottom-stat .stat-value { font-size: 16px; font-weight: 900; line-height: 1; }
        .bottom-stat .stat-label { font-size: 8px; font-weight: 500; line-height: 1; margin-top: 2px; }
        
        .footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 8px;
          margin-top: 8px;
          border-top: 1px solid #f3f4f6;
        }
        
        .footer-left { display: flex; align-items: center; gap: 4px; }
        .footer-logo { height: 16px; width: auto; }
        .footer span { font-size: 9px; color: #9ca3af; font-weight: 500; }
        
        @media print {
          body { background: white; padding: 0; }
          .capture-container { box-shadow: none; }
          .poster-card { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
          .bottom-stat { 
        padding: 4px 10px; border-radius: 8px; font-weight: bold; 
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        min-width: 45px;
      }
      .stat-sup { font-size: 7px; opacity: 0.7; margin-left: 1px; }
      .grade-label { font-size: 6px; font-weight: 900; margin-top: 1px; line-height: 1; }
      .grade-sub { font-size: 5px; font-weight: 500; opacity: 0.6; text-transform: uppercase; margin-top: 1px; }
        }
      </style>
      </head><body>
      <div class="capture-container">
        <div class="poster-card">
          <div class="grid-bg"></div>
          <div class="content">
            <div class="header">
              <div class="title-box">
                <p>Rapor</p>
                <p>PRIDE</p>
              </div>
              <div class="period-badge">${periodType === 'monthly' ? formatPeriode(periode) : formatSemester()}</div>
            </div>
            
            <div class="main-area">
              <div class="main-stats">
              <div class="stats-col">
                ${k.productive.jam_produktif > 0 ? `<div class="stat-box" style="border-color:${pc}40;"><span class="val" style="color:${pc};">${k.productive.jam_produktif}</span><span class="lbl">Jam Produktif</span></div>` : ''}
                ${k.productive.hari_tracking > 0 ? `<div class="stat-box"><span class="val">${k.productive.hari_tracking}</span><span class="lbl">Tracking</span></div>` : ''}
                ${k.productive.review > 0 ? `<div class="stat-box"><span class="val">${k.productive.review}<sup class="stat-sup">/${c.max_review}</sup></span><span class="lbl">Review</span></div>` : ''}
                ${k.productive.portfolio > 0 ? `<div class="stat-box"><span class="val">${k.productive.portfolio}<sup class="stat-sup">/${c.max_portfolio}</sup></span><span class="lbl">Portfolio</span></div>` : ''}
                ${k.discipline.prosentase_disiplin > 0 ? `<div class="stat-box" style="background:${pc}; color:white;"><span class="val" style="font-size:10px;">${k.discipline.prosentase_disiplin}%</span><span class="lbl" style="color:rgba(255,255,255,0.9);">Disiplin</span></div>` : ''}
                ${k.discipline.sanksi > 0 ? `<div class="stat-box" style="background:#ef4444; color:white;"><span class="val">${k.discipline.sanksi}</span><span class="lbl">Sanksi</span></div>` : ''}
              </div>

              <div class="photo-section">
                <div class="photo-container">
                  ${s.foto_santri 
                    ? `<img src="${s.foto_santri}" style="box-shadow: 0 10px 40px -10px rgba(0,0,0,0.3);" />`
                    : `<div class="initials" style="background:linear-gradient(135deg, ${pc}, ${pc}99);">${getInitials(s.nama_lengkap_santri)}</div>`
                  }
                </div>
                <div class="name-card">
                  <div class="santri-name">${s.nama_lengkap_santri}</div>
                  <div class="santri-prog" style="color:${pc};">${s.program_santri}</div>
                  <div class="santri-angkatan">${s.angkatan_santri}</div>
                </div>
              </div>

              <div class="stats-col">
                ${k.rabbani.hafalan_baru > 0 ? `<div class="stat-box" style="background:${pc}; color:white;"><span class="val">${k.rabbani.hafalan_baru}<sup class="stat-sup">~${c.avg_ziyadah}</sup></span><span class="lbl" style="color:rgba(255,255,255,0.9);">${periodType === 'semester' ? 'Tot Ziyadah' : 'Ziyadah'}</span></div>` : ''}
                ${k.rabbani.murojaah > 0 ? `<div class="stat-box" style="background:${pc}dd; color:white;"><span class="val">${k.rabbani.murojaah}<sup class="stat-sup">~${c.avg_murojaah}</sup></span><span class="lbl" style="color:rgba(255,255,255,0.9);">Murojaah</span></div>` : ''}
                ${k.rabbani.tahfidz_total_setoran > 0 ? `<div class="stat-box" style="border-color:${pc};"><span class="val" style="color:${pc};">${k.rabbani.tahfidz_total_setoran}</span><span class="lbl">Total Setoran</span></div>` : ''}
                ${k.rabbani.tahfidz_grade_score > 0 ? `<div class="stat-box" style="background:${pc}20;"><span class="val" style="color:${pc};">${k.rabbani.tahfidz_grade_score}</span><span class="grade-label" style="color:#4b5563;">${getTahfidzLabel(k.rabbani.tahfidz_grade_score)}</span><span class="grade-sub">Total Hafalan</span></div>` : ''}
                ${k.rabbani.hari_ibadah > 0 ? `<div class="stat-box" style="background:#10b981; color:white;"><span class="val">${k.rabbani.hari_ibadah}</span><span class="lbl">Hari Ibadah</span></div>` : ''}
                ${k.intelligent.course_progress > 0 ? `<div class="stat-box" style="background:#3b82f6; color:white;"><span class="val">${k.intelligent.course_progress}%</span><span class="lbl">Course</span></div>` : ''}
              </div>
            </div>

            <div class="bottom-stats">
              ${k.ethic.piket > 0 ? `<div class="bottom-stat" style="background:${pc}15;"><span class="stat-value" style="color:${pc};">${k.ethic.piket}</span><span class="stat-label" style="color:#6b7280;">Piket</span></div>` : ''}
              ${k.intelligent.quiz_avg_score > 0 ? `<div class="bottom-stat" style="background:#f59e0b;"><span class="stat-value" style="color:white;">${k.intelligent.quiz_avg_score.toFixed(0)}</span><span class="stat-label" style="color:rgba(255,255,255,0.9);">Quiz Avg</span></div>` : ''}
              ${k.productive.review_avg_nilai > 0 ? `<div class="bottom-stat" style="background:#8b5cf6;"><span class="stat-value" style="color:white;">${k.productive.review_avg_nilai.toFixed(1)}</span><span class="stat-label" style="color:rgba(255,255,255,0.9);">Review Avg</span></div>` : ''}
            </div>
            
            <div class="footer">
              <div class="footer-left">
                <img src="${settings.logo || '/logo.png'}" class="footer-logo" />
                <span>${settings.namaSingkat || 'PISANTRI'}</span>
              </div>
              <span>${settings.namaPesantren || 'Pondok Informatika'}</span>
            </div>
          </div>
        </div>
      </div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Capture poster as image for social media sharing
  const handleCapture = async () => {
    if (!captureRef.current || !selectedSantri) return;
    setCapturing(true);
    
    try {
      const dataUrl = await toPng(captureRef.current, {
        quality: 1.0,
        pixelRatio: 2, // Higher quality
        backgroundColor: '#ffffff',
      });
      
      // Download the image
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `rapor-${selectedSantri.santri.nama_lengkap_santri.replace(/\s+/g, '-')}-${periode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Capture failed:', error);
    } finally {
      setCapturing(false);
    }
  };

  if (selectedSantri) {
    const k = selectedSantri.kuantitas;
    const s = selectedSantri.santri;
    const c = selectedSantri.cohort;
    return (
      <div className="min-h-screen bg-gray-100 py-6">
        <div className="max-w-md mx-auto px-4">
          {/* Header Controls */}
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setSelectedSantri(null)} 
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Kembali
            </button>
            
            {/* Period Type Toggle */}
            <div className="flex items-center gap-1 bg-white rounded-lg p-0.5 shadow-sm border border-gray-200">
              <button 
                onClick={() => setPeriodType('monthly')}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${periodType === 'monthly' ? 'text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                style={periodType === 'monthly' ? { backgroundColor: primaryColor } : {}}
              >
                Bulanan
              </button>
              <button 
                onClick={() => setPeriodType('semester')}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${periodType === 'semester' ? 'text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                style={periodType === 'semester' ? { backgroundColor: primaryColor } : {}}
              >
                Semester
              </button>
            </div>
            
            {/* Period Navigation - Monthly or Semester */}
            {periodType === 'monthly' ? (
              <div className="flex items-center gap-1 bg-white rounded-lg px-2 py-1 shadow-sm">
                <button 
                  onClick={() => {
                    const [y, m] = periode.split('-').map(Number);
                    const d = new Date(y, m - 2, 1);
                    setPeriode(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
                  }}
                  className="p-1 hover:bg-gray-100 rounded text-gray-500"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 text-xs font-medium text-gray-700">{formatPeriode(periode)}</span>
                <button 
                  onClick={() => {
                    const [y, m] = periode.split('-').map(Number);
                    const d = new Date(y, m, 1);
                    setPeriode(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
                  }}
                  className="p-1 hover:bg-gray-100 rounded text-gray-500"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-white rounded-lg px-2 py-1 shadow-sm">
                <button 
                  onClick={() => {
                    if (semesterNum === 1) { setSemesterNum(2); setSemesterYear(y => y - 1); }
                    else { setSemesterNum(1); }
                  }}
                  className="p-1 hover:bg-gray-100 rounded text-gray-500"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 text-xs font-medium text-gray-700">{formatSemester()}</span>
                <button 
                  onClick={() => {
                    if (semesterNum === 2) { setSemesterNum(1); setSemesterYear(y => y + 1); }
                    else { setSemesterNum(2); }
                  }}
                  className="p-1 hover:bg-gray-100 rounded text-gray-500"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

          {/* Capture Container - 4:5 Ratio for Instagram feed posts */}
          <div ref={captureRef} className="rounded-3xl p-6 flex flex-col items-center justify-center" style={{ aspectRatio: '4/5', backgroundColor: '#ffffff' }}>
            {/* Inner Card - 11:12 almost square with padding from outer container */}
            <div className="relative rounded-2xl overflow-hidden p-[3px]" style={{ aspectRatio: '11/12', width: 'calc(100% - 60px)', background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}40, #e5e7eb)` }}>
              <div className="relative w-full h-full rounded-xl overflow-hidden" style={{ backgroundColor: '#f8fafc' }}>
              
              {/* Santri Photo as Faint Background - 10% opacity */}
              {s.foto_santri && (
                <div className="absolute inset-0 overflow-hidden rounded-xl">
                  <img 
                    src={s.foto_santri} 
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ 
                      opacity: 0.10,
                      filter: 'saturate(0.1) contrast(1.3)'
                    }}
                  />
                </div>
              )}
              
              {/* Grid Background */}
              <div 
                className="absolute inset-0 z-[1]" 
                style={{
                  backgroundImage: 'linear-gradient(#f3f4f6 1px, transparent 1px), linear-gradient(90deg, #f3f4f6 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}
              />

            {/* Content */}
            <div className="relative z-[2] h-full flex flex-col px-12 py-1">
              {/* Header Row */}
              <div className="flex items-start justify-between mb-2">
                <div style={{ backgroundColor: primaryColor }} className="text-white px-4 py-2 rounded-xl shadow-lg">
                  <p className="text-xs font-bold leading-tight">Rapor</p>
                  <p className="text-base font-black leading-tight">PRIDE</p>
                </div>
                <div style={{ borderColor: primaryColor, color: primaryColor }} className="bg-white border-2 px-3 py-1.5 rounded-full shadow text-xs font-bold">
                  {periodType === 'monthly' ? formatPeriode(periode) : formatSemester()}
                </div>
              </div>

              {/* Main Content Area - 3 Column Layout */}
              <div className="flex-1 flex items-center justify-center gap-2">
                
                {/* Left Column - Stats */}
                <div className="flex flex-col gap-0.5 w-[56px] flex-shrink-0">
                  {k.productive.jam_produktif > 0 && (
                    <div style={{ borderColor: `${primaryColor}40` }} className="bg-white border px-1.5 py-1.5 rounded-lg shadow-sm flex flex-col items-center justify-center">
                      <p style={{ color: primaryColor }} className="text-sm font-bold leading-none">{k.productive.jam_produktif}</p>
                      <p className="text-[6px] font-medium text-gray-500 leading-none mt-0.5 whitespace-nowrap">Jam Produktif</p>
                    </div>
                  )}
                  {k.productive.hari_tracking > 0 && (
                    <div className="bg-white/80 border border-gray-200 px-1.5 py-1 rounded flex flex-col items-center justify-center">
                      <p className="text-xs font-bold text-gray-800 leading-none">{k.productive.hari_tracking}</p>
                      <p className="text-[6px] font-medium text-gray-500 leading-none mt-0.5">Tracking</p>
                    </div>
                  )}
                  {k.productive.review > 0 && (
                    <div className="bg-white/80 border border-gray-200 px-1.5 py-1 rounded flex flex-col items-center justify-center">
                      <p className="text-xs font-bold text-gray-800 leading-none">
                        {k.productive.review}<sup className="text-[7px] ml-0.5 opacity-60">/{c.max_review}</sup>
                      </p>
                      <p className="text-[6px] font-medium text-gray-500 leading-none mt-0.5">Review</p>
                    </div>
                  )}
                  {k.productive.portfolio > 0 && (
                    <div className="bg-white/80 border border-gray-200 px-1.5 py-1 rounded flex flex-col items-center justify-center">
                      <p className="text-xs font-bold text-gray-800 leading-none">
                        {k.productive.portfolio}<sup className="text-[7px] ml-0.5 opacity-60">/{c.max_portfolio}</sup>
                      </p>
                      <p className="text-[6px] font-medium text-gray-500 leading-none mt-0.5">Portfolio</p>
                    </div>
                  )}
                  {k.discipline.prosentase_disiplin > 0 && (
                    <div style={{ backgroundColor: primaryColor }} className="text-white px-1.5 py-1.5 rounded-lg shadow-sm flex flex-col items-center justify-center">
                      <p className="text-[10px] font-bold leading-none">{k.discipline.prosentase_disiplin}%</p>
                      <p className="text-[6px] font-medium opacity-90 leading-none mt-0.5">Disiplin</p>
                    </div>
                  )}
                  {k.discipline.sanksi > 0 && (
                    <div className={`bg-red-500 text-white px-1.5 py-1 rounded flex flex-col items-center justify-center`}>
                      <p className="text-xs font-bold leading-none">{k.discipline.sanksi}</p>
                      <p className="text-[6px] font-medium opacity-90 leading-none mt-0.5">Sanksi</p>
                    </div>
                  )}
                </div>

                {/* Center - Photo with Name below */}
                <div className="relative flex-1 flex flex-col items-center justify-center">
                  {/* Decorative Blob Background */}
                  <div className="absolute -inset-4 rounded-full opacity-30" style={{ background: `radial-gradient(ellipse at center, ${primaryColor}40, transparent 70%)` }} />
                  
                  {/* Photo spacer */}
                  <div className="relative w-32 h-32 z-10">
                    {s.id_santri ? (
                      <img 
                        src={s.foto_santri || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.nama_lengkap_santri)}&background=random&color=fff`} 
                        alt={s.nama_lengkap_santri}
                        className="w-full h-full object-cover rounded-full border-4 border-white shadow-xl"
                        style={{ boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3)' }}
                      />
                    ) : (
                      <div style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}99)` }} className="w-full h-full rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                        <span className="text-4xl font-bold text-white">{getInitials(s.nama_lengkap_santri)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Name & Program - Styled card below photo */}
                  <div className="text-center mt-1 z-20 bg-white/90 px-3 py-1 rounded-xl shadow-sm backdrop-blur-sm">
                    <h1 className="text-sm font-black text-gray-900 leading-tight">{s.nama_lengkap_santri}</h1>
                    <p style={{ color: primaryColor }} className="text-[10px] font-semibold">{s.program_santri}</p>
                    <p className="text-[8px] text-gray-400">{s.angkatan_santri}</p>
                  </div>
                </div>

                {/* Right Column - Stats */}
                <div className="flex flex-col gap-0.5 w-[56px] flex-shrink-0">
                  {k.rabbani.hafalan_baru > 0 && (
                    <div style={{ backgroundColor: primaryColor }} className="text-white px-1.5 py-1.5 rounded-lg shadow-sm flex flex-col items-center justify-center">
                      <p className="text-sm font-bold leading-none">
                        {k.rabbani.hafalan_baru}<sup className="text-[7px] ml-0.5 opacity-80">~{c.avg_ziyadah}</sup>
                      </p>
                      <p className="text-[6px] font-medium opacity-90 leading-none mt-0.5 whitespace-nowrap">{periodType === 'semester' ? 'Tot Ziyadah' : 'Ziyadah'}</p>
                    </div>
                  )}
                  {k.rabbani.murojaah > 0 && (
                    <div style={{ backgroundColor: `${primaryColor}dd` }} className="text-white px-1.5 py-1 rounded flex flex-col items-center justify-center">
                      <p className="text-xs font-bold leading-none">
                        {k.rabbani.murojaah}<sup className="text-[7px] ml-0.5 opacity-80">~{c.avg_murojaah}</sup>
                      </p>
                      <p className="text-[6px] font-medium opacity-90 leading-none mt-0.5">Murojaah</p>
                    </div>
                  )}
                  {k.rabbani.tahfidz_total_setoran > 0 && (
                    <div style={{ borderColor: primaryColor }} className="bg-white/80 border px-1.5 py-1 rounded flex flex-col items-center justify-center">
                      <p style={{ color: primaryColor }} className="text-xs font-bold leading-none">{k.rabbani.tahfidz_total_setoran}</p>
                      <p className="text-[6px] font-medium text-gray-500 leading-none mt-0.5">Total Setoran</p>
                    </div>
                  )}
                  {k.rabbani.tahfidz_grade_score > 0 && (
                    <div style={{ backgroundColor: `${primaryColor}20` }} className="px-1.5 py-1 rounded flex flex-col items-center justify-center">
                      <p style={{ color: primaryColor }} className="text-xs font-black leading-none">{k.rabbani.tahfidz_grade_score}</p>
                      <p className="text-[6px] font-black text-gray-600 leading-none mt-0.5">{getTahfidzLabel(k.rabbani.tahfidz_grade_score)}</p>
                      <p className="text-[5px] font-medium text-gray-400 leading-none mt-0.5 uppercase tracking-tighter">Total Hafalan</p>
                    </div>
                  )}
                  {k.rabbani.hari_ibadah > 0 && (
                    <div className="bg-emerald-500 text-white px-1.5 py-1 rounded flex flex-col items-center justify-center">
                      <p className="text-xs font-bold leading-none">{k.rabbani.hari_ibadah}</p>
                      <p className="text-[6px] font-medium opacity-90 leading-none mt-0.5 whitespace-nowrap">Hari Ibadah</p>
                    </div>
                  )}
                  {k.intelligent.course_progress > 0 && (
                    <div className="bg-blue-500 text-white px-1.5 py-1 rounded flex flex-col items-center justify-center">
                      <p className="text-xs font-bold leading-none">{k.intelligent.course_progress}%</p>
                      <p className="text-[6px] font-medium opacity-90 leading-none mt-0.5">Course</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Row - Additional Stats */}
              <div className="flex justify-center gap-1.5 mt-1">
                {k.ethic.piket > 0 && (
                  <div style={{ backgroundColor: `${primaryColor}15` }} className="px-2 py-1 rounded flex flex-col items-center justify-center min-w-[36px]">
                    <p style={{ color: primaryColor }} className="text-sm font-black leading-none">{k.ethic.piket}</p>
                    <p className="text-[6px] font-medium text-gray-500 leading-none mt-0.5">Piket</p>
                  </div>
                )}
                {k.intelligent.quiz_avg_score > 0 && (
                  <div className="bg-amber-500 text-white px-2 py-1 rounded flex flex-col items-center justify-center min-w-[36px]">
                    <p className="text-sm font-black leading-none">{k.intelligent.quiz_avg_score.toFixed(0)}</p>
                    <p className="text-[6px] font-medium opacity-90 leading-none mt-0.5 whitespace-nowrap">Quiz Avg</p>
                  </div>
                )}
                {k.productive.review_avg_nilai > 0 && (
                  <div className="bg-purple-500 text-white px-2 py-1 rounded flex flex-col items-center justify-center min-w-[40px]">
                    <p className="text-sm font-black leading-none">{k.productive.review_avg_nilai.toFixed(1)}</p>
                    <p className="text-[6px] font-medium opacity-90 leading-none mt-0.5 whitespace-nowrap">Review Avg</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <img src={settings.logo || '/logo.png'} alt="Logo" className="h-4 w-auto" />
                  <span className="text-[9px] font-medium text-gray-400">{settings.namaSingkat || 'PISANTRI'}</span>
                </div>
                <p className="text-[9px] text-gray-400">{settings.namaPesantren || 'Pondok Informatika'}</p>
              </div>
              </div>
              </div>
            </div>
            {/* Inner card ends here */}
          </div>

          <div className="flex items-center justify-center gap-2 mt-6">
            <button onClick={handleCapture} disabled={capturing} style={{ backgroundColor: primaryColor }} className="flex items-center gap-2 px-6 py-2.5 text-white rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50">
              <Camera className="w-4 h-4" /> {capturing ? 'Loading...' : 'Capture Poster'}
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-gray-800 transition-all">
              <Printer className="w-4 h-4" /> Print Rapor
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-white">
      {/* Header moved to content area - NO FIXED */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        {/* Page Header with Month Navigation */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Rapor PRIDE</h1>
              <p className="text-sm font-bold text-indigo-500 uppercase tracking-widest">Management Console</p>
            </div>
          </div>

          {/* Month Navigation - Simple */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl px-2 py-1">
            <button 
              onClick={() => {
                const [y, m] = periode.split('-').map(Number);
                const d = new Date(y, m - 2, 1);
                setPeriode(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
              }}
              className="p-2 hover:bg-gray-200 rounded-lg text-gray-600"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-1 font-semibold text-gray-700 min-w-[140px] text-center">
              {periodType === 'monthly' ? formatPeriode(periode) : formatSemester()}
            </span>
            <button 
              onClick={() => {
                const [y, m] = periode.split('-').map(Number);
                const d = new Date(y, m, 1);
                setPeriode(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
              }}
              className="p-2 hover:bg-gray-200 rounded-lg text-gray-600"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>


        {/* Modern Filter Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
            <input 
              type="text" 
              placeholder="Search excellence..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full pl-14 pr-6 py-5 rounded-[2rem] bg-gray-50/50 border-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all text-sm font-bold text-gray-900 placeholder:text-gray-300" 
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-gray-50/50 p-1.5 rounded-[2rem] flex items-center gap-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-3xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-md text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-3xl transition-all ${viewMode === 'list' ? 'bg-white shadow-md text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <ListIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-sm font-bold text-gray-300 uppercase tracking-[0.3em]">Processing Intelligence</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada data rapor</h3>
            <p className="text-gray-400 text-sm">Tidak ditemukan rekaman performa untuk periode ini.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {viewMode === 'grid' ? (
              <motion.div 
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredData.map((item, idx) => (
                  <SantriGridCard key={item.santri.id_santri} item={item} index={idx} onClick={() => setSelectedSantri(item)} />
                ))}
              </motion.div>
            ) : (
              <motion.div 
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                {filteredData.map((item, idx) => (
                  <SantriListCard key={item.santri.id_santri} item={item} index={idx} onClick={() => setSelectedSantri(item)} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-gray-50 mt-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 opacity-40">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Encrypted Performance Data</span>
          </div>
          <p className="text-[10px] font-bold text-gray-400">© {new Date().getFullYear()} Pisantri Educational Platform</p>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components (Sleek Grid Card) ---
function SantriGridCard({ item, index, onClick }: { item: RaporItem; index: number; onClick: () => void }) {
  const s = item.santri;
  const k = item.kuantitas;
  const initials = s.nama_lengkap_santri.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="group relative bg-[#F8FAFC] p-6 rounded-[2.5rem] border border-gray-100/50 hover:bg-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-2 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="relative">
          <div className="absolute -inset-1 bg-indigo-500/10 rounded-3xl blur-md opacity-0 group-hover:opacity-100 transition-all" />
          {s.foto_santri ? (
            <img src={s.foto_santri} className="relative w-20 h-20 rounded-[1.5rem] object-cover border-4 border-white shadow-lg" />
          ) : (
            <div className="relative w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
              {initials}
            </div>
          )}
        </div>
        <div className="bg-white/50 px-3 py-1 rounded-full text-[10px] font-bold text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all uppercase tracking-widest leading-none">
          RANK #{index + 1}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 truncate leading-tight mb-1 group-hover:text-indigo-600 transition-all italic uppercase">{s.nama_lengkap_santri}</h3>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{s.program_santri}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <CardIndicator icon={<Clock className="w-3.5 h-3.5" />} value={k.productive.jam_produktif} color="blue" />
        <CardIndicator icon={<BookOpen className="w-3.5 h-3.5" />} value={k.rabbani.hafalan_baru} color="emerald" />
        <CardIndicator icon={<Sparkles className="w-3.5 h-3.5" />} value={k.intelligent.course_progress} unit="%" color="violet" />
      </div>
    </motion.div>
  );
}

function CardIndicator({ icon, value, color, unit }: { icon: React.ReactNode; value: number; color: 'blue' | 'emerald' | 'violet'; unit?: string }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600'
  };
  return (
    <div className={`p-3 rounded-2xl ${colors[color]} flex flex-col items-center gap-1.5`}>
      <div className="opacity-60">{icon}</div>
      <span className="text-xs font-bold italic">{value}{unit}</span>
    </div>
  );
}

// --- Sub-components (Compact List Card) ---
function SantriListCard({ item, index, onClick }: { item: RaporItem; index: number; onClick: () => void }) {
  const s = item.santri;
  const k = item.kuantitas;
  const initials = s.nama_lengkap_santri.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      className="group bg-gray-50/50 hover:bg-white p-4 rounded-3xl border border-transparent hover:border-gray-100 hover:shadow-xl hover:shadow-gray-100/50 transition-all cursor-pointer flex items-center gap-4"
    >
      <span className="w-8 text-[10px] font-bold text-gray-300 text-center">{index + 1}</span>
      {s.foto_santri ? (
        <img src={s.foto_santri} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md" />
      ) : (
        <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center text-white text-lg font-bold border-2 border-white shadow-md">
          {initials}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 truncate uppercase italic tracking-tighter text-base group-hover:text-indigo-600 transition-all">{s.nama_lengkap_santri}</h3>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.program_santri}</p>
      </div>

      <div className="hidden md:flex items-center gap-4 px-6 border-l border-gray-100">
        <ListIndicator label="Jam" value={k.productive.jam_produktif} color="blue" />
        <ListIndicator label="Hafalan" value={k.rabbani.hafalan_baru} color="emerald" />
        <ListIndicator label="Progress" value={`${k.intelligent.course_progress}%`} color="violet" />
      </div>

      <div className="p-3 bg-white rounded-xl text-gray-300 group-hover:text-indigo-600 transition-all">
        <ChevronRight className="w-5 h-5" />
      </div>
    </motion.div>
  );
}

function ListIndicator({ label, value, color }: { label: string; value: number|string; color: 'blue' | 'emerald' | 'violet' }) {
  const colors = {
    blue: 'text-blue-500',
    emerald: 'text-emerald-500',
    violet: 'text-violet-500'
  };
  return (
    <div className="text-center min-w-[70px]">
      <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className={`text-sm font-bold italic ${colors[color]}`}>{value}</p>
    </div>
  );
}
