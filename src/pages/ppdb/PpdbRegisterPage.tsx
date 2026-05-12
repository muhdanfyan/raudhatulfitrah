import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';
import { 
  AlertCircle, Eye, EyeOff, BookOpen, GraduationCap, 
  Sparkles, ChevronLeft, Mail, Lock, User, Phone, Users, Layers
} from 'lucide-react';
import { ProgramSantri, PROGRAM_SANTRI_OPTIONS } from '../../types/santri';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL, getPublicHeaders } from '../../services/api';

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

export default function PpdbRegisterPage() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [form, setForm] = useState({
    nama_lengkap: '',
    email: '',
    password: '',
    password_confirmation: '',
    no_hp: '',
    jenis_kelamin: 'L',
    program_santri: 'mondok' as ProgramSantri
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: [] });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setErrors({});

    try {
      const res = await fetch(`${API_URL}/ppdb/register`, {
        method: 'POST',
        headers: {
          ...getPublicHeaders(),
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (data.success) {
        alert(`Registrasi berhasil!\n\nNomor Pendaftaran: ${data.data.no_pendaftaran}\n\nSilakan login untuk melengkapi data.`);
        navigate('/ppdb/login');
      } else {
        if (data.errors) {
          setErrors(data.errors);
        }
        setError(data.message || 'Registrasi gagal');
      }
    } catch {
      setError('Terjadi kesalahan koneksi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col lg:flex-row overflow-hidden">
      {/* Left Panel - Register Form */}
      <motion.div 
        variants={sidePanelVariants('left')}
        initial="hidden"
        animate="visible"
        className="w-full lg:w-[520px] flex items-center justify-center p-6 lg:p-8 relative z-10 bg-white border-r border-gray-100 h-full overflow-y-auto"
      >
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md pt-8 pb-12"
        >
          <div className="text-center mb-8">
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
            <motion.h2 variants={itemVariants} className="text-2xl font-bold text-gray-900 mb-1">Daftar Akun PPDB ✍️</motion.h2>
            <motion.p variants={itemVariants} className="text-gray-500 text-sm">Buat akun untuk memulai pendaftaran santri baru</motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div variants={itemVariants} className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 ml-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="nama_lengkap"
                  value={form.nama_lengkap}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50/50 focus:bg-white text-sm"
                  placeholder="Nama Lengkap"
                  required
                />
                {errors.nama_lengkap && <p className="text-red-500 text-[10px] mt-0.5 ml-1">{errors.nama_lengkap[0]}</p>}
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 ml-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  Jenis Kelamin
                </label>
                <select
                  name="jenis_kelamin"
                  value={form.jenis_kelamin}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50/50 focus:bg-white text-sm"
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </motion.div>
            </div>

            <motion.div variants={itemVariants} className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 ml-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-gray-400" />
                Program Santri
              </label>
              <select
                name="program_santri"
                value={form.program_santri}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50/50 focus:bg-white text-sm"
              >
                {PROGRAM_SANTRI_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.program_santri && <p className="text-red-500 text-[10px] mt-0.5 ml-1">{errors.program_santri[0]}</p>}
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 ml-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50/50 focus:bg-white text-sm"
                placeholder="email@pendaftar.com"
                required
              />
              {errors.email && <p className="text-red-500 text-[10px] mt-0.5 ml-1">{errors.email[0]}</p>}
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 ml-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                WhatsApp
              </label>
              <input
                type="tel"
                name="no_hp"
                value={form.no_hp}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50/50 focus:bg-white text-sm"
                placeholder="08123456789"
                required
              />
              {errors.no_hp && <p className="text-red-500 text-[10px] mt-0.5 ml-1">{errors.no_hp[0]}</p>}
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div variants={itemVariants} className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 ml-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50/50 focus:bg-white text-sm"
                    placeholder="Minimal 6 karakter"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-[10px] mt-0.5 ml-1">{errors.password[0]}</p>}
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 ml-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                  Konfirmasi
                </label>
                <input
                  type="password"
                  name="password_confirmation"
                  value={form.password_confirmation}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50/50 focus:bg-white text-sm"
                  placeholder="Ulangi Password"
                  required
                />
              </motion.div>
            </div>

            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3.5 rounded-2xl transition-all disabled:opacity-50 shadow-lg shadow-green-500/20 mt-4"
            >
              {loading ? 'Memproses...' : 'Daftar Sekarang'}
            </motion.button>
          </form>

          <motion.div variants={itemVariants} className="mt-8 text-center space-y-4">
            <p className="text-gray-600 text-sm">
              Sudah punya akun?{' '}
              <Link to="/ppdb/login" className="text-green-600 font-bold hover:underline">
                Login di sini
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

      {/* Right Panel - Info Screen */}
      <motion.div 
        variants={sidePanelVariants('right')}
        initial="hidden"
        animate="visible"
        className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50/30 to-teal-50/50 items-center justify-center p-12"
      >
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
              className="relative w-full h-auto max-h-[50vh] object-contain rounded-[2.2rem] shadow-2xl transform transition-all duration-700 group-hover:scale-[1.02]"
            />
          </motion.div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-2xl mx-auto space-y-3 pt-2"
          >
            <motion.h1 variants={itemVariants} className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Langkah Menuju Masa Depan Digital
            </motion.h1>
            <motion.p variants={itemVariants} className="text-sm text-gray-500 leading-relaxed font-medium">
              Daftarkan diri Anda hari ini dan jadilah bagian dari ekosistem pendidikan yang memadukan teknologi canggih dengan nilai-nilai luhur keislaman.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex items-center justify-center gap-6 pt-6">
              <div className="text-center group/icon">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-2 text-green-600 group-hover/icon:bg-green-600 group-hover/icon:text-white transition-all transform group-hover/icon:rotate-6">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-gray-900">Beasiswa IT</p>
              </div>
              <div className="text-center group/icon">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-2 text-blue-600 group-hover/icon:bg-blue-600 group-hover/icon:text-white transition-all transform group-hover/icon:-rotate-6">
                  <BookOpen className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-gray-900">Kurikulum Unggul</p>
              </div>
              <div className="text-center group/icon">
                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-2 text-amber-600 group-hover/icon:bg-amber-600 group-hover/icon:text-white transition-all transform group-hover/icon:rotate-6">
                  <Sparkles className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-gray-900">Dibimbing Ahli</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
