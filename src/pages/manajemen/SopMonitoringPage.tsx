import { CheckCircle2 } from 'lucide-react';
import SopMonitoringPanel from '../../components/SopMonitoringPanel';

export default function SopMonitoringPage() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1 px-2 bg-white/20 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                Admin Dashboard
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Monitoring SOP</h1>
            <p className="text-rose-100 text-sm mt-1">Pantau kedisiplinan dan checklist harian staf seluruh divisi</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-4 py-2 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-semibold">Real-time Tracker</span>
             </div>
          </div>
        </div>
      </div>

      {/* Main Monitoring Panel */}
      <SopMonitoringPanel />
    </div>
  );
}
