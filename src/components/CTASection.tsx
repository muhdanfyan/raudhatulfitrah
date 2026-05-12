import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';

const CTASection: React.FC = () => {
  return (
    <motion.section 
      className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white relative overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      style={{
        background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 50%, #7C3AED 100%)'
      }}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/20"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, (Math.random() - 0.5) * 20, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div 
        className="relative max-w-4xl mx-auto px-4 text-center"
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.7 }}
      >
        <motion.h2 
          className="text-3xl md:text-5xl font-bold mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Siap Membawa Pesantren Anda ke Era Digital?
        </motion.h2>
        <motion.p 
          className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Bergabunglah dengan ratusan pesantren yang telah bertransformasi digital bersama PISANTRI.
          Mulai perjalanan digitalisasi pesantren Anda hari ini!
        </motion.p>
        
        <motion.div 
          className="flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <motion.div
            whileHover={{ 
              y: -5, 
              scale: 1.05,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.25)"
            }}
            whileTap={{ scale: 0.98 }}
            className="transform transition-all"
          >
            <Link to="/ppdb" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-xl font-bold hover:bg-primary/5 transition-all shadow-lg shadow-blue-500/30">
              Daftar Sekarang
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </Link>
          </motion.div>
          
          <motion.div
            whileHover={{ 
              y: -5, 
              scale: 1.05,
              boxShadow: "0 20px 25px -5px rgba(255, 255, 255, 0.2)"
            }}
            whileTap={{ scale: 0.98 }}
            className="transform transition-all"
          >
            <Link to="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">
              <Play className="w-5 h-5" />
              Coba Demo Gratis
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

export default CTASection;