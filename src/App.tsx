import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { TimeTrackingProvider } from './contexts/TimeTrackingContext';
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';

// Critical components - load immediately
import LoginPage from './components/LoginPage';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { AlertProvider } from './components/ui/AlertDialog';

// Lazy load dashboards
const SantriDashboard = lazy(() => import('./dashboards/SantriDashboard'));
const GenericDashboard = lazy(() => import('./dashboards/GenericDashboard'));

// Lazy load pages
const DataSantri = lazy(() => import('./pages/DataSantri'));
const KoperasiProdukPage = lazy(() => import('./pages/koperasi/KoperasiProdukPage'));
const KoperasiOrdersPage = lazy(() => import('./pages/koperasi/KoperasiOrdersPage'));
const KoperasiDompetPage = lazy(() => import('./pages/koperasi/KoperasiDompetPage'));
const KoperasiOrderDetailPage = lazy(() => import('./pages/koperasi/KoperasiOrderDetailPage'));
const TahfidzPage = lazy(() => import('./pages/TahfidzPage'));
const IbadahPage = lazy(() => import('./pages/IbadahPage'));
const PresensiPage = lazy(() => import('./pages/PresensiPage'));
const PresensiSkoringPage = lazy(() => import('./pages/PresensiSkoringPage'));
const PresensiQRPage = lazy(() => import('./pages/PresensiQRPage'));
const LoginQRPage = lazy(() => import('./pages/LoginQRPage'));
const SantriTahfidzPage = lazy(() => import('./pages/santri/SantriTahfidzPage'));
const SantriDailyPage = lazy(() => import('./pages/santri/SantriDailyPage'));
const SantriReviewPage = lazy(() => import('./pages/santri/SantriReviewPage'));
const SantriPortfolioPage = lazy(() => import('./pages/santri/SantriPortfolioPage'));
const SantriIzinPage = lazy(() => import('./pages/santri/SantriIzinPage'));
const SantriSanksiPage = lazy(() => import('./pages/santri/SantriSanksiPage'));
const SantriTatibPage = lazy(() => import('./pages/santri/SantriTatibPage'));
const SantriMasukanPage = lazy(() => import('./pages/santri/SantriMasukanPage'));
const SantriStatistikPage = lazy(() => import('./pages/santri/SantriStatistikPage'));
const SantriAkademikPage = lazy(() => import('./pages/santri/SantriAkademikPage'));
const SantriPresensiPage = lazy(() => import('./pages/santri/SantriPresensiPage'));
const SantriProfilPage = lazy(() => import('./pages/santri/SantriProfilPage'));
const SantriTulisanPage = lazy(() => import('./pages/santri/SantriTulisanPage'));
const SantriIbadahPage = lazy(() => import('./pages/santri/SantriIbadahPage'));
const SantriTimeTrackingPage = lazy(() => import('./pages/santri/SantriTimeTrackingPage'));
const DataPage = lazy(() => import('./pages/DataPage'));
const RequirementPage = lazy(() => import('./pages/RequirementPage'));
const PresensiEventPage = lazy(() => import('./pages/PresensiEventPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const IdCardPage = lazy(() => import('./pages/IdCardPage'));
const IdCardSettingsPage = lazy(() => import('./pages/IdCardSettingsPage'));
const OrtuDashboard = lazy(() => import('./pages/ortu/OrtuDashboard'));
const OrtuTahfidzPage = lazy(() => import('./pages/ortu/OrtuTahfidzPage'));
const OrtuPresensiPage = lazy(() => import('./pages/ortu/OrtuPresensiPage'));
const OrtuSanksiPage = lazy(() => import('./pages/ortu/OrtuSanksiPage'));
const OrtuKeuanganPage = lazy(() => import('./pages/ortu/OrtuKeuanganPage'));
const OrtuAkademikPage = lazy(() => import('./pages/ortu/OrtuAkademikPage'));
const OrtuIzinPage = lazy(() => import('./pages/ortu/OrtuIzinPage'));
const PpdbLandingPage = lazy(() => import('./pages/ppdb/PpdbLandingPage'));
const PpdbRegisterPage = lazy(() => import('./pages/ppdb/PpdbRegisterPage'));
const PpdbLoginPage = lazy(() => import('./pages/ppdb/PpdbLoginPage'));
const PpdbDashboardPage = lazy(() => import('./pages/ppdb/PpdbDashboardPage'));
const PpdbAdminPage = lazy(() => import('./pages/ppdb/PpdbAdminPage'));
const LmsCoursesPage = lazy(() => import('./pages/LmsCoursesPage'));
const LmsCourseFormPage = lazy(() => import('./pages/LmsCourseFormPage'));
const LmsCourseDetailPage = lazy(() => import('./pages/LmsCourseDetailPage'));
const LmsQuizSoalPage = lazy(() => import('./pages/LmsQuizSoalPage'));
const EvaluasiGradingPage = lazy(() => import('./pages/EvaluasiGradingPage'));
const SantriLmsPage = lazy(() => import('./pages/SantriLmsPage'));
const SantriCourseDetailPage = lazy(() => import('./pages/SantriCourseDetailPage'));
const SantriQuizPage = lazy(() => import('./pages/SantriQuizPage'));
const RoadmapListPage = lazy(() => import('./pages/RoadmapListPage'));
const RoadmapDetailPage = lazy(() => import('./pages/RoadmapDetailPage'));
const RoadmapAdminPage = lazy(() => import('./pages/RoadmapAdminPage'));
const CrowdfundLandingPage = lazy(() => import('./pages/crowdfund/CrowdfundLandingPage'));
const CrowdfundCampaignPage = lazy(() => import('./pages/crowdfund/CrowdfundCampaignPage'));
const CrowdfundAdminPage = lazy(() => import('./pages/crowdfund/CrowdfundAdminPage'));
const CrowdfundCampaignFormPage = lazy(() => import('./pages/crowdfund/CrowdfundCampaignFormPage'));
const AboutAppPage = lazy(() => import('./pages/AboutAppPage'));
const SantriPage = lazy(() => import('./pages/SantriPage'));
const SantriCVPage = lazy(() => import('./pages/SantriCVPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const TulisanPage = lazy(() => import('./pages/TulisanPage'));
const TulisanDetailPage = lazy(() => import('./pages/TulisanDetailPage'));
const AuthorPage = lazy(() => import('./pages/AuthorPage'));
const HadirPage = lazy(() => import('./pages/HadirPage'));
const UserPage = lazy(() => import('./pages/UserPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const SettingsFeaturesPage = lazy(() => import('./pages/SettingsFeaturesPage'));
const ManajemenBoardPage = lazy(() => import('./pages/manajemen/ManajemenBoardPage'));
const SopMonitoringPage = lazy(() => import('./pages/manajemen/SopMonitoringPage'));
const SopTablePage = lazy(() => import('./pages/manajemen/SopTablePage'));
const DivisiProkerPage = lazy(() => import('./pages/DivisiProkerPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ChangePasswordPage = lazy(() => import('./pages/ChangePasswordPage'));
const KeuanganPage = lazy(() => import('./pages/KeuanganPage'));
const PiketPage = lazy(() => import('./pages/PiketPage'));
const TatibPage = lazy(() => import('./pages/TatibPage'));
const KinerjaPage = lazy(() => import('./pages/KinerjaPage'));
const LiveClassPage = lazy(() => import('./pages/mentor/LiveClassPage'));
const MentoredSantriPage = lazy(() => import('./pages/mentor/MentoredSantriPage'));
const MentorManagementPage = lazy(() => import('./pages/MentorManagementPage'));
const SantriRaporPage = lazy(() => import('./pages/santri/SantriRaporPage'));
const OrtuRaporPage = lazy(() => import('./pages/ortu/OrtuRaporPage'));
const AkademikReviewPage = lazy(() => import('./pages/akademik/AkademikReviewPage'));
const RaporManagementPage = lazy(() => import('./pages/akademik/RaporManagementPage'));
const AkademikPortfolioPage = lazy(() => import('./pages/akademik/AkademikPortfolioPage'));
const PresentationPage = lazy(() => import('./pages/PresentationPage'));
const AimanPiPresentationPage = lazy(() => import('./pages/AimanPiPresentationPage'));
const AimanPitchPage = lazy(() => import('./pages/AimanPitchPage'));
const KisahUstadzAhmadPage = lazy(() => import('./pages/KisahUstadzAhmadPage'));
const KisahSantriPage = lazy(() => import('./pages/KisahSantriPage'));
const KisahWaliSantriPage = lazy(() => import('./pages/KisahWaliSantriPage'));
const AiChatPage = lazy(() => import('./pages/AiChatPage'));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p className="text-gray-600 text-sm">Memuat...</p>
    </div>
  </div>
);

// PrivateRoute component to protect routes
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function DashboardRouter() {
  const { user } = useAuth();

  if (!user) return null;

  const getDashboard = () => {
    if (!user) return null;
    
    // DEBUG: Dashboard Routing Log
    console.group('%c[DashboardRouter] Routing Decision', 'color: #3b82f6; font-weight: bold;');
    console.log('User Role:', user.role);
    console.log('API URL:', (import.meta as any).env.VITE_API_URL || 'Using Inferred (Check console for ApiService log)');
    console.groupEnd();
    
    // Define role-specific dashboard configurations
    const dashboardConfigs: Record<string, { title: string; subtitle: string; apiEndpoint: string }> = {
      superadmin: { 
        title: 'Selamat Datang, Admin!', 
        subtitle: 'Berikut adalah ringkasan sistem pondok pesantren hari ini',
        apiEndpoint: '/dashboard/admin'
      },
      pembinaan: { 
        title: 'Dashboard Pembinaan', 
        subtitle: 'Pantau perkembangan dan pembinaan santri',
        apiEndpoint: '/dashboard/musyrif' // Exception: use musyrif endpoint
      },
      mentor: { 
        title: 'Dashboard Mentor', 
        subtitle: 'Kelola course dan pantau progress santri',
        apiEndpoint: '/dashboard/admin' // Exception: use admin endpoint
      },
    };

    const isManagementRole = !['santri', 'ortu'].includes(user.role?.toLowerCase());

    if (isManagementRole) {
      const config = dashboardConfigs[user.role] || {
        title: `Dashboard ${user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'User'}`,
        subtitle: 'Selamat datang di sistem pesantren',
        apiEndpoint: `/dashboard/${user.role || 'admin'}`
      };
      
      return <GenericDashboard 
        roleName={user.role || 'user'}
        title={config.title}
        subtitle={config.subtitle}
        dashboardApiEndpoint={(user as any).dashboard_api || config.apiEndpoint}
        jabatanName={user.role || 'user'}
      />;
    }

    switch (user.role) {
      case 'santri':
        // Redirect santri with 'Daftar' (PPDB registrant) status to PPDB dashboard
        if (user.status_santri === 'Daftar') {
          const token = localStorage.getItem('ppdb_token') || localStorage.getItem('pisantri_token');
          if (!token) return <Navigate to="/ppdb/login" replace />;
          return <PpdbDashboardPage />;
        }
        return <SantriDashboard />;
      case 'ortu':
        return <OrtuDashboard />;
      default:
        return <Navigate to="/login" replace />;
    }
  };

  return <Suspense fallback={<PageLoader />}>{getDashboard()}</Suspense>;
}

// Placeholder pages - lazy loaded
const AkademikPage = lazy(() => import('./pages/PlaceholderPages').then(m => ({ default: m.AkademikPage })));
const AsramaPage = lazy(() => import('./pages/PlaceholderPages').then(m => ({ default: m.AsramaPage })));
const AktivitasHarianPage = lazy(() => import('./pages/AktivitasHarianPage'));
const InventarisPage = lazy(() => import('./pages/PlaceholderPages').then(m => ({ default: m.InventarisPage })));
const ReviewPage = lazy(() => import('./pages/PlaceholderPages').then(m => ({ default: m.ReviewPage })));
const PembinaanPage = lazy(() => import('./pages/PlaceholderPages').then(m => ({ default: m.PembinaanPage })));
const SanksiPage = lazy(() => import('./pages/PlaceholderPages').then(m => ({ default: m.SanksiPage })));
const MasukanPage = lazy(() => import('./pages/PlaceholderPages').then(m => ({ default: m.MasukanPage })));
const ProfilPage = lazy(() => import('./pages/PlaceholderPages').then(m => ({ default: m.ProfilPage })));

// Redirect legacy author URL to new format
function LegacyAuthorRedirect() {
  const [searchParams] = useSearchParams();
  const authorId = searchParams.get('author_id');
  if (authorId) {
    return <Navigate to={`/penulis/${authorId}`} replace />;
  }
  return <Navigate to="/tulisan" replace />;
}

// Component to handle home page routing (landing for guests, dashboard for users)
function HomeRouter() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <LandingPage />;
  }
  
  return (
    <Layout>
      <DashboardRouter />
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <SettingsProvider>
        <AuthProvider>
        <TimeTrackingProvider>
        <AlertProvider>
        <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Pages */}
          <Route path="/beranda" element={<LandingPage />} />
          <Route path="/digitalisasi-pesantren" element={<AboutAppPage />} />
          <Route path="/presentasi-digitalisasi" element={<PresentationPage />} />
          <Route path="/kisah-aiman" element={<AimanPiPresentationPage />} />
          <Route path="/solusi-aiman" element={<AimanPitchPage />} />
          <Route path="/kisah-ustadz" element={<KisahUstadzAhmadPage />} />
          <Route path="/kisah-santri" element={<KisahSantriPage />} />
          <Route path="/kisah-wali-santri" element={<KisahWaliSantriPage />} />
          <Route path="/santri" element={<SantriPage />} />
          <Route path="/berita" element={<NewsPage />} />
          <Route path="/tulisan" element={<TulisanPage />} />
          <Route path="/tulisan/:slug" element={<TulisanDetailPage />} />
          <Route path="/penulis/:santriId" element={<AuthorPage />} />
          <Route path="/hadir" element={<HadirPage />} />
          <Route path="/chat" element={<AiChatPage />} />
          <Route path="/author_articles.php" element={<LegacyAuthorRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/qr" element={<LoginQRPage />} />
          {/* Home - Landing for guests, Dashboard for users */}
          <Route path="/" element={<HomeRouter />} />
          <Route
            path="/data-santri"
            element={
              <PrivateRoute>
                <Layout>
                  <DataSantri />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route path="/users" element={<PrivateRoute><Layout><UserPage /></Layout></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Layout><SettingsPage /></Layout></PrivateRoute>} />
          <Route path="/settings/features" element={<PrivateRoute><Layout><SettingsFeaturesPage /></Layout></PrivateRoute>} />
          <Route path="/settings/manajemen" element={<PrivateRoute><Layout><ManajemenBoardPage /></Layout></PrivateRoute>} />
          <Route path="/settings/sop-monitoring" element={<PrivateRoute><Layout><SopMonitoringPage /></Layout></PrivateRoute>} />
          <Route path="/settings/sop-data" element={<PrivateRoute><Layout><SopTablePage /></Layout></PrivateRoute>} />
          <Route path="/proker/:division" element={<PrivateRoute><Layout><DivisiProkerPage /></Layout></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Layout><ProfilePage /></Layout></PrivateRoute>} />
          <Route path="/change-password" element={<PrivateRoute><Layout><ChangePasswordPage /></Layout></PrivateRoute>} />
          <Route path="/akademik" element={<PrivateRoute><Layout><AkademikPage /></Layout></PrivateRoute>} />
          <Route path="/akademik/review" element={<PrivateRoute><Layout><AkademikReviewPage /></Layout></PrivateRoute>} />
          <Route path="/akademik/portfolio" element={<PrivateRoute><Layout><AkademikPortfolioPage /></Layout></PrivateRoute>} />
          <Route path="/akademik/rapor" element={<PrivateRoute><Layout><RaporManagementPage /></Layout></PrivateRoute>} />
          <Route path="/asrama" element={<PrivateRoute><Layout><AsramaPage /></Layout></PrivateRoute>} />
          <Route path="/asrama/aktivitas" element={<PrivateRoute><Layout><AktivitasHarianPage /></Layout></PrivateRoute>} />
          <Route path="/inventaris" element={<PrivateRoute><Layout><InventarisPage /></Layout></PrivateRoute>} />
          <Route path="/tahfidz" element={<PrivateRoute><Layout><TahfidzPage /></Layout></PrivateRoute>} />
          <Route path="/ibadah" element={<PrivateRoute><Layout><IbadahPage /></Layout></PrivateRoute>} />
          <Route path="/presensi" element={<PrivateRoute><Layout><PresensiPage /></Layout></PrivateRoute>} />
          <Route path="/presensi/skoring" element={<PrivateRoute><Layout><PresensiSkoringPage /></Layout></PrivateRoute>} />
          <Route path="/presensi/scan" element={<PrivateRoute><Layout><PresensiQRPage /></Layout></PrivateRoute>} />
          <Route path="/review" element={<PrivateRoute><Layout><ReviewPage /></Layout></PrivateRoute>} />
          <Route path="/pembinaan" element={<PrivateRoute><Layout><PembinaanPage /></Layout></PrivateRoute>} />
          <Route path="/sanksi" element={<PrivateRoute><Layout><SanksiPage /></Layout></PrivateRoute>} />
          <Route path="/masukan" element={<PrivateRoute><Layout><MasukanPage /></Layout></PrivateRoute>} />
          <Route path="/keuangan" element={<PrivateRoute><Layout><KeuanganPage /></Layout></PrivateRoute>} />
          <Route path="/piket" element={<PrivateRoute><Layout><PiketPage /></Layout></PrivateRoute>} />
          <Route path="/tatib" element={<PrivateRoute><Layout><TatibPage /></Layout></PrivateRoute>} />
          <Route path="/kinerja" element={<PrivateRoute><Layout><KinerjaPage /></Layout></PrivateRoute>} />
          <Route path="/koperasi/produk" element={<PrivateRoute><Layout><KoperasiProdukPage /></Layout></PrivateRoute>} />
          <Route path="/koperasi/orders" element={<PrivateRoute><Layout><KoperasiOrdersPage /></Layout></PrivateRoute>} />
          <Route path="/koperasi/dompet" element={<PrivateRoute><Layout><KoperasiDompetPage /></Layout></PrivateRoute>} />
          <Route path="/koperasi/detail_pesanan/:id" element={<PrivateRoute><Layout><KoperasiOrderDetailPage /></Layout></PrivateRoute>} />
          <Route path="/profil" element={<PrivateRoute><Layout><ProfilPage /></Layout></PrivateRoute>} />
          {/* Santri Feature Pages */}
          <Route path="/santri/tahfidz" element={<PrivateRoute><Layout><SantriTahfidzPage /></Layout></PrivateRoute>} />
          <Route path="/santri/daily" element={<PrivateRoute><Layout><SantriDailyPage /></Layout></PrivateRoute>} />
          <Route path="/santri/review" element={<PrivateRoute><Layout><SantriReviewPage /></Layout></PrivateRoute>} />
          <Route path="/santri/portfolio" element={<PrivateRoute><Layout><SantriPortfolioPage /></Layout></PrivateRoute>} />
          <Route path="/santri/izin" element={<PrivateRoute><Layout><SantriIzinPage /></Layout></PrivateRoute>} />
          <Route path="/santri/sanksi" element={<PrivateRoute><Layout><SantriSanksiPage /></Layout></PrivateRoute>} />
          <Route path="/santri/tatib" element={<PrivateRoute><Layout><SantriTatibPage /></Layout></PrivateRoute>} />
          <Route path="/santri/masukan" element={<PrivateRoute><Layout><SantriMasukanPage /></Layout></PrivateRoute>} />
          <Route path="/santri/statistik" element={<PrivateRoute><Layout><SantriStatistikPage /></Layout></PrivateRoute>} />
          <Route path="/santri/akademik" element={<PrivateRoute><Layout><SantriAkademikPage /></Layout></PrivateRoute>} />
          <Route path="/santri/presensi" element={<PrivateRoute><Layout><SantriPresensiPage /></Layout></PrivateRoute>} />
          <Route path="/santri/profil" element={<PrivateRoute><Layout><SantriProfilPage /></Layout></PrivateRoute>} />
          <Route path="/santri/tulisan" element={<PrivateRoute><Layout><SantriTulisanPage /></Layout></PrivateRoute>} />
          <Route path="/santri/ibadah" element={<PrivateRoute><Layout><SantriIbadahPage /></Layout></PrivateRoute>} />
          <Route path="/santri/rapor" element={<PrivateRoute><Layout><SantriRaporPage /></Layout></PrivateRoute>} />
          <Route path="/santri/time-tracking" element={<PrivateRoute><Layout><SantriTimeTrackingPage /></Layout></PrivateRoute>} />
          <Route path="/santri/:id" element={<SantriCVPage />} />
          {/* ID Card */}
          <Route path="/idcard" element={<PrivateRoute><Layout><IdCardPage /></Layout></PrivateRoute>} />
          <Route path="/idcard/settings" element={<PrivateRoute><Layout><IdCardSettingsPage /></Layout></PrivateRoute>} />
          <Route path="/idcard/:id" element={<PrivateRoute><Layout><IdCardPage /></Layout></PrivateRoute>} />
          {/* Generic Data CRUD */}
          <Route path="/data" element={<PrivateRoute><Layout><DataPage /></Layout></PrivateRoute>} />
          <Route path="/data/:tableKey" element={<PrivateRoute><Layout><DataPage /></Layout></PrivateRoute>} />
          <Route path="/requirement" element={<PrivateRoute><Layout><RequirementPage /></Layout></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute><Layout><NotificationsPage /></Layout></PrivateRoute>} />
          <Route path="/presensi/event" element={<PrivateRoute><Layout><PresensiEventPage /></Layout></PrivateRoute>} />
          <Route path="/presensi/event/:agendaId" element={<PrivateRoute><Layout><PresensiEventPage /></Layout></PrivateRoute>} />
          {/* Portal Ortu */}
          <Route path="/ortu" element={<PrivateRoute><Layout><OrtuDashboard /></Layout></PrivateRoute>} />
          <Route path="/ortu/tahfidz" element={<PrivateRoute><Layout><OrtuTahfidzPage /></Layout></PrivateRoute>} />
          <Route path="/ortu/presensi" element={<PrivateRoute><Layout><OrtuPresensiPage /></Layout></PrivateRoute>} />
          <Route path="/ortu/sanksi" element={<PrivateRoute><Layout><OrtuSanksiPage /></Layout></PrivateRoute>} />
          <Route path="/ortu/keuangan" element={<PrivateRoute><Layout><OrtuKeuanganPage /></Layout></PrivateRoute>} />
          <Route path="/ortu/akademik" element={<PrivateRoute><Layout><OrtuAkademikPage /></Layout></PrivateRoute>} />
          <Route path="/ortu/rapor" element={<PrivateRoute><Layout><OrtuRaporPage /></Layout></PrivateRoute>} />
          <Route path="/ortu/izin" element={<PrivateRoute><Layout><OrtuIzinPage /></Layout></PrivateRoute>} />
          {/* PPDB Public Pages */}
          <Route path="/ppdb" element={<PpdbLandingPage />} />
          <Route path="/ppdb/register" element={<PpdbRegisterPage />} />
          <Route path="/ppdb/login" element={<PpdbLoginPage />} />
          <Route path="/ppdb/dashboard" element={<PpdbDashboardPage />} />
          {/* PPDB Admin */}
          <Route path="/ppdb-admin" element={<PrivateRoute><Layout><PpdbAdminPage /></Layout></PrivateRoute>} />
          {/* LMS - Akademik (Manage) */}
          <Route path="/lms/courses" element={<PrivateRoute><Layout><LmsCoursesPage /></Layout></PrivateRoute>} />
          <Route path="/lms/courses/new" element={<PrivateRoute><Layout><LmsCourseFormPage /></Layout></PrivateRoute>} />
          <Route path="/lms/courses/:id/edit" element={<PrivateRoute><Layout><LmsCourseFormPage /></Layout></PrivateRoute>} />
          <Route path="/lms/courses/:id" element={<PrivateRoute><Layout><LmsCourseDetailPage /></Layout></PrivateRoute>} />
          <Route path="/lms/quiz/:quizId/soal" element={<PrivateRoute><Layout><LmsQuizSoalPage /></Layout></PrivateRoute>} />
          <Route path="/lms/evaluasi/grading" element={<PrivateRoute><Layout><EvaluasiGradingPage /></Layout></PrivateRoute>} />
          {/* Mentor */}
          <Route path="/mentor/live-class" element={<PrivateRoute><Layout><LiveClassPage /></Layout></PrivateRoute>} />
          <Route path="/mentor/santri" element={<PrivateRoute><Layout><MentoredSantriPage /></Layout></PrivateRoute>} />
          <Route path="/mentor-management" element={<PrivateRoute><Layout><MentorManagementPage /></Layout></PrivateRoute>} />
          {/* LMS - Santri (Belajar) */}
          <Route path="/santri/lms" element={<PrivateRoute><Layout><SantriLmsPage /></Layout></PrivateRoute>} />
          <Route path="/santri/lms/course/:courseId" element={<PrivateRoute><Layout><SantriCourseDetailPage /></Layout></PrivateRoute>} />
          <Route path="/santri/lms/quiz/:quizId" element={<PrivateRoute><Layout><SantriQuizPage /></Layout></PrivateRoute>} />
          {/* Roadmap */}
          <Route path="/roadmap" element={<PrivateRoute><Layout><RoadmapListPage /></Layout></PrivateRoute>} />
          <Route path="/roadmap/:id" element={<PrivateRoute><Layout><RoadmapDetailPage /></Layout></PrivateRoute>} />
          <Route path="/roadmap-admin" element={<PrivateRoute><Layout><RoadmapAdminPage /></Layout></PrivateRoute>} />
          {/* Crowdfunding - Public */}
          <Route path="/donasi" element={<CrowdfundLandingPage />} />
          <Route path="/donasi/:slug" element={<CrowdfundCampaignPage />} />
          {/* Crowdfunding - Admin */}
          <Route path="/crowdfund" element={<PrivateRoute><Layout><CrowdfundAdminPage /></Layout></PrivateRoute>} />
          <Route path="/crowdfund/campaigns/new" element={<PrivateRoute><Layout><CrowdfundCampaignFormPage /></Layout></PrivateRoute>} />
          <Route path="/crowdfund/campaigns/:id/edit" element={<PrivateRoute><Layout><CrowdfundCampaignFormPage /></Layout></PrivateRoute>} />
        </Routes>
        </Suspense>
        <PWAInstallPrompt />
        </AlertProvider>
        </TimeTrackingProvider>
        </AuthProvider>
      </SettingsProvider>
    </Router>
  );
}

export default App;
