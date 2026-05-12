import { ReactNode, useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { api, getHeaders, getToken } from '../services/api';
import { useTimeTracking, formatElapsedTime } from '../contexts/TimeTrackingContext';
import Avatar from './Avatar';
import NotificationDropdown from './NotificationDropdown';
import PushNotificationPrompt from './PushNotificationPrompt';
import {
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  KeyRound,
  Clock,
  Mic,
  MicOff
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';

const LUCIDE_ICONS: Record<string, any> = {
  LayoutDashboard: LucideIcons.LayoutDashboard,
  Users: LucideIcons.Users,
  User: LucideIcons.User,
  BookOpen: LucideIcons.BookOpen,
  BookMarked: LucideIcons.BookMarked,
  Building2: LucideIcons.Building2,
  ClipboardList: LucideIcons.ClipboardList,
  Settings: LucideIcons.Settings,
  ShoppingBag: LucideIcons.ShoppingBag,
  Cpu: LucideIcons.Cpu,
  Layers: LucideIcons.Layers,
  FileText: LucideIcons.FileText,
  Briefcase: LucideIcons.Briefcase,
  CreditCard: LucideIcons.CreditCard,
  CheckSquare: LucideIcons.CheckSquare,
  Heart: LucideIcons.Heart,
  Clock: LucideIcons.Clock,
  Award: LucideIcons.Award,
  Target: LucideIcons.Target,
  Shield: LucideIcons.Shield,
  KeyRound: LucideIcons.KeyRound,
  File: LucideIcons.File,
  FolderOpen: LucideIcons.FolderOpen,
  Activity: LucideIcons.Activity,
  Eye: LucideIcons.Eye,
  UserPlus: LucideIcons.UserPlus,
  DollarSign: LucideIcons.DollarSign,
  GraduationCap: LucideIcons.GraduationCap,
  Video: LucideIcons.Video,
  Map: LucideIcons.Map,
  Wallet: LucideIcons.Wallet,
  Package: LucideIcons.Package,
};

interface MenuItem {
  icon?: any;
  label: string;
  href: string;
  children?: MenuItem[];
}

interface LayoutProps {
  children: ReactNode;
}

const MenuDropdown = ({ item }: { item: MenuItem }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!item.children) {
    return (
      <a
        href={item.href}
        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors whitespace-nowrap"
      >
        {item.icon && <item.icon className="w-4 h-4" />}
        <span className="text-sm font-medium">{item.label}</span>
      </a>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors whitespace-nowrap ${isOpen ? 'bg-primary/5 text-primary' : ''}`}
      >
        {item.icon && <item.icon className="w-4 h-4" />}
        <span className="text-sm font-medium">{item.label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
          {item.children.map((child, index) => (
            <div key={index} className="px-2">
              {child.children ? (
                <MenuDropdown item={child} />
              ) : (
                <a
                  href={child.href}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary rounded-md"
                >
                  {child.label}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface MobileMenuProps {
  items: MenuItem[];
  user: any;
  logout: () => void;
  primaryColor: string;
  adjustColor: (color: string, amount: number) => string;
  onClose: () => void;
}

const MobileMenu = ({ items, user, logout, primaryColor, adjustColor, onClose }: MobileMenuProps) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  return (
    <div className="lg:hidden border-t border-white/20" style={{ backgroundColor: adjustColor(primaryColor, -10) }}>
      <div className="px-4 py-3 space-y-1 max-h-[70vh] overflow-y-auto">
        {items.map((item, index) => (
          <div key={index}>
            {item.children ? (
              <div>
                <button
                  onClick={() => toggleExpand(item.label)}
                  className="w-full flex items-center justify-between px-3 py-2 text-white rounded-lg hover:bg-white/10"
                >
                  <span className="flex items-center gap-2">
                    {item.icon && <item.icon className="w-5 h-5" />}
                    <span className="font-medium">{item.label}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${expandedItems.includes(item.label) ? 'rotate-180' : ''}`} />
                </button>
                {expandedItems.includes(item.label) && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((child, childIndex) => (
                      <a
                        key={childIndex}
                        href={child.href}
                        onClick={onClose}
                        className="block px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg text-sm"
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <a
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-2 text-white rounded-lg hover:bg-white/10"
              >
                {item.icon && <item.icon className="w-5 h-5" />}
                <span className="font-medium">{item.label}</span>
              </a>
            )}
          </div>
        ))}
        
        {/* User info & Logout */}
        <div className="pt-3 mt-3 border-t border-white/20">
          <div className="flex items-center gap-3 px-3 py-2 text-white">
            <Avatar src={user?.photo} name={user?.name} size="sm" className="border-2 border-white/30" />
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-white/70 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); onClose(); }}
            className="w-full flex items-center gap-2 px-3 py-2 mt-2 text-red-300 hover:bg-red-500/20 rounded-lg"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Keluar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const { isRunning, elapsedSeconds } = useTimeTracking();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isStandbyActive, setIsStandbyActive] = useState(false);
  const navigate = useNavigate();
  const recognitionRef = useRef<any>(null);

  const toggleStandby = () => {
    if (isStandbyActive) {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
      setIsStandbyActive(false);
    } else {
      setIsStandbyActive(true);
      startGlobalRecognition();
    }
  };

  const startGlobalRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Maaf, browser Anda tidak mendukung fitur suara.');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'id-ID';
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      console.log('🎤 AIMAN Standby Active (Background)...');
      setIsStandbyActive(true);
    };

    const triggerAiman = () => {
      if ((window as any)._aimanTriggering) return;
      (window as any)._aimanTriggering = true;
      
      console.log('🎯 Aiman Word Detected! Redirecting...');
      recognition.onend = null;
      try { recognition.stop(); } catch(e) {}
      setIsStandbyActive(false);
      navigate('/chat?voice=start');
      
      // Reset trigger guard after a delay
      setTimeout(() => { (window as any)._aimanTriggering = false; }, 2000);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (!event.results[i].isFinal) {
          interimTranscript += event.results[i][0].transcript;
        } else {
          // Check final results as well
          const result = event.results[i][0].transcript.toLowerCase();
          if (result.includes('aiman')) {
            triggerAiman();
            return;
          }
        }
      }
      
      const lowerInterim = interimTranscript.toLowerCase();
      if (lowerInterim.includes('aiman')) {
        triggerAiman();
      }
    };


    recognition.onerror = (event: any) => {
      console.error('🎤 Standby Recognition Error:', event.error);
      if (event.error === 'not-allowed') {
        setIsStandbyActive(false);
        alert('Izin mikrofon ditolak. Silakan aktifkan mikrofon di browser Anda.');
      }
      if (event.error === 'network') {
        console.warn('Network error in speech recognition. Will attempt restart if standby is active.');
      }
    };

    recognition.onend = () => {
      console.log('📴 Recognition Ended. Standby:', isStandbyActive);
      // Auto-restart logic if we are still in standby mode and not navigating away
      if (isStandbyActive && !window.location.pathname.includes('/chat')) {
        setTimeout(() => {
          if (isStandbyActive) {
            try { 
              recognition.start(); 
              console.log('🔄 Recognition Restarted');
            } catch(e) {
              console.error('Failed to restart recognition:', e);
            }
          }
        }, 500);
      }
    };

    try {
      recognition.start();
    } catch(e) {
      console.error('Recognition Start Failed:', e);
    }
  };

  // Global Wake Word Detection Cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Apply dynamic primary color
  const primaryColor = settings.warnaUtama || '#2563EB';
  const headerStyle = {
    backgroundColor: primaryColor,
    borderColor: adjustColor(primaryColor, -20),
  };

  function adjustColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
  }




  const [dynamicMenus, setDynamicMenus] = useState<MenuItem[] | null>(null);
  const [menuLoading, setMenuLoading] = useState(true);

  useEffect(() => {
    const fetchDynamicMenus = async () => {
      if (!user) {
        setMenuLoading(false);
        return;
      }
      
      setMenuLoading(true);
      try {
        if (!getToken()) {
          setMenuLoading(false);
          return;
        }

        const response = await fetch(`${api.getBaseUrl()}/api/me/menus`, {
          headers: getHeaders()
        });

        if (!response.ok) {
          setMenuLoading(false);
          return;
        }

        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          const mapMenuIcons = (items: any[]): MenuItem[] => {
            return items.map(item => ({
              label: item.label,
              href: item.href || '#',
              icon: item.icon ? (LUCIDE_ICONS[item.icon] || LucideIcons.File) : undefined,
              children: item.children ? mapMenuIcons(item.children) : undefined
            }));
          };
          setDynamicMenus(mapMenuIcons(data.data));
        } else {
          setDynamicMenus([]);
        }
      } catch (error) {
        console.error('Failed to fetch menus:', error);
        setDynamicMenus([]);
      } finally {
        setMenuLoading(false);
      }
    };

    fetchDynamicMenus();
  }, [user]);

  // Use only dynamic menus from database
  const currentMenuItems = dynamicMenus || [];
  
  // Filter menu items based on enabled features
  const filteredMenuItems = currentMenuItems.filter(item => {
    const label = item.label.toLowerCase();
    if (label === 'akademik' && !settings.features.akademik) return false;
    if (label === 'koperasi' && !settings.features.koperasi) return false;
    if (label === 'asrama' && !settings.features.asrama) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b sticky top-0 z-50 shadow-lg" style={headerStyle}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex-shrink-0 flex items-center gap-3">
                <a href="/" className="flex items-center gap-3">
                  <img src={settings.logo || 'https://pondokinformatika.id/logo.png'} alt="Logo" className="h-9 w-auto" />
                  <div className="hidden sm:block">
                    <span className="text-white font-bold text-lg block leading-tight">{settings.namaSingkat || 'PISANTRI'}</span>
                    <span className="text-white/70 text-xs block leading-tight">{settings.tagline || settings.namaPesantren}</span>
                  </div>
                </a>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-4">
              {isRunning && (
                <Link 
                  to="/santri/daily"
                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white text-sm font-medium animate-pulse"
                >
                  <Clock className="w-4 h-4" />
                  <span className="font-mono">{formatElapsedTime(elapsedSeconds)}</span>
                </Link>
              )}

              {/* AIMAN Standby Toggle */}
              {user && !window.location.pathname.includes('/chat') && (
                <button
                  onClick={toggleStandby}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isStandbyActive 
                      ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-300' 
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                  title={isStandbyActive ? "AIMAN Mendengarkan..." : "Aktifkan AIMAN Standby ('Aiman')"}
                >
                  {isStandbyActive ? (
                    <>
                      <div className="relative">
                        <Mic className="w-4 h-4 animate-pulse text-red-300" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-ping"></span>
                      </div>
                      <span className="hidden sm:inline">Aiman Standby</span>
                    </>
                  ) : (
                    <>
                      <MicOff className="w-4 h-4" />
                      <span className="hidden sm:inline">Panggil Aiman</span>
                    </>
                  )}
                </button>
              )}
              <div className="text-sm text-blue-100">
                {new Date().toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </div>

              <NotificationDropdown />

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                  style={{ backgroundColor: adjustColor(primaryColor, -15) }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = adjustColor(primaryColor, -30)}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = adjustColor(primaryColor, -15)}
                >
                  <Avatar
                    src={user?.photo}
                    name={user?.name}
                    size="sm"
                    className="border-2 border-white/30"
                  />
                  <div className="text-left hidden xl:block">
                    <p className="text-sm font-semibold text-white truncate max-w-32">{user?.name}</p>
                    <p className="text-xs text-white/70 capitalize">{user?.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-white/70" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-200">
                    {user?.role !== 'santri' && user?.role !== 'ortu' && (
                      <>
                        <a
                          href="/profile"
                          className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          <span className="text-sm font-medium">Profil Saya</span>
                        </a>
                        <a
                          href="/change-password"
                          className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <KeyRound className="w-4 h-4" />
                          <span className="text-sm font-medium">Ganti Password</span>
                        </a>
                        <div className="border-t border-gray-100 my-1"></div>
                      </>
                    )}
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">Keluar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-white hover:bg-primary-dark p-2 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <MobileMenu 
            items={filteredMenuItems} 
            user={user} 
            logout={logout}
            primaryColor={primaryColor}
            adjustColor={adjustColor}
            onClose={() => setMobileMenuOpen(false)}
          />
        )}
      </header>

      <nav className="hidden lg:block bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-1 h-12">
            {filteredMenuItems.map((item, index) => (
              <MenuDropdown key={index} item={item} />
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">{children}</main>
      
      <PushNotificationPrompt />
    </div>
  );
}
