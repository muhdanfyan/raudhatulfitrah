import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Sparkles } from 'lucide-react';

const FloatingChatButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  // Only show on landing page-like routes
  const isLandingPage = location.pathname === '/' || location.pathname === '/beranda' || location.pathname === '';

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling 100px
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial scroll
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isLandingPage) return null;

  return (
    <div 
      className={`fixed bottom-6 right-6 z-[60] transition-all duration-700 transform ${
        isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-90 pointer-events-none'
      }`}
    >
      <Link
        to="/chat"
        className="group relative flex items-center justify-center p-[2px] rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:shadow-[0_25px_60px_rgba(37,99,235,0.4)] hover:scale-110 active:scale-95 transition-all duration-500"
      >
        {/* Animated Glow effect */}
        <div className="absolute -inset-2 bg-gradient-to-tr from-blue-400 via-purple-400 to-indigo-400 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-700 animate-pulse"></div>
        
        {/* Main Button Body - Using Glassmorphism */}
        <div className="relative flex items-center gap-2 px-4 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/30 text-white font-bold shadow-inner overflow-hidden">
          {/* Shine effect that moves on hover */}
          <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shine" />

          {/* Stylized "fi" Logo */}
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md border border-white/40 group-hover:rotate-[360deg] transition-transform duration-1000 ease-in-out">
            <span className="text-xl font-black italic tracking-tighter leading-none" style={{ fontFamily: '"Inter", sans-serif' }}>fi</span>
          </div>
          
          <div className="flex flex-col">
            <span className="max-w-0 overflow-hidden group-hover:max-w-[140px] transition-all duration-700 ease-in-out whitespace-nowrap text-[10px] uppercase tracking-[0.2em] font-black text-blue-100/70">
              AI ASSISTANT
            </span>
            <span className="max-w-0 overflow-hidden group-hover:max-w-[140px] transition-all duration-700 ease-in-out whitespace-nowrap text-sm font-bold tracking-tight">
              Tanya Pesantren
            </span>
          </div>
          
          <div className="relative flex items-center justify-center ml-1">
            <MessageSquare className="w-5 h-5 group-hover:scale-0 group-hover:opacity-0 transition-all duration-500" />
            <Sparkles className="w-5 h-5 absolute scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 text-amber-300 transition-all duration-500 delay-100" />
          </div>
        </div>

        {/* Pulsing border ornament */}
        <div className="absolute -inset-1 border-2 border-white/20 rounded-full animate-ping-slow pointer-events-none"></div>
      </Link>
      
      <style>{`
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes shine {
          100% { left: 125%; }
        }
        .animate-ping-slow {
          animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-shine {
          animation: shine 0.8s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default FloatingChatButton;
