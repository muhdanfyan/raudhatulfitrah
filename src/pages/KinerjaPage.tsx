import { useState, useEffect, useCallback } from 'react';
import { Plus, GripVertical, Trash2, Calendar, Flag, Loader2, X, Briefcase, ListTodo, Target, Users, TrendingUp, Edit2, FileText, Clock } from 'lucide-react';
import { api } from '../services/api';

interface Task {
  id_tugas: number;
  judul: string;
  deskripsi?: string;
  prioritas: 'low' | 'medium' | 'high';
  deadline?: string;
  column_id: number;
  proker_id?: number;
  proker_judul?: string;
  tipe_tugas?: 'harian' | 'pekanan';
  urutan: number;
}

interface Column {
  id: number;
  nama: string;
  warna: string;
  is_default: boolean;
  tasks: Task[];
}

interface Proker {
  id_proker: number;
  nama_proker: string;
  divisi_proker: number;
  divisi_proker_nama?: string;
  tgl_pelaksanaan: string;
  sasaran_proker: string;
  deskripsi_proker: string;
  status_proker: string;
  realisasi: string;
  proyeksi: string;
}

interface Jabatan {
  id_jabatan: number;
  nama_jabatan: string;
}

interface JobDesc {
  id: number;
  jabatan_id: number;
  jabatan_id_nama?: string;
  deskripsi: string;
  tanggung_jawab: string;
  wewenang: string;
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-red-100 text-red-700',
};

const statusColors: Record<string, string> = {
  'Terjadwal': 'bg-blue-100 text-blue-700',
  'Terlaksana': 'bg-green-100 text-green-700',
  'Dibatalkan': 'bg-red-100 text-red-700',
  'Dipending': 'bg-yellow-100 text-yellow-700',
};

const statusOptions = ['Terjadwal', 'Terlaksana', 'Dibatalkan', 'Dipending'];

const defaultProkerForm = {
  nama_proker: '',
  divisi_proker: '',
  tgl_pelaksanaan: '',
  sasaran_proker: '',
  deskripsi_proker: '',
  status_proker: 'Terjadwal',
  realisasi: '0',
  proyeksi: '',
};

const defaultJobDescForm = {
  jabatan_id: '',
  deskripsi: '',
  tanggung_jawab: '',
  wewenang: '',
};

