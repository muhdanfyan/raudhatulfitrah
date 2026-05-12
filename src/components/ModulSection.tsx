import { motion } from 'framer-motion';
import { Layers, Sparkles } from 'lucide-react';

interface Feature {
  icon: React.ElementType;
  title: string;
  desc: string;
}

interface FeatureGroup {
  title: string;
  color: string;
  features: Feature[];
}

interface ModulSectionProps {
  featureGroups: FeatureGroup[];
  getColorClasses: (color: string) => { 
    bg: string; 
    text: string; 
    border: string; 
    gradient: string 
  };
}

const ModulSection: React.FC<ModulSectionProps> = ({ 
  featureGroups, 
  getColorClasses 
}) => {
  // Variants for animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const thumbnailVariants = {
    initial: { 
      scale: 1, 
      y: 0,
      rotate: 0,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
    },
    whileHover: { 
      scale: 1.05, 
      y: -10,
      rotate: 1,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  // Generate unique keyframes for subtle background animations
  const generateFloatingAnimation = (index: number) => {
    const animations = [
      'float0', 'float1', 'float2', 'float3'
    ];
    return {
      animation: `${animations[index % 4]} 6s ease-in-out infinite`,
    };
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-blue-200/20 to-cyan-200/20"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              animation: `${['float0', 'float1', 'float2', 'float3'][i % 4]} 6s ease-in-out infinite`
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, (Math.random() - 0.5) * 30, 0],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: Math.random() * 4 + 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float0 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(10px, -10px) rotate(2deg); }
        }
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-10px, -15px) rotate(-2deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(15px, -5px) rotate(1deg); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-5px, -20px) rotate(-1deg); }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16 relative z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.div 
            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-lg shadow-blue-500/30"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 15 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <Layers className="w-5 h-5" />
            </motion.div>
            Ekosistem Digital Terlengkap
          </motion.div>
          
          <motion.h2 
            className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            30+ Modul Terintegrasi untuk Transformasi Total
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            Dari manajemen akademik, keuangan, hingga dakwah digital. Satu platform yang menghubungkan Kiai, Asatidz, Santri, dan Wali Santri dalam harmoni teknologi.
          </motion.p>
        </motion.div>

        <div className="space-y-12 relative z-10">
          {featureGroups.map((group, groupIndex) => {
            const colorClasses = getColorClasses(group.color);
            return (
              <motion.div
                key={groupIndex}
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1, duration: 0.6 }}
                data-aos="fade-up"
              >
                <div className="flex items-center justify-between mb-8">
                  <motion.h3
                    className={`text-2xl font-bold ${colorClasses.text} flex items-center gap-3`}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * groupIndex, duration: 0.6 }}
                  >
                    <span className={`w-4 h-4 rounded-full bg-gradient-to-r ${colorClasses.gradient}`}></span>
                    {group.title}
                  </motion.h3>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 * groupIndex, duration: 0.6 }}
                  >
                    <span className="text-lg text-gray-500 font-medium bg-gray-100 px-4 py-2 rounded-full">
                      {group.features.length} modul
                    </span>
                  </motion.div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {group.features.map((feature, featureIndex) => (
                    <motion.div
                      key={featureIndex}
                      className="group relative"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (groupIndex * 0.1) + (featureIndex * 0.05), duration: 0.5 }}
                    >
                      <motion.div
                        className={`relative bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-200 flex flex-col items-center transition-all duration-300 h-full overflow-hidden`}
                        whileHover={{
                          y: -10,
                          scale: 1.03,
                          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        style={{ minHeight: '180px' }}
                      >
                        {/* Animated background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses.bg}/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                        <motion.div
                          className={`relative w-16 h-16 rounded-full ${colorClasses.bg} flex items-center justify-center mb-4 flex-shrink-0 z-10`}
                          whileHover={{
                            scale: 1.15,
                            rotate: 10,
                            y: -5
                          }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        >
                          <motion.div
                            animate={{
                              y: [0, -5, 0],
                              rotate: [0, 5, 0]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatType: "reverse",
                              ease: "easeInOut"
                            }}
                          >
                            <feature.icon className={`w-8 h-8 ${colorClasses.text}`} />
                          </motion.div>
                        </motion.div>

                        <motion.h4
                          className="font-bold text-gray-900 mb-2 text-base z-10"
                          whileHover={{ y: -3, scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          {feature.title}
                        </motion.h4>

                        <motion.p
                          className="text-gray-500 text-sm flex-grow flex items-center z-10"
                          initial={{ opacity: 0.7 }}
                          whileHover={{ opacity: 1, y: -2 }}
                          transition={{ duration: 0.3 }}
                        >
                          {feature.desc}
                        </motion.p>
                      </motion.div>

                      {/* Glowing effect on hover */}
                      <div
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          boxShadow: `0 0 30px 5px ${colorClasses.bg.replace('bg-', '').replace('/10', '')}`
                        }}
                      />

                      {/* Tooltip-like effect */}
                      <motion.div
                        className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        whileHover={{ scale: 1.2, rotate: 15 }}
                        transition={{ type: "spring", stiffness: 600, damping: 10 }}
                      >
                        <Sparkles className="w-3 h-3" />
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ModulSection;