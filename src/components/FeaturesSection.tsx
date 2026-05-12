import { motion } from 'framer-motion';
import { Link, Layers, ChevronRight } from 'react-router-dom';
import { BookOpen, GraduationCap, Users, Briefcase, QrCode, CreditCard, Calendar, Heart, FileText, Bell, Shield, BarChart3, Target, Award, Monitor, Building2, ShoppingBag, Wallet, ClipboardList, Map, ScrollText, MessageSquare, DoorOpen, Package, Contact, Megaphone, UserPlus, Eye, Heart as HeartIcon, Megaphone as MegaphoneIcon, UserPlus as UserPlusIcon, Eye as EyeIcon, Briefcase as BriefcaseIcon, Shield as ShieldIcon, BarChart3 as BarChart3Icon, Target as TargetIcon, Award as AwardIcon, Monitor as MonitorIcon, Building2 as Building2Icon, ShoppingBag as ShoppingBagIcon, Wallet as WalletIcon, ClipboardList as ClipboardListIcon, Map as MapIcon, ScrollText as ScrollTextIcon, MessageSquare as MessageSquareIcon, DoorOpen as DoorOpenIcon, Package as PackageIcon, Contact as ContactIcon, Calendar as CalendarIcon, FileText as FileTextIcon, Bell as BellIcon, TrendingUp, Clock } from 'lucide-react';

interface Feature {
  icon: React.ElementType;
  title: string;
  desc: string;
  color: string;
  image: string;
}

interface AdditionalFeature {
  icon: React.ElementType;
  title: string;
  desc: string;
}

interface FeatureGroup {
  title: string;
  color: string;
  features: {
    icon: React.ElementType;
    title: string;
    desc: string;
  }[];
}

interface FeaturesSectionProps {
  mainFeatures: Feature[];
  additionalFeatures: AdditionalFeature[];
  featureGroups: FeatureGroup[];
  getColorClasses: (color: string) => { bg: string; text: string; border: string; gradient: string };
}

const cardVariants = {
  offscreen: {
    y: 30,
    opacity: 0,
  },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.1,
      duration: 0.8
    }
  }
};

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ 
  mainFeatures, 
  additionalFeatures, 
  featureGroups, 
  getColorClasses 
}) => {
  return (
    <div>
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.span 
              className="inline-block px-4 py-1 bg-primary/10 text-primary-dark rounded-full text-sm font-medium mb-4"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            >
              FITUR UNGGULAN
            </motion.span>
            <motion.h2 
              className="text-3xl md:text-5xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Semua yang Pesantren Butuhkan
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Platform lengkap dengan fitur-fitur powerful untuk mengelola pesantren modern
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.1 }}
            variants={{
              onscreen: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {mainFeatures.map((feature, index) => (
              <motion.div 
                key={index}
                className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-100"
                variants={cardVariants}
                whileHover={{ 
                  y: -10,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="relative h-48 overflow-hidden">
                  <motion.img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <motion.div 
                    className={`absolute bottom-4 left-4 w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-lg`}
                    whileHover={{ 
                      scale: 1.1, 
                      rotate: 5,
                    }}
                    transition={{ type: "spring", stiffness: 600, damping: 15 }}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </motion.div>
                </div>
                <div className="p-6">
                  <motion.h3 
                    className="text-xl font-bold text-gray-900 mb-3"
                    whileHover={{ x: 5 }}
                    transition={{ type: "tween", duration: 0.2 }}
                  >
                    {feature.title}
                  </motion.h3>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.span 
              className="inline-block px-4 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            >
              DAN MASIH BANYAK LAGI
            </motion.span>
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Fitur Pendukung Lengkap
            </motion.h2>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.1 }}
            variants={{
              onscreen: {
                transition: {
                  staggerChildren: 0.05
                }
              }
            }}
          >
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all text-center"
                variants={cardVariants}
                whileHover={{ 
                  y: -5,
                  scale: 1.02,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 5,
                    backgroundColor: "rgba(99, 102, 241, 0.1)"
                  }}
                  transition={{ type: "spring", stiffness: 600 }}
                >
                  <feature.icon className="w-7 h-7 text-primary" />
                </motion.div>
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Complete Feature List Section */}
      <section className="py-20" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-5 py-2 rounded-full text-sm font-semibold mb-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                <Layers className="w-4 h-4" />
              </motion.div>
              Ekosistem Digital Terlengkap
            </motion.div>
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              30+ Modul Terintegrasi untuk Transformasi Total
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Dari manajemen akademik, keuangan, hingga dakwah digital. Satu platform yang menghubungkan Kiai, Asatidz, Santri, dan Wali Santri dalam harmoni teknologi.
            </motion.p>
          </motion.div>

          <motion.div 
            className="space-y-4"
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.1 }}
            variants={{
              onscreen: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {featureGroups.map((group, groupIndex) => {
              const colorClasses = getColorClasses(group.color);
              return (
                <motion.div 
                  key={groupIndex}
                  className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 ${colorClasses.border} hover:shadow-md transition-all`}
                  variants={cardVariants}
                  whileHover={{ 
                    scale: 1.01,
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <motion.h3 
                      className={`text-lg font-bold ${colorClasses.text} flex items-center gap-2`}
                      whileHover={{ x: 3 }}
                    >
                      <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${colorClasses.gradient}`}></span>
                      {group.title}
                    </motion.h3>
                    <span className="text-sm text-gray-400">{group.features.length} fitur</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {group.features.map((feature, featureIndex) => (
                      <motion.div 
                        key={featureIndex} 
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        whileHover={{ 
                          backgroundColor: "#f9fafb",
                          scale: 1.02,
                        }}
                      >
                        <motion.div 
                          className={`w-8 h-8 ${colorClasses.bg} rounded-lg flex items-center justify-center flex-shrink-0`}
                          whileHover={{ 
                            scale: 1.1,
                            backgroundColor: "rgba(99, 102, 241, 0.1)"
                          }}
                        >
                          <feature.icon className={`w-4 h-4 ${colorClasses.text}`} />
                        </motion.div>
                        <div className="min-w-0">
                          <motion.span 
                            className="font-medium text-gray-900 text-sm block truncate"
                            whileHover={{ color: "#4f46e5" }}
                            transition={{ duration: 0.2 }}
                          >
                            {feature.title}
                          </motion.span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesSection;