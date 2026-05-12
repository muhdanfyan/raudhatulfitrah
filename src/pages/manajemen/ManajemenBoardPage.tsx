import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  DragStartEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from '@dnd-kit/core';
import {
  Plus,
  Layout as LayoutIcon,
  Target,
  FileText,
  Clock,
  Trash2,
  Edit2,
  Users,
  Briefcase,
  GraduationCap,
  BookOpen,
  Search,
  Loader2,
  Save,
  RotateCcw
} from 'lucide-react';

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { api } from '../../services/api';
import { getStudentPhotoUrl } from '../../utils/imageUtils';
import DraggableSantriCard from '../../components/manajemen/DraggableSantriCard';
import DroppableColumn from '../../components/manajemen/DroppableColumn';
import DraggableProkerCard from '../../components/manajemen/DraggableProkerCard';


// Define the types
interface Santri {
  id: number;
  name: string;
  photo: string;
  jabatan_id?: number;
  jabatan_nama?: string;
  is_guru?: boolean;
  is_musyrif?: boolean;
  kepengelolaan_id?: number; // ID of the assignment record for deletion
}

interface Jabatan {
  id_jabatan: number;
  nama_jabatan: string;
}

interface Kepengelolaan {
  id_kepengelolaan: number;
  pejabat: number;
  jabatan: number;
  nama_lengkap_santri?: string;
  foto_santri?: string;
  angkatan?: number;
  status?: string;
}

interface Proker {
  id_proker: number;
  nama_proker: string;
  deskripsi_proker?: string;
  tgl_pelaksanaan?: string;
  thn_proker?: string;
  sasaran_proker?: string;
  status_proker?: string;
  divisi_proker?: number;
  divisi_nama?: string;
  proyeksi?: number;
  realisasi?: number;
  pj?: { nama_lengkap_santri: string; foto_santri: string };
  pj_count?: number;
}

interface JobDesc {
  id: number;
  jabatan_id: number;
  deskripsi?: string;
  tanggung_jawab?: string;
  wewenang?: string;
}

interface JabatanManagement extends Jabatan {
  pejabat: Kepengelolaan[];
  prokers: Proker[];
  jobdesk?: JobDesc;
}

// Fixed Column IDs
const SOURCE_COLUMN = 'source-santri';
const GURU_COLUMN = 'fungsional-guru';
const MUSYRIF_COLUMN = 'fungsional-musyrif';