export default function KinerjaPage() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [prokerList, setProkerList] = useState<Proker[]>([]);
  const [jabatanList, setJabatanList] = useState<Jabatan[]>([]);
  const [jobDescList, setJobDescList] = useState<JobDesc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tugas' | 'proker' | 'jobdesc'>('tugas');
  
  // Task modal state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState({ judul: '', deskripsi: '', prioritas: 'medium', deadline: '', tipe_tugas: 'harian', proker_id: '' });
  
  // Proker modal state
  const [showProkerModal, setShowProkerModal] = useState(false);
  const [editingProker, setEditingProker] = useState<Proker | null>(null);
  const [prokerForm, setProkerForm] = useState(defaultProkerForm);

  // JobDesc modal state
  const [showJobDescModal, setShowJobDescModal] = useState(false);
  const [editingJobDesc, setEditingJobDesc] = useState<JobDesc | null>(null);
  const [jobDescForm, setJobDescForm] = useState(defaultJobDescForm);
  
  const [saving, setSaving] = useState(false);
  const [canDeleteProker, setCanDeleteProker] = useState(true);

  const fetchPermissions = useCallback(async () => {
    try {
      const response = await api.get('/calendar/permissions');
      if (response.status === 'success') {
        const restrictedRoles = ['akademik', 'asrama', 'pembinaan'];
        setCanDeleteProker(!restrictedRoles.includes(response.data.role?.toLowerCase()));
      }
    } catch (err) {
      console.error('Failed to fetch permissions');
    }
  }, []);

  const fetchBoard = useCallback(async () => {
    try {
      const json: any = await api.get('/api/kanban');
      if (json.success) {
        setColumns(json.data.columns || []);
      }
    } catch (err) {
      console.error('Error fetching kanban:', err);
    }
  }, []);

  const fetchProker = useCallback(async () => {
    try {
      const json: any = await api.get('/api/crud/proker?per_page=50');
      if (json.success) {
        setProkerList(json.data?.items || []);
      }
    } catch (err) {
      console.error('Error fetching proker:', err);
    }
  }, []);

  const fetchJabatan = useCallback(async () => {
    try {
      const json: any = await api.get('/api/crud/jabatan?per_page=50');
      if (json.success) {
        setJabatanList(json.data?.items || []);
      }
    } catch (err) {
      console.error('Error fetching jabatan:', err);
    }
  }, []);

  const fetchJobDesc = useCallback(async () => {
    try {
      const json: any = await api.get('/api/crud/jobdesc?per_page=50');
      if (json.success) {
        setJobDescList(json.data?.items || []);
      }
    } catch (err) {
      console.error('Error fetching jobdesc:', err);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchPermissions(), fetchBoard(), fetchProker(), fetchJabatan(), fetchJobDesc()]).finally(() => setLoading(false));
  }, [fetchPermissions, fetchBoard, fetchProker, fetchJabatan, fetchJobDesc]);

  // Task functions
  const openAddTask = (columnId: number) => {
    setSelectedColumn(columnId);
    setEditingTask(null);
    setTaskForm({ judul: '', deskripsi: '', prioritas: 'medium', deadline: '', tipe_tugas: 'harian', proker_id: '' });
    setShowTaskModal(true);
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setSelectedColumn(task.column_id);
    setTaskForm({
      judul: task.judul,
      deskripsi: task.deskripsi || '',
      prioritas: task.prioritas,
      deadline: task.deadline || '',
      tipe_tugas: task.tipe_tugas || 'harian',
      proker_id: task.proker_id ? String(task.proker_id) : '',
    });
    setShowTaskModal(true);
  };

  const saveTask = async () => {
    if (!taskForm.judul.trim()) return;
    setSaving(true);
    try {
      if (editingTask) {
        await api.put(`/api/kanban/task/${editingTask.id_tugas}`, { 
          ...taskForm, 
          column_id: selectedColumn,
          proker_id: taskForm.proker_id ? parseInt(taskForm.proker_id) : null,
        });
      } else {
        await api.post('/api/kanban/task', { 
          ...taskForm, 
          column_id: selectedColumn,
          proker_id: taskForm.proker_id ? parseInt(taskForm.proker_id) : null,
        });
      }
      
      setShowTaskModal(false);
      fetchBoard();
    } catch (err) {
      console.error('Error saving task:', err);
    } finally {
      setSaving(false);
    }
  };

  const deleteTask = async (taskId: number) => {
    if (!confirm('Hapus tugas ini?')) return;
    try {
      await api.delete(`/api/kanban/task/${taskId}`);
      fetchBoard();
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const moveTask = async (taskId: number, newColumnId: number) => {
    try {
      await api.put(`/api/kanban/task/${taskId}/move`, { column_id: newColumnId });
      fetchBoard();
    } catch (err) {
      console.error('Error moving task:', err);
    }
  };

  // Proker functions
  const openAddProker = () => {
    setEditingProker(null);
    setProkerForm(defaultProkerForm);
    setShowProkerModal(true);
  };

  const openEditProker = (proker: Proker) => {
    setEditingProker(proker);
    setProkerForm({
      nama_proker: proker.nama_proker,
      divisi_proker: String(proker.divisi_proker),
      tgl_pelaksanaan: proker.tgl_pelaksanaan || '',
      sasaran_proker: proker.sasaran_proker || '',
      deskripsi_proker: proker.deskripsi_proker || '',
      status_proker: proker.status_proker || 'Terjadwal',
      realisasi: proker.realisasi || '0',
      proyeksi: proker.proyeksi || '',
    });
    setShowProkerModal(true);
  };

  const saveProker = async () => {
    if (!prokerForm.nama_proker.trim()) return;
    setSaving(true);
    try {
      if (editingProker) {
        await api.put(`/api/crud/proker/${editingProker.id_proker}`, {
          ...prokerForm,
          divisi_proker: parseInt(prokerForm.divisi_proker) || 1,
          thn_proker: new Date().getFullYear(),
        });
      } else {
        await api.post('/api/crud/proker', {
          ...prokerForm,
          divisi_proker: parseInt(prokerForm.divisi_proker) || 1,
          thn_proker: new Date().getFullYear(),
        });
      }
      
      setShowProkerModal(false);
      fetchProker();
    } catch (err) {
      console.error('Error saving proker:', err);
    } finally {
      setSaving(false);
    }
  };

  const deleteProker = async (prokerId: number) => {
    if (!confirm('Hapus program kerja ini?')) return;
    try {
      await api.delete(`/api/crud/proker/${prokerId}`);
      fetchProker();
    } catch (err) {
      console.error('Error deleting proker:', err);
    }
  };

  // JobDesc functions
  const openAddJobDesc = () => {
    setEditingJobDesc(null);
    setJobDescForm(defaultJobDescForm);
    setShowJobDescModal(true);
  };

  const openEditJobDesc = (jobDesc: JobDesc) => {
    setEditingJobDesc(jobDesc);
    setJobDescForm({
      jabatan_id: String(jobDesc.jabatan_id),
      deskripsi: jobDesc.deskripsi || '',
      tanggung_jawab: jobDesc.tanggung_jawab || '',
      wewenang: jobDesc.wewenang || '',
    });
    setShowJobDescModal(true);
  };

  const saveJobDesc = async () => {
    if (!jobDescForm.jabatan_id) return;
    setSaving(true);
    try {
      if (editingJobDesc) {
        await api.put(`/api/crud/jobdesc/${editingJobDesc.id}`, {
          ...jobDescForm,
          jabatan_id: parseInt(jobDescForm.jabatan_id),
        });
      } else {
        await api.post('/api/crud/jobdesc', {
          ...jobDescForm,
          jabatan_id: parseInt(jobDescForm.jabatan_id),
        });
      }
      
      setShowJobDescModal(false);
      fetchJobDesc();
    } catch (err) {
      console.error('Error saving jobdesc:', err);
    } finally {
      setSaving(false);
    }
  };

  const deleteJobDesc = async (id: number) => {
    if (!confirm('Hapus job description ini?')) return;
    try {
      await api.delete(`/api/crud/jobdesc/${id}`);
      fetchJobDesc();
    } catch (err) {
      console.error('Error deleting jobdesc:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate stats
  const totalTasks = columns.reduce((sum, col) => sum + (col.tasks?.length || 0), 0);
  const doneTasks = columns.find(c => c.nama === 'Done')?.tasks?.length || 0;
  const totalProker = prokerList.length;
  const prokerTerlaksana = prokerList.filter(p => p.status_proker === 'Terlaksana').length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <ListTodo className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{totalTasks}</p>
          <p className="text-sm opacity-80">Total Tugas</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <Target className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{doneTasks}</p>
          <p className="text-sm opacity-80">Tugas Selesai</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <Briefcase className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{totalProker}</p>
          <p className="text-sm opacity-80">Program Kerja</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white">
          <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{prokerTerlaksana}</p>
          <p className="text-sm opacity-80">Proker Terlaksana</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('tugas')}
          className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'tugas' ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          <ListTodo className="w-5 h-5" />
          Tugas (Kanban)
        </button>
        <button
          onClick={() => setActiveTab('proker')}
          className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'proker' ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          <Briefcase className="w-5 h-5" />
          Program Kerja
        </button>
        <button
          onClick={() => setActiveTab('jobdesc')}
          className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'jobdesc' ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          <FileText className="w-5 h-5" />
          Job Description
        </button>
      </div>

      {/* Tugas Tab - Kanban Board */}
      {activeTab === 'tugas' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <div key={column.id} className="flex-shrink-0 w-72 bg-gray-50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: column.warna }} />
                  <h3 className="font-semibold text-gray-900">{column.nama}</h3>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                    {column.tasks?.length || 0}
                  </span>
                </div>
              </div>

              <div className="space-y-2 min-h-[100px]">
                {column.tasks?.map((task) => (
                  <div
                    key={task.id_tugas}
                    onClick={() => openEditTask(task)}
                    className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition group"
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="w-4 h-4 text-gray-300 mt-0.5 opacity-0 group-hover:opacity-100" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">{task.judul}</p>
                        {task.proker_judul && (
                          <p className="text-xs text-primary mt-1">📋 {task.proker_judul}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {task.tipe_tugas && (
                            <span className={`text-xs px-2 py-0.5 rounded ${task.tipe_tugas === 'pekanan' ? 'bg-purple-100 text-purple-700' : 'bg-cyan-100 text-cyan-700'}`}>
                              <Clock className="w-3 h-3 inline mr-1" />
                              {task.tipe_tugas === 'pekanan' ? 'Pekanan' : 'Harian'}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded ${priorityColors[task.prioritas]}`}>
                            <Flag className="w-3 h-3 inline mr-1" />
                            {task.prioritas}
                          </span>
                          {task.deadline && (
                            <span className="text-xs text-gray-500">
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {new Date(task.deadline).toLocaleDateString('id-ID')}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteTask(task.id_tugas); }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                    
                    <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition flex-wrap">
                      {columns.filter(c => c.id !== column.id).map(c => (
                        <button
                          key={c.id}
                          onClick={(e) => { e.stopPropagation(); moveTask(task.id_tugas, c.id); }}
                          className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                          style={{ borderLeft: `3px solid ${c.warna}` }}
                        >
                          → {c.nama}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => openAddTask(column.id)}
                className="w-full mt-2 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" /> Tambah Tugas
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Proker Tab */}
      {activeTab === 'proker' && (
        <div>
          {canDeleteProker && (
            <div className="mb-4">
              <button onClick={openAddProker} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Plus className="w-5 h-5" /> Tambah Program Kerja
              </button>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prokerList.length === 0 ? (
              <div className="col-span-full bg-white rounded-xl shadow-sm border p-8 text-center">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada program kerja</p>
              </div>
            ) : (
              prokerList.map((proker) => {
                const realisasiNum = parseFloat(proker.realisasi) || 0;
                const realisasiPersen = realisasiNum > 1 ? realisasiNum : realisasiNum * 100;
                return (
                  <div key={proker.id_proker} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition group">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-900">{proker.nama_proker}</h3>
                        <div className="flex items-center gap-1">
                          <span className={`text-xs px-2 py-1 rounded ${statusColors[proker.status_proker] || 'bg-gray-100'}`}>
                            {proker.status_proker}
                          </span>
                          <button onClick={() => openEditProker(proker)} className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100">
                            <Edit2 className="w-4 h-4 text-gray-500" />
                          </button>
                          {canDeleteProker && (
                            <button onClick={() => deleteProker(proker.id_proker)} className="p-1 hover:bg-red-100 rounded opacity-0 group-hover:opacity-100">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {proker.sasaran_proker && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Users className="w-4 h-4" /><span>{proker.sasaran_proker}</span>
                        </div>
                      )}
                      
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Realisasi</span><span>{realisasiPersen.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${realisasiPersen >= 80 ? 'bg-green-500' : realisasiPersen >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(realisasiPersen, 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Job Description Tab */}
      {activeTab === 'jobdesc' && (
        <div>
          {canDeleteProker && (
            <div className="mb-4">
              <button onClick={openAddJobDesc} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Plus className="w-5 h-5" /> Tambah Job Description
              </button>
            </div>
          )}

          <div className="space-y-4">
            {jobDescList.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada job description</p>
              </div>
            ) : (
              jobDescList.map((jd) => (
                <div key={jd.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group">
                  <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex justify-between items-center">
                    <h3 className="font-bold text-lg">{jd.jabatan_id_nama || `Jabatan #${jd.jabatan_id}`}</h3>
                    <div className="flex gap-1">
                      <button onClick={() => openEditJobDesc(jd)} className="p-2 hover:bg-white/20 rounded">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {canDeleteProker && (
                        <button onClick={() => deleteJobDesc(jd.id)} className="p-2 hover:bg-white/20 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="p-4 grid md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><FileText className="w-4 h-4" /> Deskripsi</h4>
                      <div className="text-sm text-gray-600 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: jd.deskripsi || '-' }} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><Target className="w-4 h-4" /> Tanggung Jawab</h4>
                      <div className="text-sm text-gray-600 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: jd.tanggung_jawab || '-' }} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Wewenang</h4>
                      <div className="text-sm text-gray-600 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: jd.wewenang || '-' }} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTaskModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-bold text-lg">{editingTask ? 'Edit Tugas' : 'Tambah Tugas'}</h3>
              <button onClick={() => setShowTaskModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul *</label>
                <input type="text" value={taskForm.judul} onChange={(e) => setTaskForm({ ...taskForm, judul: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" placeholder="Nama tugas..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Tugas</label>
                  <select value={taskForm.tipe_tugas} onChange={(e) => setTaskForm({ ...taskForm, tipe_tugas: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="harian">Harian</option>
                    <option value="pekanan">Pekanan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioritas</label>
                  <select value={taskForm.prioritas} onChange={(e) => setTaskForm({ ...taskForm, prioritas: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Terkait Program Kerja</label>
                <select value={taskForm.proker_id} onChange={(e) => setTaskForm({ ...taskForm, proker_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">Tidak terkait proker</option>
                  {prokerList.map(p => (<option key={p.id_proker} value={p.id_proker}>{p.nama_proker}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                <input type="date" value={taskForm.deadline} onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea value={taskForm.deskripsi} onChange={(e) => setTaskForm({ ...taskForm, deskripsi: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={3} placeholder="Detail tugas..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t sticky bottom-0 bg-white">
              <button onClick={() => setShowTaskModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
              <button onClick={saveTask} disabled={saving || !taskForm.judul.trim()} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proker Modal */}
      {showProkerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowProkerModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-bold text-lg">{editingProker ? 'Edit Program Kerja' : 'Tambah Program Kerja'}</h3>
              <button onClick={() => setShowProkerModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Program *</label>
                <input type="text" value={prokerForm.nama_proker} onChange={(e) => setProkerForm({ ...prokerForm, nama_proker: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" placeholder="Nama program kerja..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Divisi</label>
                  <select value={prokerForm.divisi_proker} onChange={(e) => setProkerForm({ ...prokerForm, divisi_proker: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="">Pilih Divisi</option>
                    {jabatanList.map(j => (<option key={j.id_jabatan} value={j.id_jabatan}>{j.nama_jabatan}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={prokerForm.status_proker} onChange={(e) => setProkerForm({ ...prokerForm, status_proker: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    {statusOptions.map(s => (<option key={s} value={s}>{s}</option>))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pelaksanaan</label>
                  <input type="date" value={prokerForm.tgl_pelaksanaan} onChange={(e) => setProkerForm({ ...prokerForm, tgl_pelaksanaan: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Realisasi (%)</label>
                  <input type="number" min="0" max="100" value={parseFloat(prokerForm.realisasi) > 1 ? prokerForm.realisasi : (parseFloat(prokerForm.realisasi) * 100).toFixed(0)} onChange={(e) => setProkerForm({ ...prokerForm, realisasi: (parseFloat(e.target.value) / 100).toString() })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sasaran</label>
                <input type="text" value={prokerForm.sasaran_proker} onChange={(e) => setProkerForm({ ...prokerForm, sasaran_proker: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Contoh: Santri, Ortu" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proyeksi</label>
                <textarea value={prokerForm.proyeksi} onChange={(e) => setProkerForm({ ...prokerForm, proyeksi: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={2} placeholder="Rencana kedepan..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t sticky bottom-0 bg-white">
              <button onClick={() => setShowProkerModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
              <button onClick={saveProker} disabled={saving || !prokerForm.nama_proker.trim()} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JobDesc Modal */}
      {showJobDescModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowJobDescModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-bold text-lg">{editingJobDesc ? 'Edit Job Description' : 'Tambah Job Description'}</h3>
              <button onClick={() => setShowJobDescModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan *</label>
                <select value={jobDescForm.jabatan_id} onChange={(e) => setJobDescForm({ ...jobDescForm, jabatan_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">Pilih Jabatan</option>
                  {jabatanList.map(j => (<option key={j.id_jabatan} value={j.id_jabatan}>{j.nama_jabatan}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea value={jobDescForm.deskripsi} onChange={(e) => setJobDescForm({ ...jobDescForm, deskripsi: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={4} placeholder="Deskripsi jabatan (HTML)..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggung Jawab</label>
                <textarea value={jobDescForm.tanggung_jawab} onChange={(e) => setJobDescForm({ ...jobDescForm, tanggung_jawab: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={6} placeholder="Daftar tanggung jawab (HTML/list)..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wewenang</label>
                <textarea value={jobDescForm.wewenang} onChange={(e) => setJobDescForm({ ...jobDescForm, wewenang: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={4} placeholder="Daftar wewenang (HTML/list)..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t sticky bottom-0 bg-white">
              <button onClick={() => setShowJobDescModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
              <button onClick={saveJobDesc} disabled={saving || !jobDescForm.jabatan_id} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
