import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Package, Calendar, FileText, Briefcase, Trash2, Shield, 
  ArrowUp, ArrowDown, Maximize2, Columns, Plus, X as CloseIcon, 
  HelpCircle, LayoutGrid, MessageSquare, Activity, ClipboardCheck, 
  ListTodo, Target, BookOpen, Heart, Star, FolderOpen, Clock, 
  Wallet, AlertCircle, Video, GraduationCap, Menu, Scan
} from 'lucide-react';
import StatCard from './StatCard';
import MasukanPanel from './MasukanPanel';
import CurrentActivityCard from './CurrentActivityCard';
import JobdeskPanel from './JobdeskPanel';
import SopChecklistPanel from './SopChecklistPanel';
import TugasAdminPanel from './TugasAdminPanel';
import ProkerStatusWidget from './ProkerStatusWidget';
import BelumSetorPanel from './BelumSetorPanel';
import IbadahReportPanel from './IbadahReportPanel';
import PejabatPanel from './PejabatPanel';
import SetoranHariIniPanel from './manajemen/SetoranHariIniPanel';
import LatestReviewsPanel from './manajemen/LatestReviewsPanel';
import LatestPortfoliosPanel from './manajemen/LatestPortfoliosPanel';
import RekapSetoranBulanIniPanel from './manajemen/RekapSetoranBulanIniPanel';
import DailyReportHariIniPanel from './manajemen/DailyReportHariIniPanel';
import WhatsappDailyReportPanel from './manajemen/WhatsappDailyReportPanel';
import PresensiHariIniTable from './manajemen/PresensiHariIniTable';
import KeuanganSummaryPanel from './manajemen/KeuanganSummaryPanel';
import KeuanganBelumLaporPanel from './manajemen/KeuanganBelumLaporPanel';
import UpcomingLiveClassesPanel from './manajemen/UpcomingLiveClassesPanel';
import MentorCoursesPanel from './manajemen/MentorCoursesPanel';
import QuickMenuPanel from './manajemen/QuickMenuPanel';
import PresenceScanBanner from './manajemen/PresenceScanBanner';
import IntegratedCalendarWidget from './calendar/IntegratedCalendarWidget';

// Standard labels and icons for widgets (standardized across editor and renderer)
export const WIDGET_INFO: Record<string, { label: string; icon: any; description?: string }> = {
  stat_card: { label: 'Statistik Ringkasan', icon: Users, description: 'Menampilkan data santri, inventaris, dan agenda' },
  masukan_panel: { label: 'Masukan Santri', icon: MessageSquare, description: 'Daftar masukan dan keluhan dari santri' },
  current_activity: { label: 'Aktivitas Berjalan', icon: Activity, description: 'Kegiatan yang sedang berlangsung saat ini' },
  jobdesk_panel: { label: 'Jobdesk Divisi', icon: Briefcase, description: 'Tanggung jawab dan tugas divisi terkait' },
  sop_checklist: { label: 'Ceklis SOP', icon: ClipboardCheck, description: 'Daftar prosedur operasional harian' },
  tugas_admin: { label: 'Tugas Pimpinan', icon: ListTodo, description: 'Instruksi langsung dari pimpinan' },
  proker_status: { label: 'Status Proker', icon: Target, description: 'Progres program kerja divisi' },
  belum_setor: { label: 'Belum Setor Hafalan', icon: BookOpen, description: 'Daftar santri yang belum menyetorkan hafalan' },
  ibadah_report: { label: 'Laporan Ibadah', icon: Heart, description: 'Statistik kepatuhan ibadah santri' },
  pejabat_panel: { label: 'Panel Pengurus', icon: Users, description: 'Daftar pengurus dan struktural' },
  setoran_hari_ini: { label: 'Hafalan Hari Ini', icon: BookOpen, description: 'Daftar santri yang setor hafalan hari ini' },
  latest_reviews: { label: 'Review Terbaru', icon: Star, description: 'Ulasan performa santri terbaru' },
  latest_portfolios: { label: 'Portofolio Terbaru', icon: FolderOpen, description: 'Karya dan proyek santri terbaru' },
  rekap_setoran_bulan_ini: { label: 'Rekap Setoran', icon: FileText, description: 'Ringkasan setoran dalam satu bulan' },
  daily_report_hari_ini: { label: 'Daily Report', icon: Clock, description: 'Laporan harian santri hari ini' },
  presensi_hari_ini_table: { label: 'Tabel Presensi', icon: Clock, description: 'Daftar kehadiran santri hari ini' },
  keuangan_summary: { label: 'Ringkasan Keuangan', icon: Wallet, description: 'Saldo dan mutasi kas pondok' },
  keuangan_belum_lapor: { label: 'Belum Lapor Kas', icon: AlertCircle, description: 'Daftar transaksi yang belum dilaporkan' },
  upcoming_live_classes: { label: 'Live Class Terdekat', icon: Video, description: 'Jadwal kelas daring yang akan datang' },
  mentor_courses: { label: 'Kursus Mentor', icon: GraduationCap, description: 'Daftar kursus yang diampu mentor' },
  quick_menu: { label: 'Menu Cepat', icon: Menu, description: 'Akses cepat ke fitur-fitur utama' },
  presence_scan_banner: { label: 'Banner Presensi', icon: Scan, description: 'Tombol cepat untuk scan kehadiran' },
  whatsapp_daily_report: { label: 'WA Daily Report', icon: MessageSquare, description: 'Laporan harian format WhatsApp untuk dicopy' },
  calendar_integrated: { label: 'Kalender Terpadu', icon: Calendar, description: 'Agenda dan kegiatan dalam bentuk kalender' },
  tatib_banner: { label: 'Banner Tata Tertib', icon: Shield, description: 'Akses cepat ke aturan dan sanksi' },
};