export default function ManajemenBoardPage() {
  const [activeTab, setActiveTab] = useState<'board' | 'proker'>('board');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Master Data
  const [jabatans, setJabatans] = useState<Jabatan[]>([]);
  const [managementData, setManagementData] = useState<JabatanManagement[]>([]);
  
  // Modal & Form State
  const [showProkerModal, setShowProkerModal] = useState(false);
  const [showJobDescModal, setShowJobDescModal] = useState(false);
  const [activeJabatan, setActiveJabatan] = useState<JabatanManagement | null>(null);
  const [editingProker, setEditingProker] = useState<Proker | null>(null);
  const [prokerForm, setProkerForm] = useState({
    nama_proker: '',
    deskripsi_proker: '',
    tgl_pelaksanaan: '',
    thn_proker: new Date().getFullYear().toString(),
    sasaran_proker: '',
    status_proker: 'Terjadwal',
    divisi_proker: 0,
    proyeksi: ''
  });
  const [jobDescForm, setJobDescForm] = useState({
    deskripsi: '',
    tanggung_jawab: '',
    wewenang: ''
  });
  
  // Data State (items: { [columnId]: Santri[] })
  const [items, setItems] = useState<Record<string, Santri[]>>({});
  
  // Proker Kanban State
  const [prokerSubTab, setProkerSubTab] = useState<'grid' | 'kanban'>('kanban');
  const [groupedProkers, setGroupedProkers] = useState<Record<string, Proker[]>>({
    terjadwal: [],
    terlaksana: [],
    dibatalkan: [],
    pending: []
  });
  const [showProkerDetail, setShowProkerDetail] = useState(false);
  const [selectedProker, setSelectedProker] = useState<Proker | null>(null);
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
  
  // Drag State
  const [_activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<Santri | null>(null);
  const [activeProker, setActiveProker] = useState<Proker | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor)
  );

  const getJabatanColumnId = (jabatanId: number) => `jabatan-${jabatanId}`;

  const fetchData = useCallback(async () => {
    setLoading(true);
    fetchPermissions();
    try {
      if (activeTab === 'board') {
        const [santriRes, jabatanRes, kepengelolaanRes] = await Promise.all([
          api.getSantriList({ per_page: 9999 }),
          api.getMasterJabatan(),
          api.getKepengelolaan(),
        ]);

        const allSantriRaw: any[] = santriRes || [];
        // Filter out santri with status 'Daftar' or 'Keluar'
        const allSantri = allSantriRaw.filter((s: any) => {
          const status = s.status_santri || s.status || '';
          return status !== 'Daftar' && status !== 'Keluar';
        });
        const allJabatan: Jabatan[] = jabatanRes || [];
        const allKepengelolaan: Kepengelolaan[] = kepengelolaanRes || [];

        setJabatans(allJabatan);

        // Create initial buckets: Source + Dynamic Jabatan Columns + Fungsional Columns
        const newItems: Record<string, Santri[]> = {
          [SOURCE_COLUMN]: [],
          [GURU_COLUMN]: [],
          [MUSYRIF_COLUMN]: [],
        };

        // Initialize dynamic jabatan columns
        allJabatan.forEach((jab) => {
          newItems[getJabatanColumnId(jab.id_jabatan)] = [];
        });

        // Create a lookup for kepengelolaan: pejabat (santri_id) -> kepengelolaan record
        const kepMap = new Map<number, { jabatan_id: number; kepengelolaan_id: number }>();
        allKepengelolaan.forEach((kep) => {
          kepMap.set(kep.pejabat, { jabatan_id: kep.jabatan, kepengelolaan_id: kep.id_kepengelolaan });
        });

        // Distribute santri
        allSantri.forEach((s: any) => {
          const santri: Santri = {
            id: s.id_santri || s.id,
            name: s.nama_lengkap_santri || s.name || s.nama_santri,
            photo: s.foto_santri || s.photo,
            is_guru: s.is_guru || false,
            is_musyrif: s.is_musyrif || s.musyrif === 1 || false,
          };

          // Check Fungsional roles
          if (santri.is_guru) {
            newItems[GURU_COLUMN].push({ ...santri });
          }
          if (santri.is_musyrif) {
            newItems[MUSYRIF_COLUMN].push({ ...santri });
          }

          // Check Kepengelolaan assignment
          const assignment = kepMap.get(santri.id);
          if (assignment) {
            const colId = getJabatanColumnId(assignment.jabatan_id);
            if (newItems[colId]) {
              const jabatanData = allJabatan.find(j => j.id_jabatan === assignment.jabatan_id);
              santri.jabatan_id = assignment.jabatan_id;
              santri.jabatan_nama = jabatanData?.nama_jabatan;
              santri.kepengelolaan_id = assignment.kepengelolaan_id;
              newItems[colId].push(santri);
            } else {
              newItems[SOURCE_COLUMN].push(santri);
            }
          } else {
            newItems[SOURCE_COLUMN].push(santri);
          }
        });

        setItems(newItems);
      } else {
        const [managementRes, groupedRes] = await Promise.all([
          api.getManagementProkerByJabatan(),
          api.getManagementProker()
        ]);
        
        setManagementData(managementRes);
        if (groupedRes.success && groupedRes.data) {
          setGroupedProkers(groupedRes.data);
        }
      }

    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveJobDesc = async () => {
    if (!activeJabatan) return;
    try {
      await api.saveJobDesc({
        jabatan_id: activeJabatan.id_jabatan,
        ...jobDescForm
      });
      setShowJobDescModal(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save jobdesc:', err);
    }
  };

  const handleSaveProker = async () => {
    if (!activeJabatan && prokerForm.divisi_proker === 0) return;
    try {
      const divisiId = prokerForm.divisi_proker || activeJabatan?.id_jabatan;
      
      // Prepare data, converting empty strings to null for optional fields
      // Ensure thn_proker is always a string (not number)
      const data = {
        nama_proker: prokerForm.nama_proker,
        deskripsi_proker: prokerForm.deskripsi_proker || null,
        tgl_pelaksanaan: prokerForm.tgl_pelaksanaan || null,
        thn_proker: prokerForm.thn_proker ? String(prokerForm.thn_proker) : null,
        sasaran_proker: prokerForm.sasaran_proker || null,
        status_proker: prokerForm.status_proker,
        divisi_proker: divisiId,
        proyeksi: prokerForm.proyeksi ? Number(prokerForm.proyeksi) : null
      };
      
      if (editingProker) {
        await api.updateProker(editingProker.id_proker, data);
      } else {
        await api.createProker({
          nama_proker: prokerForm.nama_proker,
          deskripsi_proker: prokerForm.deskripsi_proker || undefined,
          tgl_pelaksanaan: prokerForm.tgl_pelaksanaan || undefined,
          thn_proker: prokerForm.thn_proker || undefined,
          sasaran_proker: prokerForm.sasaran_proker || undefined,
          status_proker: prokerForm.status_proker,
          divisi_proker: divisiId!,
          proyeksi: prokerForm.proyeksi ? Number(prokerForm.proyeksi) : undefined
        });
      }
      setShowProkerModal(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save proker:', err);
    }
  };


  const handleDeleteProker = async (id: number) => {
    if (!confirm('Hapus program kerja ini?')) return;
    try {
      await api.deleteProker(id);
      fetchData();
    } catch (err) {
      console.error('Failed to delete proker:', err);
    }
  };

  const findContainer = (id: string) => {
    if (id in items) return id;
    return Object.keys(items).find((key) =>
      items[key].find((item) => `${item.id}-${key}` === id || `${item.id}` === id)
    );
  };

  const findProkerContainer = (id: string) => {
    if (id in groupedProkers) return id;
    for (const key of Object.keys(groupedProkers)) {
      if (groupedProkers[key].find(p => `proker-${p.id_proker}` === id)) {
        return key;
      }
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const { id } = active;
    setActiveId(id as string);
    
    // Check santri container
    const container = findContainer(id as string);
    if (container) {
      const item = items[container].find(i => `${i.id}-${container}` === id || `${i.id}` === id);
      setActiveItem(item || null);
      return;
    }

    // Check proker container
    const prokerContainer = findProkerContainer(id as string);
    if (prokerContainer) {
      const p = groupedProkers[prokerContainer].find(p => `proker-${p.id_proker}` === id);
      setActiveProker(p || null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const { id } = active;
    const overId = over?.id;

    if (!overId) {
      setActiveId(null);
      setActiveItem(null);
      setActiveProker(null);
      return;
    }

    // --- Handle Proker Drag ---
    const activeProkerContainer = findProkerContainer(id as string);
    const overProkerContainer = overId in groupedProkers ? overId : findProkerContainer(overId as string);

    if (activeProkerContainer && overProkerContainer) {
      if (activeProkerContainer === overProkerContainer) {
        setActiveId(null);
        setActiveProker(null);
        return;
      }

      const realProkerId = parseInt((id as string).replace('proker-', ''));
      const statusMap: Record<string, string> = {
        terjadwal: 'Terjadwal',
        terlaksana: 'Terlaksana',
        dibatalkan: 'Dibatalkan',
        pending: 'Pending'
      };

      try {
        await api.updateProkerStatus(realProkerId, statusMap[overProkerContainer as string]);
        
        setGroupedProkers(prev => {
          const sourceList = prev[activeProkerContainer];
          const destList = prev[overProkerContainer as string];
          const prokerToMove = sourceList.find(p => p.id_proker === realProkerId);
          
          if (!prokerToMove) return prev;
          
          return {
            ...prev,
            [activeProkerContainer]: sourceList.filter(p => p.id_proker !== realProkerId),
            [overProkerContainer as string]: [...destList, { ...prokerToMove, status_proker: statusMap[overProkerContainer as string] }]
          };
        });
      } catch (err) {
        console.error('Failed to update proker status:', err);
      }
      
      setActiveId(null);
      setActiveProker(null);
      return;
    }

    // --- Handle Santri Drag ---
    const activeContainer = findContainer(id as string);
    const overContainer = overId ? (overId in items ? overId : findContainer(overId as string)) : null;

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      setActiveId(null);
      setActiveItem(null);
      return;
    }

    const activeItemData = items[activeContainer].find(i => `${i.id}-${activeContainer}` === id || `${i.id}` === id);
    if (!activeItemData) return;

    // Determine if we're moving to/from a jabatan column
    const isMovingToJabatan = (overContainer as string).startsWith('jabatan-');
    const isMovingFromJabatan = activeContainer.startsWith('jabatan-');
    
    try {
      // If moving FROM a jabatan column, delete old kepengelolaan record
      if (isMovingFromJabatan && activeItemData.kepengelolaan_id) {
        await api.unassignSantriFromJabatan(activeItemData.kepengelolaan_id);
      }

      let newKepengelolaanId: number | undefined;
      
      // If moving TO a jabatan column, create new kepengelolaan record
      if (isMovingToJabatan) {
        const jabatanId = parseInt((overContainer as string).replace('jabatan-', ''));
        const response = await api.assignSantriToJabatan(activeItemData.id, jabatanId);
        if (response.success && response.data?.id) {
          newKepengelolaanId = response.data.id;
        }
      }

      // Update local state
      setItems((prev) => {
        const sourceList = [...prev[activeContainer]];
        const destList = [...prev[overContainer as string]];

        const newSourceList = sourceList.filter(i => (`${i.id}-${activeContainer}` !== id && `${i.id}` !== id));
        
        const newItem = { ...activeItemData };
        newItem.kepengelolaan_id = newKepengelolaanId;
        
        if (overContainer === GURU_COLUMN) newItem.is_guru = true;
        if (overContainer === MUSYRIF_COLUMN) newItem.is_musyrif = true;
        
        // Update jabatan info
        if (isMovingToJabatan) {
          const jabatanId = parseInt((overContainer as string).replace('jabatan-', ''));
          newItem.jabatan_id = jabatanId;
        } else {
          newItem.jabatan_id = undefined;
          newItem.jabatan_nama = undefined;
        }
        
        return {
          ...prev,
          [activeContainer]: newSourceList,
          [overContainer as string]: [...destList, newItem]
        };
      });
    } catch (err) {
      console.error('Failed to save assignment:', err);
      alert('Gagal menyimpan penugasan. Silakan coba lagi.');
    }

    setActiveId(null);
    setActiveItem(null);
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  // CRUD Handlers for Jabatan (tb_jabatan) - Real-time API integration
  const handleEditJabatan = async (jabatan: Jabatan) => {
    const newName = prompt(`Edit nama jabatan "${jabatan.nama_jabatan}":`, jabatan.nama_jabatan);
    if (newName && newName !== jabatan.nama_jabatan) {
      try {
        await api.updateJabatan(jabatan.id_jabatan, newName);
        // Update local state immediately
        setJabatans(prev => prev.map(j => 
          j.id_jabatan === jabatan.id_jabatan 
            ? { ...j, nama_jabatan: newName } 
            : j
        ));
      } catch (err) {
        console.error('Failed to update jabatan:', err);
        alert('Gagal mengubah jabatan. Silakan coba lagi.');
      }
    }
  };

  const handleDeleteJabatan = async (jabatan: Jabatan) => {
    const colId = getJabatanColumnId(jabatan.id_jabatan);
    const santriCount = items[colId]?.length || 0;
    
    if (santriCount > 0) {
      alert(`Tidak dapat menghapus jabatan "${jabatan.nama_jabatan}" karena masih ada ${santriCount} santri yang terdaftar.`);
      return;
    }
    
    if (confirm(`Hapus jabatan "${jabatan.nama_jabatan}"?`)) {
      try {
        await api.deleteJabatan(jabatan.id_jabatan);
        // Update local state
        setJabatans(prev => prev.filter(j => j.id_jabatan !== jabatan.id_jabatan));
        setItems(prev => {
          const updated = { ...prev };
          delete updated[colId];
          return updated;
        });
      } catch (err) {
        console.error('Failed to delete jabatan:', err);
        alert('Gagal menghapus jabatan. Silakan coba lagi.');
      }
    }
  };

  const handleAddJabatan = async () => {
    const newName = prompt('Masukkan nama jabatan baru:');
    if (newName) {
      try {
        const response = await api.createJabatan(newName);
        if (response.success && response.data?.id) {
          const newJabatan: Jabatan = {
            id_jabatan: response.data.id,
            nama_jabatan: newName,
          };
          setJabatans(prev => [...prev, newJabatan]);
          // Initialize empty column for new jabatan
          const newColId = getJabatanColumnId(response.data.id);
          setItems(prev => ({
            ...prev,
            [newColId]: [],
          }));
        }
      } catch (err) {
        console.error('Failed to create jabatan:', err);
        alert('Gagal membuat jabatan baru. Silakan coba lagi.');
      }
    }
  };

  const filteredSourceItems = items[SOURCE_COLUMN]?.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6 pb-20">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Manajemen Kepengelolaan</h1>
              <p className="text-blue-100 text-sm mt-1">Atur struktur organisasi dengan drag & drop yang mudah</p>
            </div>
            <div className="flex items-center gap-3">
               <button 
                  onClick={fetchData} 
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
                  title="Refresh Data"
              >
                  <RotateCcw className="w-5 h-5" />
               </button>
               <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
                  <Save className="w-4 h-4" />
                  <span>Simpan</span>
               </button>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('board')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'board'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <LayoutIcon className="w-4 h-4" />
            <span>Board Penugasan</span>
          </button>
          <button
            onClick={() => setActiveTab('proker')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'proker'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Program Kerja & Jobdesk</span>
          </button>
        </div>

        {activeTab === 'board' ? (
          <>
            <div className="flex gap-6">
              
              {/* 1. SOURCE COLUMN (Left Sidebar - Fixed Width) */}
              <div className="w-72 flex-shrink-0 flex flex-col gap-3">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Cari santri..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                 </div>
                 <DroppableColumn 
                    id={SOURCE_COLUMN}
                    title="Semua Santri"
                    color="gray"
                    count={filteredSourceItems.length}
                    icon={<Users className="w-4 h-4" />}
                 >
                    {loading ? (
                        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
                    ) : (
                        filteredSourceItems.map((santri) => (
                            <DraggableSantriCard 
                                key={`${santri.id}-${SOURCE_COLUMN}`} 
                                id={`${santri.id}-${SOURCE_COLUMN}`} 
                                santri={santri} 
                                compact 
                            />
                        ))
                    )}
                 </DroppableColumn>
              </div>

              {/* 2. DYNAMIC JABATAN COLUMNS (Flex-Wrap Grid) */}
              <div className="flex-1 flex flex-wrap gap-4 content-start">
                {jabatans.map((jab) => {
                  const colId = getJabatanColumnId(jab.id_jabatan);
                  return (
                    <div key={colId} className="w-56">
                      <DroppableColumn
                        id={colId}
                        title={jab.nama_jabatan}
                        color="blue"
                        count={items[colId]?.length || 0}
                        icon={<Briefcase className="w-4 h-4" />}
                        onEdit={() => handleEditJabatan(jab)}
                        onDelete={() => handleDeleteJabatan(jab)}
                        showAddButton={false}
                      >
                        {(items[colId] || []).map((santri) => (
                          <DraggableSantriCard
                            key={`${santri.id}-${colId}`}
                            id={`${santri.id}-${colId}`}
                            santri={santri}
                            minimal
                          />
                        ))}
                      </DroppableColumn>
                    </div>
                  );
                })}
                
                {/* Add New Jabatan Card */}
                <div className="w-56">
                  <button
                    onClick={handleAddJabatan}
                    className="
                      w-full h-full min-h-[120px]
                      flex flex-col items-center justify-center gap-3
                      bg-gradient-to-b from-gray-50 to-gray-100
                      border-2 border-dashed border-gray-300
                      rounded-2xl
                      text-gray-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/50
                      transition-all duration-200
                      group
                    "
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">Jabatan Baru</span>
                  </button>
                </div>
              </div>
            </div>

            {/* === FUNGSIONAL SECTION (Bottom) === */}
            <div className="pt-4 border-t border-dashed border-gray-300">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Peran Fungsional</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Guru Column */}
                <DroppableColumn
                  id={GURU_COLUMN}
                  title="Guru / Pengajar"
                  color="emerald"
                  count={items[GURU_COLUMN]?.length || 0}
                  icon={<GraduationCap className="w-4 h-4" />}
                  horizontal
                >
                  {(items[GURU_COLUMN] || []).map((santri) => (
                    <DraggableSantriCard
                      key={`${santri.id}-${GURU_COLUMN}`}
                      id={`${santri.id}-${GURU_COLUMN}`}
                      santri={santri}
                      minimal
                    />
                  ))}
                </DroppableColumn>

                {/* Musyrif Column */}
                <DroppableColumn
                  id={MUSYRIF_COLUMN}
                  title="Musyrif / Pengontrol"
                  color="amber"
                  count={items[MUSYRIF_COLUMN]?.length || 0}
                  icon={<BookOpen className="w-4 h-4" />}
                  horizontal
                >
                  {(items[MUSYRIF_COLUMN] || []).map((santri) => (
                    <DraggableSantriCard
                      key={`${santri.id}-${MUSYRIF_COLUMN}`}
                      id={`${santri.id}-${MUSYRIF_COLUMN}`}
                      santri={santri}
                      minimal
                    />
                  ))}
                </DroppableColumn>
              </div>
            </div>
          </>
        ) : (
          /* === PROKER & JOBDESK VIEW === */
          <div className="space-y-6">
            {/* Proker Sub-Tab Switcher */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex gap-2 p-1 bg-gray-50 rounded-xl">
                  <button
                    onClick={() => setProkerSubTab('kanban')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      prokerSubTab === 'kanban'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <LayoutIcon className="w-4 h-4" />
                    <span>Kanban Status</span>
                  </button>
                  <button
                    onClick={() => setProkerSubTab('grid')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      prokerSubTab === 'grid'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Per Jabatan</span>
                  </button>
                </div>
                
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Total {managementData.reduce((acc, j) => acc + j.prokers.length, 0)} Program Kerja</span>
                </div>
            </div>

            {prokerSubTab === 'kanban' ? (
              /* KANBAN VIEW */
              <div className="flex gap-6 overflow-x-auto pb-6">
                <div className="min-w-[300px] flex-1">
                  <DroppableColumn 
                    id="terjadwal" 
                    title="Terjadwal / Draft" 
                    color="blue" 
                    count={groupedProkers.terjadwal.length}
                    icon={<Clock className="w-4 h-4" />}
                    showAddButton={false}
                  >
                    {groupedProkers.terjadwal.map(p => (
                      <DraggableProkerCard 
                        key={`proker-${p.id_proker}`} 
                        id={`proker-${p.id_proker}`} 
                        proker={p} 
                        onEdit={(p) => {
                          setEditingProker(p);
                          setProkerForm({
                            nama_proker: p.nama_proker,
                            deskripsi_proker: p.deskripsi_proker || '',
                            tgl_pelaksanaan: p.tgl_pelaksanaan || '',
                            thn_proker: p.thn_proker || new Date().getFullYear().toString(),
                            sasaran_proker: p.sasaran_proker || '',
                            status_proker: p.status_proker || 'Terjadwal',
                            divisi_proker: p.divisi_proker || 0,
                            proyeksi: p.proyeksi?.toString() || ''
                          });
                          setShowProkerModal(true);
                        }}
                        onDelete={handleDeleteProker}
                        onView={(p) => { setSelectedProker(p); setShowProkerDetail(true); }}
                      />
                    ))}
                  </DroppableColumn>
                </div>
                <div className="min-w-[300px] flex-1">
                  <DroppableColumn 
                    id="pending" 
                    title="Pending / Tertunda" 
                    color="amber" 
                    count={groupedProkers.pending.length}
                    icon={<RotateCcw className="w-4 h-4" />}
                    showAddButton={false}
                  >
                    {groupedProkers.pending.map(p => (
                      <DraggableProkerCard 
                        key={`proker-${p.id_proker}`} 
                        id={`proker-${p.id_proker}`} 
                        proker={p} 
                        onEdit={(p) => {
                          setEditingProker(p);
                          setProkerForm({
                            nama_proker: p.nama_proker,
                            deskripsi_proker: p.deskripsi_proker || '',
                            tgl_pelaksanaan: p.tgl_pelaksanaan || '',
                            thn_proker: p.thn_proker || new Date().getFullYear().toString(),
                            sasaran_proker: p.sasaran_proker || '',
                            status_proker: p.status_proker || 'Pending',
                            divisi_proker: p.divisi_proker || 0,
                            proyeksi: p.proyeksi?.toString() || ''
                          });
                          setShowProkerModal(true);
                        }}
                        onDelete={handleDeleteProker}
                        onView={(p) => { setSelectedProker(p); setShowProkerDetail(true); }}
                      />
                    ))}
                  </DroppableColumn>
                </div>
                <div className="min-w-[300px] flex-1">
                  <DroppableColumn 
                    id="terlaksana" 
                    title="Terlaksana / Selesai" 
                    color="emerald" 
                    count={groupedProkers.terlaksana.length}
                    icon={<Save className="w-4 h-4" />}
                    showAddButton={false}
                  >
                    {groupedProkers.terlaksana.map(p => (
                      <DraggableProkerCard 
                        key={`proker-${p.id_proker}`} 
                        id={`proker-${p.id_proker}`} 
                        proker={p} 
                        onEdit={(p) => {
                          setEditingProker(p);
                          setProkerForm({
                            nama_proker: p.nama_proker,
                            deskripsi_proker: p.deskripsi_proker || '',
                            tgl_pelaksanaan: p.tgl_pelaksanaan || '',
                            thn_proker: p.thn_proker || new Date().getFullYear().toString(),
                            sasaran_proker: p.sasaran_proker || '',
                            status_proker: p.status_proker || 'Terlaksana',
                            divisi_proker: p.divisi_proker || 0,
                            proyeksi: p.proyeksi?.toString() || ''
                          });
                          setShowProkerModal(true);
                        }}
                        onDelete={handleDeleteProker}
                        onView={(p) => { setSelectedProker(p); setShowProkerDetail(true); }}
                      />
                    ))}
                  </DroppableColumn>
                </div>
                <div className="min-w-[300px] flex-1">
                  <DroppableColumn 
                    id="dibatalkan" 
                    title="Dibatalkan" 
                    color="gray" 
                    count={groupedProkers.dibatalkan.length}
                    icon={<Trash2 className="w-4 h-4" />}
                    showAddButton={false}
                  >
                    {groupedProkers.dibatalkan.map(p => (
                      <DraggableProkerCard 
                        key={`proker-${p.id_proker}`} 
                        id={`proker-${p.id_proker}`} 
                        proker={p} 
                        onEdit={(p) => {
                          setEditingProker(p);
                          setProkerForm({
                            nama_proker: p.nama_proker,
                            deskripsi_proker: p.deskripsi_proker || '',
                            tgl_pelaksanaan: p.tgl_pelaksanaan || '',
                            thn_proker: p.thn_proker || new Date().getFullYear().toString(),
                            sasaran_proker: p.sasaran_proker || '',
                            status_proker: p.status_proker || 'Dibatalkan',
                            divisi_proker: p.divisi_proker || 0,
                            proyeksi: p.proyeksi?.toString() || ''
                          });
                          setShowProkerModal(true);
                        }}
                        onDelete={handleDeleteProker}
                        onView={(p) => { setSelectedProker(p); setShowProkerDetail(true); }}
                      />
                    ))}
                  </DroppableColumn>
                </div>
              </div>
            ) : (
              /* GRID VIEW PER JABATAN */
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {managementData.map((jabatan) => (
                  <div key={jabatan.id_jabatan} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden flex flex-col">
                    {/* Jabatan Header */}
                    <div className="p-5 border-b border-gray-50 bg-gray-50/50">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{jabatan.nama_jabatan}</h3>
                            <p className="text-xs text-gray-500">{jabatan.pejabat.length} Pejabat Aktif</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleEditJabatan(jabatan)}
                            className="p-2 hover:bg-white rounded-lg transition-colors text-gray-400 hover:text-blue-600"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Pejabat List */}
                    <div className="p-4 border-b border-gray-50">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Personil</h4>
                      <div className="flex flex-wrap gap-2">
                        {jabatan.pejabat.length > 0 ? (
                          jabatan.pejabat.map((p) => (
                            <div key={p.id_kepengelolaan} className="flex items-center gap-2 bg-gray-50 pr-3 pl-1 py-1 rounded-full border border-gray-100">
                              <img 
                                src={getStudentPhotoUrl(p.foto_santri, 'https://ui-avatars.com/api/?name=' + p.nama_lengkap_santri)} 
                                alt={p.nama_lengkap_santri}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <span className="text-[11px] font-medium text-gray-700 truncate max-w-[100px]">{p.nama_lengkap_santri}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-400 italic">Belum ada pejabat</p>
                        )}
                      </div>
                    </div>

                    {/* Content Tabs (Internal to card or just sections) */}
                    <div className="p-5 flex-1 space-y-6">
                      {/* Jobdesk Section */}
                      <section>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 text-indigo-600">
                            <FileText className="w-4 h-4" />
                            <h4 className="text-xs font-bold uppercase tracking-wide">Job Description</h4>
                          </div>
                          {jabatan.jobdesk && (
                            <button 
                              onClick={() => {
                                setActiveJabatan(jabatan);
                                setJobDescForm({
                                  deskripsi: jabatan.jobdesk?.deskripsi || '',
                                  tanggung_jawab: jabatan.jobdesk?.tanggung_jawab || '',
                                  wewenang: jabatan.jobdesk?.wewenang || ''
                                });
                                setShowJobDescModal(true);
                              }}
                              className="text-[10px] text-indigo-600 hover:underline font-bold"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                        {jabatan.jobdesk ? (
                          <div className="bg-indigo-50/50 rounded-xl p-3 border border-indigo-100/50">
                            <div 
                              className="text-xs text-gray-600 leading-relaxed line-clamp-3 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: jabatan.jobdesk.deskripsi || '<em>No description provided.</em>' }}
                            />
                          </div>
                        ) : (
                          canDeleteProker ? (
                            <div className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-200 text-center">
                              <p className="text-[11px] text-gray-400">Belum ada job description</p>
                              <button 
                                onClick={() => {
                                  setActiveJabatan(jabatan);
                                  setJobDescForm({ deskripsi: '', tanggung_jawab: '', wewenang: '' });
                                  setShowJobDescModal(true);
                                }}
                                className="text-[11px] text-blue-600 font-bold mt-1 hover:underline"
                              >
                                + Tambahkan
                              </button>
                            </div>
                          ) : null
                        )}
                      </section>

                      {/* Proker Section */}
                      <section>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 text-emerald-600">
                            <Target className="w-4 h-4" />
                            <h4 className="text-xs font-bold uppercase tracking-wide">Program Kerja</h4>
                          </div>
                          {canDeleteProker && (
                            <button 
                              onClick={() => {
                                setActiveJabatan(jabatan);
                                setEditingProker(null);
                                setProkerForm({
                                  nama_proker: '',
                                  deskripsi_proker: '',
                                  tgl_pelaksanaan: new Date().toISOString().split('T')[0],
                                  thn_proker: new Date().getFullYear().toString(),
                                  sasaran_proker: '',
                                  status_proker: 'Terjadwal',
                                  divisi_proker: jabatan.id_jabatan,
                                  proyeksi: ''
                                });
                                setShowProkerModal(true);
                              }}
                              className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md font-bold hover:bg-emerald-100 transition-colors"
                            >
                              + Baru
                            </button>
                          )}
                        </div>
                        <div className="space-y-3">
                          {jabatan.prokers.length > 0 ? (
                            jabatan.prokers.map((proker) => (
                              <div 
                                key={proker.id_proker} 
                                className="group relative bg-white border border-gray-100 rounded-xl p-3 hover:border-emerald-200 hover:shadow-sm transition-all cursor-pointer"
                                onClick={() => { setSelectedProker(proker); setShowProkerDetail(true); }}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <h5 className="text-xs font-bold text-gray-800 line-clamp-1">{proker.nama_proker}</h5>
                                    <div className="flex items-center gap-3 mt-1.5">
                                      <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                        <Clock className="w-3 h-3" />
                                        <span>{proker.tgl_pelaksanaan ? new Date(proker.tgl_pelaksanaan).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : proker.thn_proker}</span>
                                      </div>
                                      <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                        proker.status_proker === 'Terlaksana' ? 'bg-emerald-50 text-emerald-600' :
                                        proker.status_proker === 'Dibatalkan' ? 'bg-red-50 text-red-600' :
                                        proker.status_proker === 'Pending' ? 'bg-yellow-50 text-yellow-600' :
                                        'bg-blue-50 text-blue-600'
                                      }`}>
                                        {proker.status_proker || 'Terjadwal'}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                    <button 
                                      onClick={() => {
                                        setActiveJabatan(jabatan);
                                        setEditingProker(proker);
                                        setShowProkerModal(true);
                                        setProkerForm({
                                          nama_proker: proker.nama_proker,
                                          deskripsi_proker: proker.deskripsi_proker || '',
                                          tgl_pelaksanaan: proker.tgl_pelaksanaan || '',
                                          thn_proker: proker.thn_proker || new Date().getFullYear().toString(),
                                          sasaran_proker: proker.sasaran_proker || '',
                                          status_proker: proker.status_proker || 'Terjadwal',
                                          divisi_proker: proker.divisi_proker || jabatan.id_jabatan,
                                          proyeksi: proker.proyeksi?.toString() || ''
                                        });
                                      }}
                                      className="p-1 hover:bg-emerald-100 rounded text-emerald-600 transition-colors"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    {canDeleteProker && (
                                      <button onClick={() => handleDeleteProker(proker.id_proker)} className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors">
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-200 text-center">
                              <p className="text-[11px] text-gray-400">Belum ada program kerja</p>
                            </div>
                          )}
                        </div>
                      </section>
                    </div>
                    
                    {/* Footer Action */}
                    <div className="p-4 bg-gray-50/30 border-t border-gray-50">
                      <button className="w-full py-2 text-xs font-bold text-blue-600 hover:bg-white rounded-xl border border-transparent hover:border-blue-100 transition-all">
                        Lihat Detail Jabatan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Proker Modal */}
        {showProkerModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingProker ? 'Edit Program Kerja' : 'Program Kerja Baru'}
                </h3>
                <button onClick={() => setShowProkerModal(false)} className="text-gray-400 hover:text-gray-600">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nama Program</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                    placeholder="Contoh: Gebyar Ramadhan"
                    value={prokerForm.nama_proker}
                    onChange={(e) => setProkerForm({ ...prokerForm, nama_proker: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tgl Pelaksanaan</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                      value={prokerForm.tgl_pelaksanaan}
                      onChange={(e) => setProkerForm({ ...prokerForm, tgl_pelaksanaan: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tahun Proker</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                      placeholder="2025"
                      value={prokerForm.thn_proker}
                      onChange={(e) => setProkerForm({ ...prokerForm, thn_proker: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Deskripsi</label>
                  <div className="prose-sm">
                    <ReactQuill 
                      theme="snow"
                      value={prokerForm.deskripsi_proker}
                      onChange={(val) => setProkerForm({ ...prokerForm, deskripsi_proker: val })}
                      className="bg-white rounded-2xl overflow-hidden"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Sasaran</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                      placeholder="Sasaran proker"
                      value={prokerForm.sasaran_proker}
                      onChange={(e) => setProkerForm({ ...prokerForm, sasaran_proker: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                    <select 
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all appearance-none bg-white"
                      value={prokerForm.status_proker}
                      onChange={(e) => setProkerForm({ ...prokerForm, status_proker: e.target.value })}
                    >
                      <option value="Terjadwal">Terjadwal</option>
                      <option value="Terlaksana">Terlaksana</option>
                      <option value="Dibatalkan">Dibatalkan</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 flex gap-3">
                <button 
                  onClick={() => setShowProkerModal(false)}
                  className="flex-1 py-3 rounded-2xl font-bold text-gray-600 hover:bg-gray-100 transition-all border border-gray-200"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSaveProker}
                  className="flex-[2] py-3 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                >
                  Simpan Program
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Jobdesc Modal */}
        {showJobDescModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-xl font-bold text-gray-900">
                  Job Description: {activeJabatan?.nama_jabatan}
                </h3>
                <button onClick={() => setShowJobDescModal(false)} className="text-gray-400 hover:text-gray-600">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Deskripsi Peran</label>
                  <div className="prose-sm">
                    <ReactQuill 
                      theme="snow"
                      value={jobDescForm.deskripsi}
                      onChange={(val) => setJobDescForm({ ...jobDescForm, deskripsi: val })}
                      placeholder="Jelaskan peran umum jabatan ini..."
                      className="bg-white rounded-2xl overflow-hidden"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 text-indigo-600">Tanggung Jawab Utama</label>
                  <div className="prose-sm">
                    <ReactQuill 
                      theme="snow"
                      value={jobDescForm.tanggung_jawab}
                      onChange={(val) => setJobDescForm({ ...jobDescForm, tanggung_jawab: val })}
                      placeholder="Point-point tanggung jawab..."
                      className="bg-white rounded-2xl overflow-hidden"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 text-emerald-600">Wewenang / Otoritas</label>
                  <div className="prose-sm">
                    <ReactQuill 
                      theme="snow"
                      value={jobDescForm.wewenang}
                      onChange={(val) => setJobDescForm({ ...jobDescForm, wewenang: val })}
                      placeholder="Wewenang yang dimiliki..."
                      className="bg-white rounded-2xl overflow-hidden"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gray-50 flex gap-3">
                <button 
                  onClick={() => setShowJobDescModal(false)}
                  className="flex-1 py-3 rounded-2xl font-bold text-gray-600 hover:bg-gray-100 transition-all border border-gray-200"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSaveJobDesc}
                  className="flex-[2] py-3 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
                >
                  Simpan Job Description
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeItem ? (
           <div className="w-64 opacity-90 rotate-3">
             <DraggableSantriCard id="overlay" santri={activeItem} />
           </div>
        ) : activeProker ? (
          <div className="w-72 opacity-90 rotate-3">
            <DraggableProkerCard id="overlay-proker" proker={activeProker} />
          </div>
        ) : null}
      </DragOverlay>

      {/* Proker Detail Modal */}
      {showProkerDetail && selectedProker && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-700 p-8 flex items-end">
              <button 
                onClick={() => setShowProkerDetail(false)}
                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
              <h2 className="text-2xl font-bold text-white tracking-tight">{selectedProker.nama_proker}</h2>
            </div>
            
            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              {/* Meta Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Status</p>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    selectedProker.status_proker === 'Terlaksana' ? 'bg-emerald-100 text-emerald-700' :
                    selectedProker.status_proker === 'Dibatalkan' ? 'bg-red-100 text-red-700' :
                    selectedProker.status_proker === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {selectedProker.status_proker || 'Terjadwal'}
                  </span>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Divisi</p>
                  <p className="text-xs font-bold text-gray-700">{selectedProker.divisi_nama || '-'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Pelaksanaan</p>
                  <p className="text-xs font-bold text-gray-700">
                    {selectedProker.tgl_pelaksanaan ? new Date(selectedProker.tgl_pelaksanaan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : selectedProker.thn_proker}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Sasaran</p>
                  <p className="text-xs font-bold text-gray-700">{selectedProker.sasaran_proker || '-'}</p>
                </div>
              </div>

              {/* Description */}
              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Deskripsi Program
                </h3>
                <div 
                  className="bg-gray-50 rounded-2xl p-6 text-sm text-gray-600 leading-relaxed border border-gray-100"
                  dangerouslySetInnerHTML={{ __html: selectedProker.deskripsi_proker || '<p class="italic text-gray-400">Tidak ada deskripsi.</p>' }}
                />
              </section>

              {/* PJ / Personil */}
              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Penanggung Jawab / Tim
                </h3>
                {selectedProker.pj ? (
                  <div className="flex items-center gap-4 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                    <img 
                      src={getStudentPhotoUrl(selectedProker.pj.foto_santri, `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedProker.pj.nama_lengkap_santri)}&background=random&bold=true`)}
                      alt={selectedProker.pj.nama_lengkap_santri}
                      className="w-12 h-12 rounded-full object-cover ring-4 ring-white shadow-md"
                    />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{selectedProker.pj.nama_lengkap_santri}</p>
                      <p className="text-xs text-indigo-600 font-medium">Koordinator Utama</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-4 text-center border border-dashed border-gray-200">
                    <p className="text-xs text-gray-400 italic">Belum ditentukan penanggung jawab khusus.</p>
                  </div>
                )}
              </section>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setShowProkerDetail(false)}
                className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold shadow-lg hover:bg-gray-800 transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </DndContext>
  );
}
