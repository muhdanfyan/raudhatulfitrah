import { useState, useEffect, useRef } from 'react';
import { 
  FileText, ChevronLeft, ChevronRight, Loader2,
  Camera, Printer, Award
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { Link } from 'react-router-dom';
import { API_URL, api } from '../../services/api';
import { toPng } from 'html-to-image';
import { getStudentPhotoUrl } from '../../utils/imageUtils';

interface Kuantitas {
  productive: { jam_produktif: number; hari_tracking: number; review: number; review_avg_nilai: number; portfolio: number; };
  rabbani: { hari_ibadah: number; witir: number; dhuha: number; rawatib: number; puasa_sunnah: number; dzikir: number; hafalan_baru: number; murojaah: number; tahfidz_avg_nilai: number; tahfidz_grade_score: number; tahfidz_total_setoran: number; };
  intelligent: { quiz: number; quiz_avg_score: number; course_progress: number; course_avg_progress: number; skill_progress: number; skill_avg_level: number; };
  discipline: { presensi_hadir: number; total_hari: number; sanksi: number; skor_disiplin: number; prosentase_disiplin: number; };
  ethic: { piket: number; };
}

interface Cohort {
  max_review: number;
  max_portfolio: number;
  avg_ziyadah: number;
  avg_murojaah: number;
  avg_tahfidz_nilai: number;
  max_tahfidz_total_bobot: number;
}

interface SantriData {
  id_santri: number;
  nama_lengkap_santri: string;
  foto_santri?: string;
  program_santri?: string;
  angkatan_santri?: string;
}

export default function SantriRaporPage() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [loading, setLoading] = useState(true);
  const [kuantitas, setKuantitas] = useState<Kuantitas | null>(null);
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [santriData, setSantriData] = useState<SantriData | null>(null);
  const [capturing, setCapturing] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);
  
  const [periode, setPeriode] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [periodType, setPeriodType] = useState<'monthly' | 'semester'>('monthly');
  const [semesterYear, setSemesterYear] = useState(() => new Date().getFullYear());
  const [semesterNum, setSemesterNum] = useState<1 | 2>(() => new Date().getMonth() < 6 ? 1 : 2);

  const primaryColor = settings?.warnaUtama || '#0f172a';

  useEffect(() => { if (user?.santri_id) fetchRapor(); }, [user, periode, periodType, semesterYear, semesterNum]);

  const fetchRapor = async () => {
    setLoading(true);
    try {
      // Fetch all data like RaporManagementPage, then filter by santri_id
      const json = periodType === 'semester'
        ? await api.getRaporManagementSemester(semesterYear, semesterNum)
        : await api.getRaporManagementRealtime(periode);
      
      if (json.success && json.data) {
        // Filter data for current logged-in santri
        const myData = json.data.find((item: any) => item.santri?.id_santri === user?.santri_id);
        if (myData) {
          setKuantitas(myData.kuantitas);
          setCohort(myData.cohort || { max_review: 0, max_portfolio: 0, avg_ziyadah: 0, avg_murojaah: 0, avg_tahfidz_nilai: 0, max_tahfidz_total_bobot: 0 });
          setSantriData(myData.santri);
        } else {
          // No data found for this santri
          setKuantitas(null);
          setCohort(null);
          setSantriData(null);
        }
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const formatPeriode = (p: string) => {
    const [year, month] = p.split('-');
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${months[parseInt(month) - 1]} ${year}`;
  };

  const formatSemester = () => `${semesterNum === 1 ? 'Genap' : 'Ganjil'} - ${semesterYear}`;

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const getTahfidzLabel = (score: number) => {
    if (score >= 9.0) return 'Mumtaz';
    if (score >= 8.0) return 'Jayyid Jiddan';
    if (score >= 7.0) return 'Jayyid';
    if (score >= 6.0) return 'Maqbul';
    return 'Dhaif';
  };

  const handleCapture = async () => {
    if (!captureRef.current || !kuantitas) return;
    setCapturing(true);
    
    try {
      const dataUrl = await toPng(captureRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `rapor-${santriData?.nama_lengkap_santri?.replace(/\s+/g, '-') || 'santri'}-${periode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Capture failed:', error);
    } finally {
      setCapturing(false);
    }
  };

  const handlePrint = () => {
    if (!kuantitas || !santriData) return;
    const k = kuantitas;
    const s = santriData;
    const c = cohort || { max_review: 0, max_portfolio: 0, avg_ziyadah: 0, avg_murojaah: 0, avg_tahfidz_nilai: 0, max_tahfidz_total_bobot: 0 };
    const pc = primaryColor;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html><head><title>Rapor PRIDE - ${s.nama_lengkap_santri}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        body { font-family: 'Inter', system-ui, sans-serif; padding: 20px; background: #f3f4f6; }
        .capture-container { max-width: 400px; margin: 0 auto; background: white; border-radius: 24px; padding: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1); }
        .poster-card { position: relative; border-radius: 16px; overflow: hidden; background: linear-gradient(135deg, ${pc}, ${pc}40, #e5e7eb); padding: 3px; }
        .poster-inner { background: #f8fafc; border-radius: 12px; padding: 16px 48px; position: relative; }
        .grid-bg { position: absolute; inset: 0; background-image: linear-gradient(#f3f4f6 1px, transparent 1px), linear-gradient(90deg, #f3f4f6 1px, transparent 1px); background-size: 20px 20px; z-index: 1; }
        .content { position: relative; z-index: 2; }
        .header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
        .title-box { background: ${pc}; color: white; padding: 8px 16px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .title-box p:first-child { font-size: 10px; font-weight: 700; }
        .title-box p:last-child { font-size: 14px; font-weight: 900; }
        .period-badge { background: white; border: 2px solid ${pc}; color: ${pc}; padding: 6px 12px; border-radius: 999px; font-size: 10px; font-weight: 700; }
        .main-area { display: flex; align-items: center; justify-content: center; gap: 8px; margin: 16px 0; }
        .stats-col { display: flex; flex-direction: column; gap: 4px; width: 56px; }
        .stat-box { background: white; border: 1px solid #e5e7eb; padding: 6px; border-radius: 8px; text-align: center; }
        .stat-box .val { font-size: 12px; font-weight: 700; color: #1f2937; display: block; }
        .stat-box .lbl { font-size: 6px; font-weight: 500; color: #6b7280; display: block; margin-top: 2px; }
        .photo-section { flex: 1; display: flex; flex-direction: column; align-items: center; }
        .photo-container img, .photo-container .initials { width: 128px; height: 128px; border-radius: 50%; object-fit: cover; border: 4px solid white; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.3); }
        .photo-container .initials { background: linear-gradient(135deg, ${pc}, ${pc}99); display: flex; align-items: center; justify-content: center; font-size: 30px; font-weight: 700; color: white; }
        .name-card { text-align: center; margin-top: 8px; background: rgba(255,255,255,0.9); padding: 4px 12px; border-radius: 12px; }
        .santri-name { font-size: 12px; font-weight: 900; color: #111827; }
        .santri-prog { font-size: 10px; font-weight: 600; color: ${pc}; }
        .santri-angkatan { font-size: 8px; color: #9ca3af; }
        .bottom-stats { display: flex; justify-content: center; gap: 6px; margin-top: 8px; }
        .bottom-stat { padding: 4px 8px; border-radius: 6px; text-align: center; min-width: 36px; }
        .bottom-stat .stat-value { font-size: 14px; font-weight: 900; }
        .bottom-stat .stat-label { font-size: 6px; font-weight: 500; margin-top: 2px; }
        .footer { display: flex; justify-content: space-between; align-items: center; padding-top: 8px; margin-top: 8px; border-top: 1px solid #f3f4f6; }
        .footer-logo { height: 16px; }
        .footer span { font-size: 9px; color: #9ca3af; font-weight: 500; }
        .stat-sup { font-size: 7px; opacity: 0.7; margin-left: 1px; }
        @media print { body { background: white; padding: 0; } .capture-container { box-shadow: none; } }
      </style></head><body>
      <div class="capture-container">
        <div class="poster-card">
          <div class="poster-inner">
            <div class="grid-bg"></div>
            <div class="content">
              <div class="header">
                <div class="title-box"><p>Rapor</p><p>PRIDE</p></div>
                <div class="period-badge">${periodType === 'monthly' ? formatPeriode(periode) : formatSemester()}</div>
              </div>
              <div class="main-area">
                <div class="stats-col">
                  ${k.productive.jam_produktif > 0 ? `<div class="stat-box" style="border-color:${pc}40;"><span class="val" style="color:${pc};">${k.productive.jam_produktif}</span><span class="lbl">Jam Produktif</span></div>` : ''}
                  ${k.productive.hari_tracking > 0 ? `<div class="stat-box"><span class="val">${k.productive.hari_tracking}</span><span class="lbl">Tracking</span></div>` : ''}
                  ${k.productive.review > 0 ? `<div class="stat-box"><span class="val">${k.productive.review}<sup class="stat-sup">/${c.max_review}</sup></span><span class="lbl">Review</span></div>` : ''}
                  ${k.productive.portfolio > 0 ? `<div class="stat-box"><span class="val">${k.productive.portfolio}<sup class="stat-sup">/${c.max_portfolio}</sup></span><span class="lbl">Portfolio</span></div>` : ''}
                  ${k.discipline.prosentase_disiplin > 0 ? `<div class="stat-box" style="background:${pc}; color:white;"><span class="val" style="color:white; font-size:10px;">${k.discipline.prosentase_disiplin}%</span><span class="lbl" style="color:rgba(255,255,255,0.9);">Disiplin</span></div>` : ''}
                  ${k.discipline.sanksi > 0 ? `<div class="stat-box" style="background:#ef4444; color:white;"><span class="val" style="color:white;">${k.discipline.sanksi}</span><span class="lbl" style="color:rgba(255,255,255,0.9);">Sanksi</span></div>` : ''}
                </div>
                <div class="photo-section">
                  <div class="photo-container">
                    ${s.foto_santri ? `<img src="${s.foto_santri}" />` : `<div class="initials">${getInitials(s.nama_lengkap_santri)}</div>`}
                  </div>
                  <div class="name-card">
                    <div class="santri-name">${s.nama_lengkap_santri}</div>
                    <div class="santri-prog">${s.program_santri || ''}</div>
                    <div class="santri-angkatan">${s.angkatan_santri || ''}</div>
                  </div>
                </div>
                <div class="stats-col">
                  ${k.rabbani.hafalan_baru > 0 ? `<div class="stat-box" style="background:${pc}; color:white;"><span class="val" style="color:white;">${k.rabbani.hafalan_baru}<sup class="stat-sup">~${c.avg_ziyadah}</sup></span><span class="lbl" style="color:rgba(255,255,255,0.9);">${periodType === 'semester' ? 'Tot Ziyadah' : 'Ziyadah'}</span></div>` : ''}
                  ${k.rabbani.murojaah > 0 ? `<div class="stat-box" style="background:${pc}dd; color:white;"><span class="val" style="color:white;">${k.rabbani.murojaah}<sup class="stat-sup">~${c.avg_murojaah}</sup></span><span class="lbl" style="color:rgba(255,255,255,0.9);">Murojaah</span></div>` : ''}
                  ${k.rabbani.tahfidz_total_setoran > 0 ? `<div class="stat-box" style="border-color:${pc};"><span class="val" style="color:${pc};">${k.rabbani.tahfidz_total_setoran}</span><span class="lbl">Total Setoran</span></div>` : ''}
                  ${k.rabbani.tahfidz_grade_score > 0 ? `<div class="stat-box" style="background:${pc}20;"><span class="val" style="color:${pc};">${k.rabbani.tahfidz_grade_score}</span><span class="lbl" style="font-weight:900;color:#4b5563;">${getTahfidzLabel(k.rabbani.tahfidz_grade_score)}</span></div>` : ''}
                  ${k.rabbani.hari_ibadah > 0 ? `<div class="stat-box" style="background:#10b981; color:white;"><span class="val" style="color:white;">${k.rabbani.hari_ibadah}</span><span class="lbl" style="color:rgba(255,255,255,0.9);">Hari Ibadah</span></div>` : ''}
                  ${k.intelligent.course_progress > 0 ? `<div class="stat-box" style="background:#3b82f6; color:white;"><span class="val" style="color:white;">${k.intelligent.course_progress}%</span><span class="lbl" style="color:rgba(255,255,255,0.9);">Course</span></div>` : ''}
                </div>
              </div>
              <div class="bottom-stats">
                ${k.ethic.piket > 0 ? `<div class="bottom-stat" style="background:${pc}15;"><span class="stat-value" style="color:${pc};">${k.ethic.piket}</span><span class="stat-label" style="color:#6b7280;">Piket</span></div>` : ''}
                ${k.intelligent.quiz_avg_score > 0 ? `<div class="bottom-stat" style="background:#f59e0b;"><span class="stat-value" style="color:white;">${k.intelligent.quiz_avg_score.toFixed(0)}</span><span class="stat-label" style="color:rgba(255,255,255,0.9);">Quiz Avg</span></div>` : ''}
                ${k.productive.review_avg_nilai > 0 ? `<div class="bottom-stat" style="background:#8b5cf6;"><span class="stat-value" style="color:white;">${k.productive.review_avg_nilai.toFixed(1)}</span><span class="stat-label" style="color:rgba(255,255,255,0.9);">Review Avg</span></div>` : ''}
              </div>
              <div class="footer">
                <div style="display:flex;align-items:center;gap:4px;">
                  <img src="${settings.logo || '/logo.png'}" class="footer-logo" />
                  <span>${settings.namaSingkat || 'PISANTRI'}</span>
                </div>
                <span>${settings.namaPesantren || 'Pondok Informatika'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const k = kuantitas;
  const s = santriData;
  const c = cohort || { max_review: 0, max_portfolio: 0, avg_ziyadah: 0, avg_murojaah: 0, avg_tahfidz_nilai: 0, max_tahfidz_total_bobot: 0 };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-md mx-auto px-4">
        {/* Header Controls */}
        <div className="flex items-center justify-between mb-4">
          <Link 
            to="/santri" 
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Kembali
          </Link>
          
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
          
          {/* Period Navigation */}
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

        {!k || !s ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-3xl">
            <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada data rapor</h3>
            <p className="text-gray-400 text-sm">Tidak ditemukan rekaman performa untuk periode ini.</p>
          </div>
        ) : (
          <>
            {/* Capture Container - 4:5 Ratio for Instagram feed posts */}
            <div ref={captureRef} className="rounded-3xl p-6 flex flex-col items-center justify-center" style={{ aspectRatio: '4/5', backgroundColor: '#ffffff' }}>
              {/* Inner Card */}
              <div className="relative rounded-2xl overflow-hidden p-[3px]" style={{ aspectRatio: '11/12', width: 'calc(100% - 60px)', background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}40, #e5e7eb)` }}>
                <div className="relative w-full h-full rounded-xl overflow-hidden" style={{ backgroundColor: '#f8fafc' }}>
                
                  {/* Santri Photo as Faint Background */}
                  {s.foto_santri && (
                    <div className="absolute inset-0 overflow-hidden rounded-xl">
                      <img 
                        src={getStudentPhotoUrl(s.foto_santri)} 
                        alt=""
                        className="w-full h-full object-cover"
                        style={{ opacity: 0.10, filter: 'saturate(0.1) contrast(1.3)' }}
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
                          <div className="bg-red-500 text-white px-1.5 py-1 rounded flex flex-col items-center justify-center">
                            <p className="text-xs font-bold leading-none">{k.discipline.sanksi}</p>
                            <p className="text-[6px] font-medium opacity-90 leading-none mt-0.5">Sanksi</p>
                          </div>
                        )}
                      </div>

                      {/* Center - Photo with Name below */}
                      <div className="relative flex-1 flex flex-col items-center justify-center">
                        {/* Decorative Blob Background */}
                        <div className="absolute -inset-4 rounded-full opacity-30" style={{ background: `radial-gradient(ellipse at center, ${primaryColor}40, transparent 70%)` }} />
                        
                        {/* Photo */}
                        <div className="relative w-32 h-32 z-10">
                          {s.foto_santri ? (
                            <img 
                              src={getStudentPhotoUrl(s.foto_santri)} 
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
                        
                        {/* Name & Program */}
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
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <button 
                onClick={handleCapture} 
                disabled={capturing} 
                style={{ backgroundColor: primaryColor }} 
                className="flex items-center gap-2 px-6 py-2.5 text-white rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
              >
                <Camera className="w-4 h-4" /> {capturing ? 'Loading...' : 'Capture Poster'}
              </button>
              <button 
                onClick={handlePrint} 
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-gray-800 transition-all"
              >
                <Printer className="w-4 h-4" /> Print Rapor
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
