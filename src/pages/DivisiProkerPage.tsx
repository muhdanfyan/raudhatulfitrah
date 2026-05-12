import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
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
import { ArrowLeft, Loader2, Clock, Save, Trash2, RotateCcw, Target } from 'lucide-react';
import { api } from '../services/api';
import DroppableColumn from '../components/manajemen/DroppableColumn';
import DraggableProkerCard from '../components/manajemen/DraggableProkerCard';

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

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: { opacity: '0.5' },
    },
  }),
};

const divisionTitles: Record<string, string> = {
  pembinaan: 'Divisi Pembinaan',
  asrama: 'Divisi Asrama',
  akademik: 'Divisi Akademik',
};

export default function DivisiProkerPage() {
  const { division } = useParams<{ division: string }>();
  const [loading, setLoading] = useState(true);
  const [groupedProkers, setGroupedProkers] = useState<Record<string, Proker[]>>({
    terjadwal: [],
    terlaksana: [],
    dibatalkan: [],
    pending: []
  });
  const [activeProker, setActiveProker] = useState<Proker | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor)
  );

  const fetchData = useCallback(async () => {
    if (!division) return;
    try {
      setLoading(true);
      const response = await api.getProkerByDivision(division);
      if (response.success && response.data) {
        setGroupedProkers(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch prokers:', err);
    } finally {
      setLoading(false);
    }
  }, [division]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    const container = findProkerContainer(active.id as string);
    if (container) {
      const p = groupedProkers[container].find(p => `proker-${p.id_proker}` === active.id);
      setActiveProker(p || null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveProker(null);
      return;
    }

    const activeContainer = findProkerContainer(active.id as string);
    const overContainer = over.id in groupedProkers ? over.id : findProkerContainer(over.id as string);

    if (activeContainer && overContainer && activeContainer !== overContainer) {
      const realProkerId = parseInt((active.id as string).replace('proker-', ''));
      const statusMap: Record<string, string> = {
        terjadwal: 'Terjadwal',
        terlaksana: 'Terlaksana',
        dibatalkan: 'Dibatalkan',
        pending: 'Pending'
      };

      try {
        await api.updateProkerStatus(realProkerId, statusMap[overContainer as string]);
        
        setGroupedProkers(prev => {
          const sourceList = prev[activeContainer];
          const destList = prev[overContainer as string];
          const prokerToMove = sourceList.find(p => p.id_proker === realProkerId);
          
          if (!prokerToMove) return prev;
          
          return {
            ...prev,
            [activeContainer]: sourceList.filter(p => p.id_proker !== realProkerId),
            [overContainer as string]: [...destList, { ...prokerToMove, status_proker: statusMap[overContainer as string] }]
          };
        });
      } catch (err) {
        console.error('Failed to update proker status:', err);
      }
    }

    setActiveProker(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const title = divisionTitles[division || ''] || `Program Kerja ${division}`;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Target className="w-6 h-6 text-indigo-600" />
                {title}
              </h1>
              <p className="text-gray-500 text-sm">Kelola program kerja dengan drag & drop</p>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
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
                />
              ))}
            </DroppableColumn>
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeProker ? (
          <div className="w-72 opacity-90 rotate-3">
            <DraggableProkerCard id="overlay-proker" proker={activeProker} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
