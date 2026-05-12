import React, { useState, useEffect } from 'react';
import { MessageSquare, Copy, Check, RefreshCw, Send } from 'lucide-react';
import { api } from '../../services/api';

export default function WhatsappDailyReportPanel({ isHalf }: { isHalf?: boolean }) {
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await api.getWhatsappDailyReport();
      if (response.success) {
        setReport(response.data.report_text);
      }
    } catch (error) {
      console.error('Failed to fetch daily report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleCopy = () => {
    if (!report) return;
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-md ${isHalf ? 'min-h-[280px]' : 'min-h-[380px]'}`}>
      {/* Header */}
      <div className={`${isHalf ? 'p-4' : 'p-6'} border-b border-gray-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10`}>
        <div className="flex items-center gap-3">
          <div className={`${isHalf ? 'w-10 h-10' : 'w-12 h-12'} bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100`}>
            <MessageSquare className={`${isHalf ? 'w-5 h-5' : 'w-6 h-6'}`} />
          </div>
          <div>
            <h2 className={`${isHalf ? 'text-sm' : 'text-lg'} font-black text-gray-900 leading-tight flex items-center gap-2`}>
              Daily Report
              {!isHalf && <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full">WA Format</span>}
            </h2>
            {!isHalf && <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Automated Aggregation</p>}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <button 
            onClick={fetchReport}
            className={`${isHalf ? 'p-2' : 'p-2.5'} hover:bg-emerald-50 hover:text-emerald-600 rounded-xl text-gray-400 transition-all bg-gray-50 border border-gray-100 active:scale-90`}
            title="Refresh"
          >
            <RefreshCw className={`${isHalf ? 'w-4 h-4' : 'w-5 h-5'} ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button 
            onClick={handleCopy}
            disabled={!report || loading}
            className={`flex items-center gap-2 ${isHalf ? 'px-3 py-2' : 'px-5 py-2.5'} rounded-xl font-black text-[11px] uppercase tracking-wider transition-all active:scale-95 shadow-lg ${
              copied 
                ? 'bg-emerald-500 text-white shadow-emerald-200' 
                : 'bg-gray-900 text-white hover:bg-gray-800 shadow-gray-200'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                {!isHalf && "Copied!"}
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 stroke-[3]" />
                {!isHalf && "Copy Text"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className={`${isHalf ? 'p-4' : 'p-6'} flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30`}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-emerald-100 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-4 animate-pulse">Syncing Data</p>
          </div>
        ) : !report ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200 mx-2 shadow-sm">
             <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
               <MessageSquare className="w-8 h-8" />
             </div>
             <p className="text-gray-500 text-xs font-black uppercase tracking-widest">No Data Available</p>
          </div>
        ) : (
          <div className="relative group">
            <div className={`
              ${isHalf ? 'max-h-[180px] p-4 text-[10px]' : 'max-h-[260px] p-6 text-sm'} 
              overflow-y-auto custom-scrollbar bg-white rounded-3xl border border-gray-100 shadow-sm font-mono leading-relaxed text-gray-600
              scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent
            `}>
              <pre className="whitespace-pre-wrap font-mono selection:bg-emerald-500 selection:text-white">
                {report}
              </pre>
            </div>
            
            {/* Copy Overlay Hint */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-white/50 rounded-3xl"></div>
          </div>
        )}
      </div>
      
      {/* Footer Info */}
      {!isHalf && (
        <div className="px-8 py-3 bg-white border-t border-gray-50 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Live Database</span>
           </div>
           <div className="flex items-center gap-1 text-gray-300">
              <Send className="w-3 h-3" />
              <span className="text-[9px] font-medium italic">Ready to share</span>
           </div>
        </div>
      )}
    </div>
  );
}
