import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { AlertCircle, QrCode, Eye, EyeOff, Users, BookOpen, Sparkles } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { TENANT_ID, api, getPublicHeaders } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

// Demo accounts config
const DEMO_ACCOUNTS_JSON = import.meta.env.VITE_DEMO_ACCOUNTS;
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || '';

interface DemoAccount {
  label: string;
  email: string;
  role: string;
  color: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = DEMO_ACCOUNTS_JSON ? JSON.parse(DEMO_ACCOUNTS_JSON) : [];

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

const sidePanelVariants = (direction: 'left' | 'right') => ({
  hidden: { x: direction === 'left' ? -50 : 50, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: "easeOut" }
  }
});

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [programs, setPrograms] = useState<string[]>([]);
  const { login, isLoading, user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const isDemo = TENANT_ID === 'demosantren';

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const json = await api.get('/public/landing-data', {
          headers: getPublicHeaders(),
        });
        if (json.success && json.data?.learning_modes) {
          const modeTitles = json.data.learning_modes.map((m: any) => m.title);
          setPrograms(modeTitles);
        }
      } catch (err) {
        console.error('Failed to fetch programs:', err);
      }
    };
    fetchPrograms();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
  };

  const programListText = programs.length > 0 ? (
    <>
      {' '}Dalam bentuk program{' '}
      {programs.map((p, idx) => (
        <span key={p}>
          <span className="text-blue-500 font-bold">{p}</span>
          {idx === programs.length - 2 ? ' serta ' : idx < programs.length - 2 ? ', ' : ''}
        </span>
      ))}
    </>
  ) : null;

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden">
      {/* Left Panel - Login Form */}
      <motion.div 
        variants={sidePanelVariants('left')}
        initial="hidden"
        animate="visible"
        className="w-full lg:w-[480px] flex items-center justify-center p-6 lg:p-12 relative z-10 bg-white border-r border-gray-100"
      >
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-sm"
        >
          {/* Demo Banner */}
          {isDemo && (
            <motion.div 
              variants={itemVariants}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-2xl p-4 text-center shadow-lg mb-0"
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-5 h-5" />
                <span className="font-bold text-sm">🎯 Mode Demo</span>
              </div>
            </motion.div>
          )}
          
          <motion.div 
            variants={itemVariants}
            className={`bg-white p-2 ${isDemo ? 'pt-6 border-x border-b border-gray-100 rounded-b-2xl shadow-sm' : ''}`}
          >
            {/* Logo & Header */}
            <div className="text-center mb-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-block mb-2"
              >
                <Link to="/">
                  <img 
                    src={settings.logo || '/logo.png'} 
                    alt="Logo" 
                    className="h-12 mx-auto" 
                    loading="eager"
                    fetchPriority="high"
                  />
                </Link>
              </motion.div>
              <motion.h2 variants={itemVariants} className="text-2xl font-bold text-gray-900 mb-1">Selamat Datang! 👋</motion.h2>
              <motion.p variants={itemVariants} className="text-gray-500 text-sm">{settings.namaSingkat || 'PISANTRI'} - Silakan masuk ke akun Anda</motion.p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 overflow-hidden"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800 font-medium">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div variants={itemVariants} className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 ml-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50/50 focus:bg-white text-gray-900 placeholder:text-gray-400"
                  placeholder="name@email.com"
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 ml-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 pr-12 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50/50 focus:bg-white text-gray-900 placeholder:text-gray-400"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>

              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
              >
                {isLoading ? 'Memproses...' : 'Masuk ke Dashboard'}
              </motion.button>

              <motion.div variants={itemVariants} className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-gray-400 font-medium">ATAU</span>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Link
                  to="/login/qr"
                  className="w-full bg-slate-50 hover:bg-slate-100 text-gray-700 font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 border border-gray-200 active:scale-[0.98]"
                >
                  <QrCode className="w-5 h-5 text-blue-600" />
                  Login QR Code
                </Link>
              </motion.div>
            </form>

            {/* Demo Accounts Panel */}
            {isDemo && (
              <motion.div variants={itemVariants} className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-600 mb-4 text-center font-bold">
                  🚀 Cepat Masuk (Mode Demo):
                </p>
                
                <div className="space-y-4">
                  <motion.div variants={itemVariants}>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider mb-2 ml-1">Staff / Admin</p>
                    <div className="grid grid-cols-4 gap-2">
                      {DEMO_ACCOUNTS.slice(0, 8).map((account, idx) => (
                        <motion.button
                          key={account.email}
                          variants={itemVariants}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => handleDemoLogin(account.email)}
                          className={`${account.color} hover:brightness-110 text-white text-[10px] font-black py-2 px-1 rounded-xl shadow-sm`}
                          title={account.label}
                        >
                          {account.label.substring(0, 3)}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider mb-2 ml-1">Pelajar / Orang Tua</p>
                    <div className="grid grid-cols-2 gap-2">
                      {DEMO_ACCOUNTS.slice(8).map((account, idx) => (
                        <motion.button
                          key={account.email}
                          variants={itemVariants}
                          transition={{ delay: 0.4 + idx * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => handleDemoLogin(account.email)}
                          className={`${account.color} hover:brightness-110 text-white text-[11px] font-bold py-2.5 px-3 rounded-xl shadow-sm flex flex-col items-center`}
                        >
                          <span>{account.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
            
            <motion.div variants={itemVariants} className="mt-10 text-center">
              <Link to="/" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1 group">
                <motion.span className="inline-block" whileHover={{ x: -3 }}>←</motion.span> Kembali ke Beranda
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Right Panel - Welcome Screen (Image) */}
      <motion.div 
        variants={sidePanelVariants('right')}
        initial="hidden"
        animate="visible"
        className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 items-center justify-center p-2 xl:p-6"
      >
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px]"
          ></motion.div>
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 12, repeat: Infinity, delay: 1 }}
            className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-100/40 rounded-full blur-[80px]"
          ></motion.div>
        </div>
        
        <div className="relative z-10 w-full max-w-3xl text-center flex flex-col items-center justify-center">
          {/* Main Visual */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
            className="relative inline-block mb-2 group"
          >
            {/* Decals/Floating elements */}
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition-colors"></div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl group-hover:bg-indigo-600/20 transition-colors"></div>
            
            <motion.img 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              src={settings.heroImage || '/images/ppdb.png'} 
              alt="Welcome to Pesantren" 
              className="relative w-full h-auto max-h-[55vh] object-contain rounded-2xl drop-shadow-[0_15px_40px_rgba(37,99,235,0.12)] transform transition-all duration-500 group-hover:scale-[1.01]"
              loading="eager"
              fetchPriority="high"
            />
            
            {/* Floating Info Boxes - Positioned on sides */}
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="absolute -left-4 top-2/3 -translate-y-1/2 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-gray-100 hidden xl:block"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900 text-xs">Kurikulum Modern</p>
                  <p className="text-gray-500 text-[10px]">Industri IT</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="absolute -right-4 top-2/3 -translate-y-1/2 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-gray-100 hidden xl:block"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900 text-xs">Akhlak Rabbani</p>
                  <p className="text-gray-500 text-[10px]">Generasi Sholeh</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-xl mx-auto space-y-3"
          >
            <motion.h1 variants={itemVariants} className="text-2xl font-extrabold text-gray-900 tracking-tight">
              {settings.heroTitle || 'Mencetak Generasi IT Rabbani'}
            </motion.h1>
            <motion.p variants={itemVariants} className="text-sm text-gray-500 leading-relaxed font-medium">
              {settings.heroSubtitle || 'Lembaga pendidikan yang mengintegrasikan teknologi informasi (IT) dan pendidikan agama (Pesantren).'}
              {programListText}
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex items-center justify-center gap-4 pt-2">
              <div className="flex -space-x-3 overflow-hidden">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ y: -5 }}
                    className="inline-block h-10 w-10 rounded-full ring-4 ring-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-gray-400"
                  >
                    S{i}
                  </motion.div>
                ))}
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="flex items-center justify-center h-10 w-10 rounded-full ring-4 ring-white bg-blue-600 text-[10px] font-bold text-white"
                >
                  +100
                </motion.div>
              </div>
              <div className="h-10 w-px bg-gray-200"></div>
              <p className="text-sm text-gray-500 font-medium">Bergabung dengan rincian santri lainnya</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
