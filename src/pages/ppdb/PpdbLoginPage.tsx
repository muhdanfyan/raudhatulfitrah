import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';
import { 
  AlertCircle, Eye, EyeOff, BookOpen, GraduationCap, 
  Sparkles, ChevronLeft, Mail, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL, getPublicHeaders, TENANT_ID } from '../../services/api';

// Animation Variants
const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants: any = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

const sidePanelVariants = (direction: 'left' | 'right'): any => ({
  hidden: { x: direction === 'left' ? -50 : 50, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: "easeOut" }
  }
});

export default function PpdbLoginPage() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log(`[PpdbLogin] Logging in to ${API_URL}/ppdb/login for email: ${email} | Tenant: ${TENANT_ID}`);
      const res = await fetch(`${API_URL}/ppdb/login`, {
        method: 'POST',
        headers: {
          ...getPublicHeaders(),
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });
      console.log(`[PpdbLogin] Login Response: ${res.status}`);

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('ppdb_token', data.data.token);
        localStorage.setItem('pisantri_token', data.data.token); // Shared compatibility
        localStorage.setItem('ppdb_user', JSON.stringify(data.data.ppdb));
        navigate('/ppdb/dashboard');
      } else {
        setError(data.message || 'Email atau password salah');
      }
    } catch {
      setError('Terjadi kesalahan koneksi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col lg:flex-row overflow-hidden">
      {/* Left Panel - Login Form */}
      <motion.div 
        variants={sidePanelVariants('left')}
        initial="hidden"
        animate="visible"
        className="w-full lg:w-[480px] flex items-center justify-center p-6 lg:p-8 relative z-10 bg-white border-r border-gray-100 h-full overflow-y-auto"
      >
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-sm"
        >
          <div className="text-center mb-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-block mb-4"
            >
              <Link to="/ppdb">
                <img 
                  src={settings.logo || '/logo.png'} 
                  alt="Logo" 
                  className="h-16 mx-auto" 
                />
              </Link>
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-2xl font-bold text-gray-900 mb-1">Login PPDB 🎓</motion.h2>
            <motion.p variants={itemVariants} className="text-gray-500 text-sm">Masuk untuk mengelola pendaftaran santri</motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={itemVariants} className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 ml-1 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                Email Pendaftar
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50/50 focus:bg-white text-gray-900 placeholder:text-gray-400"
                placeholder="email@pendaftar.com"
                required
              />
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 ml-1 flex items-center gap-2">
                <Lock className="w-4 h-4 text-gray-400" />
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 pr-12 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50/50 focus:bg-white text-gray-900 placeholder:text-gray-400"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
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
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3.5 rounded-2xl transition-all disabled:opacity-50 shadow-lg shadow-green-500/20"
            >
              {loading ? 'Memproses...' : 'Masuk ke Dashboard PPDB'}
            </motion.button>
          </form>

          <motion.div variants={itemVariants} className="mt-6 text-center space-y-3">
            <p className="text-gray-600 text-sm">
              Belum punya akun pendaftar?{' '}
              <Link to="/ppdb/register" className="text-green-600 font-bold hover:underline">
                Daftar Sekarang
              </Link>
            </p>
            <div className="pt-2">
              <Link to="/ppdb" className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-1 group">
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Kembali ke PPDB
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Right Panel - Welcome Screen */}
      <motion.div 
        variants={sidePanelVariants('right')}
        initial="hidden"
        animate="visible"
        className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50/30 to-teal-50/50 items-center justify-center p-12"
      >
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-green-100/50 rounded-full blur-[100px]"
          ></motion.div>
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 12, repeat: Infinity, delay: 1 }}
            className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-teal-100/40 rounded-full blur-[80px]"
          ></motion.div>
        </div>
        
        <div className="relative z-10 w-full max-w-3xl text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
            className="relative inline-block mb-6 group"
          >
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-green-600/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-emerald-600/10 rounded-full blur-3xl"></div>
            
            <motion.img 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              src={settings.ppdbHeroImage || '/images/ppdb.png'} 
              alt="PPDB Poster" 
              className="relative w-full h-auto max-h-[50vh] object-contain rounded-[2.5rem] shadow-2xl shadow-green-900/10 transform transition-all duration-700 group-hover:scale-[1.02]"
            />
          </motion.div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-2xl mx-auto space-y-2 pt-2"
          >
            <motion.h1 variants={itemVariants} className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Ayo Jadi Generasi IT Rabbani!
            </motion.h1>
            <motion.p variants={itemVariants} className="text-sm text-gray-500 leading-relaxed font-medium">
              Lengkapi berkas pendaftaran Anda dan bergabunglah bersama ratusan santri lainnya di Pesantren Teknologi Wahdah Islamiyah.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex items-center justify-center gap-6 pt-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-2 text-green-600">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-gray-900">Pendidikan Berkah</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-2 text-blue-600">
                  <BookOpen className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-gray-900">Skill Masa Depan</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-2 text-amber-600">
                  <Sparkles className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-gray-900">Fasilitas Nyaman</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
