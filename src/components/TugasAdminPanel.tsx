import { useState, useEffect, useCallback } from 'react';
import { 
  AlertCircle, Clock, CheckCircle, PlayCircle, XCircle,
  ChevronDown, ChevronUp, Loader2, Target, Calendar
} from 'lucide-react';
import { API_URL, getHeaders } from '../services/api';

interface TugasAdmin {
  id: number;
  jabatan_id: number;
  proker_id?: number;
  judul_tugas: string;
  deskripsi?: string;
  deadline?: string;
  prioritas: 'rendah' | 'normal' | 'tinggi' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  proker_nama?: string;
  created_by_name?: string;
  assigned_to_name?: string;
  created_at: string;
}

interface TugasAdminPanelProps {
  jabatanName: string;
  title?: string;
}

const priorityColors = {
  rendah: 'bg-gray-100 text-gray-600 border-gray-200',
  normal: 'bg-blue-100 text-blue-700 border-blue-200',
  tinggi: 'bg-orange-100 text-orange-700 border-orange-200',
  urgent: 'bg-red-100 text-red-700 border-red-200 animate-pulse',
};

const statusIcons = {
  pending: Clock,
  in_progress: PlayCircle,
  completed: CheckCircle,
  cancelled: XCircle,
};

const statusColors = {
  pending: 'text-yellow-600',
  in_progress: 'text-blue-600',
  completed: 'text-emerald-600',
  cancelled: 'text-gray-400',
};

export default function TugasAdminPanel({ jabatanName, title }: TugasAdminPanelProps) {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<TugasAdmin[]>([]);
  const [expanded, setExpanded] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/tugas-divisi/tugas/${jabatanName}`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setTasks(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching admin tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [jabatanName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await fetch(`${API_URL}/tugas-divisi/tugas/${taskId}/status`, {
        method: 'PUT',
        headers: { ...getHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchData();
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return null; // Don't show if no tasks
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div 
        className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{title || 'Tugas dari Admin'}</h3>
              <p className="text-white/70 text-sm">{tasks.length} tugas aktif</p>
            </div>
          </div>
          <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
            {expanded ? <ChevronUp className="w-5 h-5 text-white" /> : <ChevronDown className="w-5 h-5 text-white" />}
          </button>
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="p-4 space-y-3">
          {tasks.map((task) => {
            const StatusIcon = statusIcons[task.status];
            const daysLeft = task.deadline ? getDaysUntilDeadline(task.deadline) : null;
            const isOverdue = daysLeft !== null && daysLeft < 0;
            const isUrgent = task.prioritas === 'urgent' || (daysLeft !== null && daysLeft <= 1);

            return (
              <div 
                key={task.id}
                className={`p-4 rounded-xl border ${isUrgent ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-gray-50'} transition-all`}
              >
                <div className="flex items-start gap-3">
                  <StatusIcon className={`w-5 h-5 mt-0.5 ${statusColors[task.status]}`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-gray-900">{task.judul_tugas}</h4>
                        {task.proker_nama && (
                          <p className="text-xs text-indigo-600 flex items-center gap-1 mt-0.5">
                            <Target className="w-3 h-3" />
                            {task.proker_nama}
                          </p>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${priorityColors[task.prioritas]}`}>
                        {task.prioritas}
                      </span>
                    </div>

                    {task.deskripsi && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{task.deskripsi}</p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {task.deadline && (
                          <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-bold' : ''}`}>
                            <Calendar className="w-3 h-3" />
                            {isOverdue ? 'Overdue!' : `${daysLeft} hari lagi`}
                          </span>
                        )}
                        {task.created_by_name && (
                          <span>dari {task.created_by_name}</span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {task.status !== 'completed' && task.status !== 'cancelled' && (
                        <div className="flex gap-1">
                          {task.status === 'pending' && (
                            <button
                              onClick={() => handleStatusChange(task.id, 'in_progress')}
                              className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                            >
                              Mulai
                            </button>
                          )}
                          {task.status === 'in_progress' && (
                            <button
                              onClick={() => handleStatusChange(task.id, 'completed')}
                              className="px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200"
                            >
                              Selesai
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
