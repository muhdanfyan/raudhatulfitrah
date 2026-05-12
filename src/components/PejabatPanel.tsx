import { getStudentPhotoUrl } from '../utils/imageUtils';

interface Pejabat {
  nama_lengkap_santri: string;
  foto_santri?: string;
  nama_jabatan: string;
}

interface PejabatPanelProps {
  pejabat: Pejabat[];
  title?: string;
  layout?: 'grid' | 'vertical' | 'horizontal';
  isHalf?: boolean;
}

export default function PejabatPanel({ 
  pejabat, 
  title = 'Panel Pengurus',
  layout = 'grid',
  isHalf = false
}: PejabatPanelProps) {
  if (!pejabat || pejabat.length === 0) return null;

  // Header Component - Centered
  const PanelHeader = () => (
    <div className={`flex flex-col items-center justify-center text-center ${isHalf ? 'mb-4' : 'mb-10'}`}>
      <div className={`inline-flex items-center gap-3 px-4 py-1.5 bg-primary/5 rounded-full border border-primary/10 mb-2 ${isHalf ? 'scale-75 origin-top' : 'mb-3'}`}>
        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping"></div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-dark">Sistem Manajemen</span>
      </div>
      <h2 className={`${isHalf ? 'text-lg' : 'text-2xl md:text-3xl'} font-black text-gray-900 tracking-tight`}>{title}</h2>
      <div className={`h-1 w-12 bg-primary mt-2 ${isHalf ? 'h-0.5 w-8' : 'mt-3'}`}></div>
    </div>
  );

  if (layout === 'horizontal') {
    return (
      <div className={`bg-white shadow-sm border border-gray-100 relative overflow-hidden h-full ${isHalf ? 'rounded-2xl p-4' : 'rounded-[3rem] p-8 md:p-10'}`}>
        {/* Decorative background elements */}
        {!isHalf && (
          <>
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl opacity-50"></div>
          </>
        )}
        
        <PanelHeader />
        <div className="flex flex-wrap gap-[2px] justify-center items-center relative z-10">
          {pejabat.map((p, index) => (
            <div 
              key={index} 
              className={`group relative overflow-hidden rounded-none transition-all duration-500 opacity-85 hover:opacity-100 hover:scale-[1.05] cursor-pointer active:scale-95 aspect-square ${isHalf ? 'w-[60px]' : 'w-full min-w-[110px] max-w-[140px]'}`}
            >
              {/* Main Photo */}
              <img
                src={getStudentPhotoUrl(p.foto_santri)}
                alt={p.nama_lengkap_santri}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-125"
                onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nama_lengkap_santri)}&background=random`; }}
              />
              
              {/* Gradient Overlay - hidden on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-0 transition-all duration-500"></div>

              {/* Text Overlay */}
              <div className={`absolute inset-x-0 bottom-0 p-2 text-center ${isHalf ? 'p-1' : ''}`}>
                <h3 className={`font-bold text-white leading-tight drop-shadow-md line-clamp-1 ${isHalf ? 'text-[6px]' : 'text-[10px] mb-1'}`}>
                  {p.nama_lengkap_santri}
                </h3>
                {!isHalf && (
                  <span className="inline-flex px-1.5 py-0.5 bg-white/20 backdrop-blur-md text-white uppercase text-[6px] font-black tracking-widest rounded-md border border-white/20">
                    {p.nama_jabatan}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (layout === 'vertical') {
    return (
      <div className={`bg-white shadow-sm border border-gray-100 h-full ${isHalf ? 'rounded-2xl p-4' : 'rounded-[3rem] p-8 md:p-10'}`}>
        <PanelHeader />
        <div className="max-w-md mx-auto space-y-2">
          {pejabat.map((p, index) => (
            <div key={index} className="flex items-center gap-3 group p-2 rounded-none hover:bg-gray-50 transition-all border border-transparent opacity-85 hover:opacity-100">
              <div className="relative flex-shrink-0">
                <img
                  src={getStudentPhotoUrl(p.foto_santri)}
                  alt={p.nama_lengkap_santri}
                  className={`${isHalf ? 'w-10 h-10' : 'w-16 h-16'} rounded-none object-cover border-none transition-all`}
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nama_lengkap_santri)}&background=random`; }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-gray-900 truncate group-hover:text-primary transition-colors ${isHalf ? 'text-xs' : 'text-base'}`}>{p.nama_lengkap_santri}</h3>
                <span className={`inline-block px-1.5 py-0.5 bg-primary/10 text-primary uppercase font-black tracking-widest rounded-md ${isHalf ? 'text-[6px]' : 'text-[8px] mt-1'}`}>
                  {p.nama_jabatan}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white relative overflow-hidden h-full flex flex-col ${isHalf ? 'rounded-3xl p-4' : 'rounded-[3rem] p-8 md:p-12'}`}>
      {/* Dynamic Background Pattern - More subtle and premium */}
      {!isHalf && (
        <>
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-indigo-500/5 to-transparent blur-3xl opacity-30"></div>
        </>
      )}

      <PanelHeader />
      
      <div className="flex flex-wrap gap-2 lg:gap-3 bg-white/50 relative z-10 max-w-6xl mx-auto w-full justify-center items-center py-4">
        {pejabat.map((p, index) => (
          <div 
            key={index} 
            className={`group relative overflow-hidden transition-all duration-700 cursor-pointer bg-white flex flex-col aspect-square shadow-sm hover:shadow-xl rounded-2xl border border-gray-100 ${isHalf ? 'w-[calc(50%-8px)] sm:w-[calc(33.33%-12px)]' : 'w-[calc(48%-8px)] md:w-[calc(33.33%-12px)] lg:w-[calc(19%-12px)]'}`}
          >
            {/* Main Photo Container - Strictly Square */}
            <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
              <img
                src={getStudentPhotoUrl(p.foto_santri)}
                alt={p.nama_lengkap_santri}
                className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1 filter group-hover:brightness-110"
                onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nama_lengkap_santri)}&background=random`; }}
              />
              
              {/* Premium Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent opacity-80 group-hover:opacity-40 transition-all duration-700"></div>

              {/* Enhanced Shine Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-1000 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transform ease-out px-10"></div>
            </div>

            {/* Premium Text Overlay */}
            <div className={`absolute inset-x-0 bottom-0 text-center ${isHalf ? 'p-2' : 'p-3 md:p-4'} transform transition-all duration-700 group-hover:-translate-y-1`}>
              <h4 className={`font-black text-white leading-tight drop-shadow-lg line-clamp-1 transition-all duration-500 tracking-tight ${isHalf ? 'text-[10px]' : 'text-xs md:text-sm mb-1'}`}>
                {p.nama_lengkap_santri}
              </h4>
              <div className={`inline-flex items-center justify-center ${isHalf ? 'px-1.5 py-0.5 text-[5px]' : 'px-2 py-0.5 text-[7px] md:text-[8px]'} bg-white/10 backdrop-blur-md text-white/90 uppercase font-black tracking-[0.15em] rounded-md border border-white/20 group-hover:bg-primary group-hover:border-primary group-hover:text-gray-900 transition-all duration-500 shadow-sm`}>
                {p.nama_jabatan}
              </div>
            </div>

            {/* Active Indicator */}
            <div className={`absolute z-10 ${isHalf ? 'top-2 right-2' : 'top-3 right-3'}`}>
              <div className="relative">
                <div className="absolute flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></div>
                <div className={`relative bg-emerald-500 rounded-full border border-white/50 ${isHalf ? 'w-1.5 h-1.5' : 'w-2 h-2'}`}></div>
              </div>
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 ring-1 ring-inset ring-white/20 group-hover:ring-primary/50 transition-all duration-500 rounded-2xl"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