// Widget configuration from database
export interface WidgetConfig {
  id?: number;
  widget_key: string;
  is_enabled: boolean;
  grid_x: number;
  grid_y: number;
  grid_w: number;
  grid_h: number;
  config?: Record<string, any>;
}

// Dashboard data structure
export interface DashboardData {
  stats?: {
    santri_mondok?: number;
    santri_total?: number;
    inventaris?: number;
    agenda?: number;
    masukan_pending?: number;
    saldo_kas?: number;
    [key: string]: any;
  };
  masukan?: any[];
  belum_setor?: any[];
  belum_nyetor?: any[];
  pejabat?: any[];
  keuangan?: any;
  [key: string]: any;
}

interface WidgetRendererProps {
  widgets: WidgetConfig[];
  dashboardData: DashboardData;
  role: string;
  jabatanName?: string;  // For SOP, Jobdesk, Tugas panels
  jabatanId?: number;    // For SOP panel
  onRefresh?: () => void;
  isEditing?: boolean;
  onUpdateSize?: (key: string, w: number, x: number) => void;
  onMove?: (index: number, direction: 'up' | 'down') => void;
  onRemove?: (key: string) => void;
  onAdd?: (key: string) => void;
}

// Widget component type definition
type WidgetComponent = React.ComponentType<any>;

// Registry mapping widget_key to component and its props builder
interface WidgetDefinition {
  component: WidgetComponent;
  buildProps: (props: WidgetRendererProps, config?: Record<string, any>) => Record<string, any>;
}

