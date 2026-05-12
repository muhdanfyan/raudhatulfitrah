import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, Play, Zap } from 'lucide-react';
import { getStaticAsset } from '../utils/imageUtils';

interface HeroSectionProps {
  stats: { value: string; label: string; icon: React.ElementType }[];
}

const HeroSection: React.FC<HeroSectionProps> = ({ stats }) => {
  return (
    <motion.header 
      className="relative min-h-[90vh] flex items-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={getStaticAsset('hero-main.png', 'features', { width: 1920, quality: 80 })}
          alt="Islamic Education"
          className="w-full h-full object-cover"
        />
        
        {/* Animated gradient overlay */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/60"
          style={{
            background: 'linear-gradient(90deg, rgba(17,24,39,0.95) 0%, rgba(17,24,39,0.8) 50%, rgba(17,24,39,0.6) 100%)',
            backgroundBlendMode: 'multiply',
          }}
        ></div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 10 + 2}px`,
              height: `${Math.random() * 10 + 2}px`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() > 0.5 ? 10 : -10, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group"
        >
          <motion.div
            whileHover={{ x: -5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.div>
          Kembali ke Beranda
        </Link>

        <motion.div 
          className="max-w-4xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {/* Animated Badge */}
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light/20 border border-blue-400/30 rounded-full text-blue-300 text-sm font-medium mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="w-4 h-4" />
            </motion.div>
            Solusi Digitalisasi Pesantren #1 di Indonesia
          </motion.div>

          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.7 }}
          >
            Transformasi{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 animate-pulse">
              Digital
            </span>{' '}
            untuk Pesantren Modern
          </motion.h1>

          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed max-w-3xl"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            PISANTRI mengubah cara pesantren beroperasi — dari pencatatan hafalan, presensi, keuangan, hingga pembelajaran online — semua terintegrasi dalam{' '}
            <span className="text-white font-semibold">satu platform powerful</span>.
          </motion.p>

          <motion.div 
            className="flex flex-wrap gap-4 mb-12"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <motion.div 
              whileHover={{ 
                y: -5, 
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link 
                to="/ppdb" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/25"
              >
                Mulai Sekarang
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </Link>
            </motion.div>
            
            <motion.div 
              whileHover={{ 
                y: -5, 
                boxShadow: "0 20px 25px -5px rgba(255, 255, 255, 0.1), 0 10px 10px -5px rgba(255, 255, 255, 0.04)" 
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
              >
                <Play className="w-5 h-5" />
                Login Demo
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust Badges */}
          <motion.div 
            className="flex flex-wrap items-center gap-6 text-gray-400 text-sm"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <motion.div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-gray-900"
                    whileHover={{ scale: 1.2, zIndex: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  ></motion.div>
                ))}
              </div>
              <span>500+ Santri Aktif</span>
            </div>
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              </motion.div>
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <Shield className="w-5 h-5 text-green-400" />
              </motion.div>
              <span>100% Aman</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Stats Cards (Desktop Only) */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-32 pb-8 hidden lg:block z-10">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div 
            className="grid grid-cols-4 gap-6"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.7 }}
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 text-center"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.5 + i * 0.1, duration: 0.4 }}
                whileHover={{ 
                  y: -10, 
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                  scale: 1.03
                }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default HeroSection;