const WIDGET_REGISTRY: Record<string, WidgetDefinition> = {
  stat_card: {
    component: ({ stats }: { stats: any[] }) => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat: any, index: number) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
    ),
    buildProps: ({ dashboardData }) => ({
      stats: buildStatsFromData(dashboardData),
    }),
  },

  masukan_panel: {
    component: MasukanPanel,
    buildProps: ({ dashboardData, role, onRefresh }) => ({
      masukan: dashboardData?.masukan || [],
      title: getMasukanTitle(role),
      onRefresh,
    }),
  },

  current_activity: {
    component: CurrentActivityCard,
    buildProps: () => ({}),
  },
  
  pejabat_panel: {
    component: PejabatPanel,
    buildProps: ({ dashboardData }) => ({
      pejabat: dashboardData?.pejabat || [],
      title: 'Panel Pengurus Pasantri',
    }),
  },

  jobdesk_panel: {
    component: JobdeskPanel,
    buildProps: ({ jabatanName, role }, config) => ({
      jabatanName: config?.jabatanName || jabatanName || role,
      title: `Tugas & Tanggung Jawab Divisi ${capitalize(jabatanName || role)}`,
      accentColor: getAccentColor(role),
    }),
  },

  sop_checklist: {
    component: SopChecklistPanel,
    buildProps: ({ jabatanId, jabatanName, role }, config) => ({
      jabatanId: config?.jabatanId || jabatanId || getJabatanId(role),
      title: `SOP Harian ${capitalize(jabatanName || role)}`,
    }),
  },

  tugas_admin: {
    component: TugasAdminPanel,
    buildProps: ({ jabatanName, role }, config) => ({
      jabatanName: config?.jabatanName || jabatanName || role,
      title: 'Tugas dari Pimpinan',
    }),
  },

  proker_status: {
    component: ProkerStatusWidget,
    buildProps: ({ jabatanName, role }, config) => ({
      division: config?.division || jabatanName || role,
      title: `Program Kerja ${capitalize(jabatanName || role)}`,
    }),
  },

  belum_setor: {
    component: BelumSetorPanel,
    buildProps: ({ dashboardData }) => ({
      data: dashboardData?.belum_setor || dashboardData?.belum_nyetor || [],
      title: 'Belum Setor Hari Ini',
      maxDisplay: 15,
      linkTo: '/tahfidz',
    }),
  },

  ibadah_report: {
    component: IbadahReportPanel,
    buildProps: () => ({
      maxDisplay: 5,
    }),
  },

  setoran_hari_ini: {
    component: SetoranHariIniPanel,
    buildProps: ({ dashboardData }) => ({
      setoran: dashboardData?.setoran_hari_ini || dashboardData?.tahfidz_hari_ini || [],
      title: 'Hafalan Hari Ini',
    }),
  },

  latest_reviews: {
    component: LatestReviewsPanel,
    buildProps: ({ dashboardData }) => ({
      reviews: dashboardData?.latest_reviews || [],
    }),
  },

  latest_portfolios: {
    component: LatestPortfoliosPanel,
    buildProps: ({ dashboardData }) => ({
      portfolios: dashboardData?.latest_portfolios || [],
    }),
  },

  rekap_setoran_bulan_ini: {
    component: RekapSetoranBulanIniPanel,
    buildProps: ({ dashboardData }) => ({
      rekap: dashboardData?.rekap_setoran_bulan_ini || dashboardData?.rekap_bulan_ini || [],
    }),
  },

  daily_report_hari_ini: {
    component: DailyReportHariIniPanel,
    buildProps: ({ dashboardData }) => ({
      reports: dashboardData?.daily_report_hari_ini || dashboardData?.daily_hari_ini || [],
    }),
  },

  presensi_hari_ini_table: {
    component: PresensiHariIniTable,
    buildProps: ({ dashboardData }) => ({
      presensi: dashboardData?.presensi_hari_ini || [],
    }),
  },

  keuangan_summary: {
    component: KeuanganSummaryPanel,
    buildProps: ({ dashboardData }) => ({
      keuangan: dashboardData?.keuangan || { saldo: 0, debet: 0, kredit: 0 },
    }),
  },

  keuangan_belum_lapor: {
    component: KeuanganBelumLaporPanel,
    buildProps: ({ dashboardData }) => ({
      logs: dashboardData?.keuangan_belum_lapor || [],
    }),
  },

  upcoming_live_classes: {
    component: UpcomingLiveClassesPanel,
    buildProps: ({ dashboardData }) => ({
      upcoming: dashboardData?.upcoming_live || [],
    }),
  },

  mentor_courses: {
    component: MentorCoursesPanel,
    buildProps: ({ dashboardData }) => ({
      courses: dashboardData?.courses || [],
    }),
  },

  quick_menu: {
    component: QuickMenuPanel,
    buildProps: () => ({
      title: 'Menu Cepat',
    }),
  },

  presence_scan_banner: {
    component: PresenceScanBanner,
    buildProps: ({ role }) => ({
      color: role === 'akademik' ? 'blue' : (role === 'asrama' ? 'amber' : 'indigo'),
    }),
  },

  calendar_integrated: {
    component: IntegratedCalendarWidget,
    buildProps: () => ({}),
  },
  whatsapp_daily_report: {
    component: WhatsappDailyReportPanel,
    buildProps: () => ({}),
  },
  tatib_banner: {
    component: ({ color = 'indigo' }: { color?: string }) => (
      <Link
        to="/tatib"
        className={`block bg-gradient-to-r ${color === 'emerald' ? 'from-emerald-600 to-teal-600' : 'from-indigo-600 to-purple-600'} rounded-xl shadow-lg p-6 hover:shadow-xl transition group`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Tata Tertib & Sanksi</h3>
              <p className={`${color === 'emerald' ? 'text-emerald-100' : 'text-indigo-100'} text-sm`}>Kelola peraturan dan pelanggaran santri</p>
            </div>
          </div>
          <div className="text-white/70 group-hover:text-white group-hover:translate-x-1 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    ),
    buildProps: ({ role }) => ({
      color: role === 'pembinaan' ? 'emerald' : 'indigo',
    }),
  },
};

// Helper functions
function buildStatsFromData(data: DashboardData) {
  const baseStats = [];
  
  if (data?.stats?.santri_mondok !== undefined) {
    baseStats.push({ 
      title: 'Santri Mondok', 
      value: data.stats.santri_mondok, 
      icon: Users,
      color: 'blue', 
      href: '/data-santri' 
    });
  }
  if (data?.stats?.santri_total !== undefined) {
    baseStats.push({ 
      title: 'Total Santri', 
      value: data.stats.santri_total, 
      icon: Users,
      color: 'emerald', 
      href: '/data-santri' 
    });
  }
  if (data?.stats?.review_total !== undefined) {
    baseStats.push({ 
      title: 'Review', 
      value: data.stats.review_total, 
      icon: FileText,
      color: 'violet', 
      href: '/data' 
    });
  }
  if (data?.stats?.portfolio_total !== undefined) {
    baseStats.push({ 
      title: 'Portfolio', 
      value: data.stats.portfolio_total, 
      icon: Briefcase,
      color: 'cyan', 
      href: '/data' 
    });
  }
  // LMS Stats
  if (data?.stats?.course_total !== undefined) {
    baseStats.push({ 
      title: 'Course', 
      value: data.stats.course_total, 
      icon: GraduationCap,
      color: 'indigo', 
      href: '/lms-admin' 
    });
  }
  if (data?.stats?.roadmap_total !== undefined) {
    baseStats.push({ 
      title: 'Roadmap', 
      value: data.stats.roadmap_total, 
      icon: Target,
      color: 'purple', 
      href: '/lms-admin' 
    });
  }
  if (data?.stats?.mentor_total !== undefined) {
    baseStats.push({ 
      title: 'Mentor', 
      value: data.stats.mentor_total, 
      icon: Users,
      color: 'rose', 
      href: '/mentor' 
    });
  }
  if (data?.stats?.live_session_total !== undefined) {
    baseStats.push({ 
      title: 'Live Session', 
      value: data.stats.live_session_total, 
      icon: Video,
      color: 'red', 
      href: '/lms-admin' 
    });
  }
  if (data?.stats?.inventaris !== undefined) {
    baseStats.push({ 
      title: 'Inventaris', 
      value: data.stats.inventaris, 
      icon: Package,
      color: 'teal', 
      href: '/data/inventaris' 
    });
  }
  if (data?.stats?.agenda !== undefined) {
    baseStats.push({ 
      title: 'Agenda', 
      value: data.stats.agenda, 
      icon: Calendar,
      color: 'orange', 
      href: '/data/agenda' 
    });
  }
  
  // Fallback if no stats - show default cards
  if (baseStats.length === 0) {
    baseStats.push(
      { title: 'Santri Mondok', value: 0, icon: Users, color: 'blue', href: '/data-santri' },
      { title: 'Total Santri', value: 0, icon: Users, color: 'emerald', href: '/data-santri' }
    );
  }
  
  return baseStats;
}

function getMasukanTitle(role: string): string {
  const titles: Record<string, string> = {
    admin: 'Masukan Santri (Semua Bidang)',
    akademik: 'Masukan Santri (Akademik/Kesantrian)',
    pembinaan: 'Masukan Santri (Pembinaan/Kesantrian)',
    asrama: 'Masukan Santri (Asrama/Umum/Humas)',
    musyrif: 'Masukan Santri (Pembinaan/Kesantrian)',
    pengontrol: 'Masukan Santri (Pembinaan/Kesantrian)',
    kepsek: 'Masukan Santri (Semua Bidang)',
  };
  return titles[role] || 'Masukan Santri';
}

function getAccentColor(role: string): string {
  const colors: Record<string, string> = {
    akademik: 'blue',
    pembinaan: 'emerald',
    asrama: 'amber',
    kepsek: 'indigo',
  };
  return colors[role] || 'blue';
}

function getJabatanId(role: string): number {
  const ids: Record<string, number> = {
    akademik: 8,
    pembinaan: 2,
    asrama: 3,
    kepsek: 1,
    admin: 1,
    superadmin: 1,
  };
  return ids[role] || 1;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Main renderer component
export default function DashboardWidgetRenderer({
  widgets,
  dashboardData,
  role,
  jabatanName,
  jabatanId,
  onRefresh,
  isEditing = false,
  onUpdateSize,
  onMove,
  onRemove,
  onAdd,
}: WidgetRendererProps) {
  const [showAddModal, setShowAddModal] = React.useState(false);
  // Sort widgets by grid position (y first, then x)
  const sortedWidgets = [...widgets]
    .filter(w => w.is_enabled)
    .sort((a, b) => {
      if (a.grid_y !== b.grid_y) return a.grid_y - b.grid_y;
      return a.grid_x - b.grid_x;
    });

  const rendererProps: WidgetRendererProps = {
    widgets,
    dashboardData,
    role,
    jabatanName: (role === 'admin' || role === 'superadmin') ? 'Ketua Harian' : (jabatanName || role),
    jabatanId: (role === 'admin' || role === 'superadmin') ? 1 : (jabatanId || getJabatanId(role)),
    onRefresh,
  };

  // 1. Prepare renderable widgets with layout info
  const renderableWidgets = sortedWidgets
    .map(widget => {
      const definition = WIDGET_REGISTRY[widget.widget_key];
      if (!definition) return null;
      
      const props = definition.buildProps(rendererProps, widget.config);
      
      // Visibility check based on data
      if (widget.widget_key === 'masukan_panel' && (!props.masukan || props.masukan.length === 0)) return null;
      if (widget.widget_key === 'belum_setor' && (!props.data || props.data.length === 0)) return null;
      if (widget.widget_key === 'ibadah_report' && (!dashboardData.ibadah_today || dashboardData.ibadah_today.length === 0)) return null;
      
      // Layout logic
      // grid_w: 12 is full width, 6 is half width
      // grid_x: 0 is left, 6 is right (for half width)
      const isFullWidth = widget.grid_w >= 12 || widget.widget_key === 'stat_card';
      const isHalfRight = !isFullWidth && widget.grid_x >= 6;
      
      // Add isHalf to props
      const finalProps = {
        ...props,
        isHalf: !isFullWidth
      };
      
      return { 
        widget, 
        props: finalProps, 
        Component: definition.component,
        isFullWidth,
        isHalfRight
      };
    })
    .filter(Boolean) as { widget: WidgetConfig; props: any; Component: React.ComponentType<any>; isFullWidth: boolean; isHalfRight: boolean }[];

  // 2. Group widgets for row-based rendering
  // We'll group them into "rows" to maintain a clean vertical flow while respecting grid_x
  const rows: (typeof renderableWidgets)[] = [];
  let currentRow: typeof renderableWidgets = [];
  let currentWidth = 0;

  renderableWidgets.forEach(item => {
    if (item.isFullWidth) {
      if (currentRow.length > 0) {
        rows.push(currentRow);
        currentRow = [];
        currentWidth = 0;
      }
      rows.push([item]);
    } else {
      // Logic to pair half-width widgets if possible
      if (currentWidth + 6 > 12) {
        rows.push(currentRow);
        currentRow = [item];
        currentWidth = 6;
      } else {
        currentRow.push(item);
        currentWidth += 6;
      }
    }
  });
  if (currentRow.length > 0) rows.push(currentRow);

  return (
    <div className="space-y-6">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className={`grid gap-6 ${row.length > 1 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {row.map((item, itemIdx) => {
            // Find global index for movement
            const globalIndex = renderableWidgets.indexOf(item);
            
            return (
              <div 
                key={item.widget.id || `${item.widget.widget_key}-${itemIdx}`} 
                data-widget={item.widget.widget_key} 
                className={`
                  relative transition-all duration-300 h-full flex flex-col
                  ${item.isHalfRight && row.length === 1 ? 'lg:col-start-2' : ''}
                  ${isEditing ? 'ring-2 ring-indigo-400 p-3 bg-indigo-50/20 rounded-[2rem] shadow-sm' : ''}
                `}
              >
                {isEditing && (
                  <div className="absolute -top-3 left-4 right-4 z-[50] flex items-center justify-between">
                    <div className="flex gap-1.5 p-1 bg-white border border-indigo-100 rounded-xl shadow-lg">
                      <button 
                        onClick={() => onMove?.(globalIndex, 'up')}
                        disabled={globalIndex === 0}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-30"
                        title="Geser Atas"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => onMove?.(globalIndex, 'down')}
                        disabled={globalIndex === renderableWidgets.length - 1}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-30"
                        title="Geser Bawah"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex gap-1.5 p-1 bg-white border border-indigo-100 rounded-xl shadow-lg">
                      <button 
                        onClick={() => onUpdateSize?.(item.widget.widget_key, 12, 0)}
                        className={`p-1.5 rounded-lg ${item.isFullWidth ? 'bg-indigo-600 text-white' : 'text-indigo-400 hover:bg-indigo-50'}`}
                        title="Lebar Penuh"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => onUpdateSize?.(item.widget.widget_key, 6, 0)}
                        className={`p-1.5 rounded-lg ${!item.isFullWidth ? 'bg-indigo-600 text-white' : 'text-indigo-400 hover:bg-indigo-50'}`}
                        title="Setengah (Half)"
                      >
                        <Columns className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex gap-1.5 p-1 bg-white border border-red-100 rounded-xl shadow-lg">
                      <button 
                        onClick={() => onRemove?.(item.widget.widget_key)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                        title="Hapus Widget"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
                <item.Component {...item.props} />
              </div>
            );
          })}
        </div>
      ))}

      {/* Add Widget Placeholder */}
      {isEditing && (
        <div className="flex justify-center pt-8 pb-12">
          <button
            onClick={() => setShowAddModal(true)}
            className="group flex items-center gap-3 px-6 py-3 border-2 border-dashed border-indigo-200 rounded-2xl bg-white hover:bg-indigo-50 hover:border-indigo-400 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-sm font-bold text-gray-700">Tambah Widget</span>
          </button>
        </div>
      )}

      {/* Add Widget Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 p-8">
            <div 
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
              onClick={() => setShowAddModal(false)} 
            />
            
            <div className="relative bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-black/5">
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Pilih Widget</h3>
                  <p className="text-sm text-gray-500">Pilih widget untuk ditambahkan ke dashboard Anda</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)} 
                  className="p-2.5 hover:bg-gray-200 bg-white shadow-sm border border-gray-100 rounded-2xl transition-all active:scale-95"
                >
                  <CloseIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(WIDGET_INFO)
                    .filter(([key]) => !widgets.find(w => w.widget_key === key))
                    .map(([key, info]) => {
                      const Icon = info.icon || LayoutGrid;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            onAdd?.(key);
                            setShowAddModal(false);
                          }}
                          className="group flex flex-col items-start gap-4 p-5 hover:bg-primary/5 rounded-[2rem] border-2 border-transparent hover:border-primary/20 transition-all text-left bg-gray-50"
                        >
                          <div className="flex items-center gap-4 w-full">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 shadow-sm border border-gray-100 transition-transform">
                              <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 truncate">{info.label}</p>
                              <p className="text-[10px] text-gray-400 font-mono uppercase tracking-tighter opacity-60">{key}</p>
                            </div>
                            <Plus className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed font-medium">
                            {info.description || 'Deskripsi widget tidak tersedia.'}
                          </p>
                        </button>
                      );
                    })}
                </div>
                
                {Object.entries(WIDGET_INFO).filter(([key]) => !widgets.find(w => w.widget_key === key)).length === 0 && (
                  <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <HelpCircle className="w-8 h-8 text-indigo-400" />
                    </div>
                    <p className="text-lg font-bold text-gray-900">Luar Biasa!</p>
                    <p className="text-sm text-gray-500 mt-1">Semua widget yang tersedia sudah ada di dashboard Anda.</p>
                  </div>
                )}
              </div>

              <div className="px-8 py-5 bg-indigo-600 text-white flex items-center justify-between">
                <p className="text-[10px] uppercase font-black tracking-[0.2em] opacity-90">Sistem Dashboard Pintar</p>
                <div className="flex items-center gap-1.5 opacity-80">
                  <span className="w-1 h-1 bg-white rounded-full"></span>
                  <span className="w-1 h-1 bg-white rounded-full opacity-40"></span>
                  <span className="w-1 h-1 bg-white rounded-full opacity-20"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export widget keys for reference
export const AVAILABLE_WIDGETS = Object.keys(WIDGET_REGISTRY);
