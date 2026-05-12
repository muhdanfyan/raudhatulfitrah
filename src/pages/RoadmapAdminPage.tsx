import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import SearchableSelect from '../components/SearchableSelect';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Roadmap {
  id: number;
  nama: string;
  deskripsi: string;
  level: string;
  estimasi_durasi: string;
  konsentrasi_id: number;
  konsentrasi: string;
  total_sections: number;
  total_topics: number;
  status: string;
}

interface Section {
  id: number;
  nama: string;
  deskripsi: string;
  urutan: number;
  warna: string;
  icon: string;
  total_topics: number;
  topics: Topic[];
}

interface Topic {
  id: number;
  nama: string;
  deskripsi: string;
  tipe: string;
  urutan: number;
  estimasi_jam: number;
}

interface Konsentrasi {
  id_konsentrasi: number;
  nama_konsentrasi: string;
}

// Sortable Section Component for drag-drop
interface SortableSectionProps {
  section: Section;
  children: React.ReactNode;
}

const SortableSection: React.FC<SortableSectionProps> = ({ section, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing bg-gray-100 hover:bg-gray-200 rounded-l-xl transition-colors z-10"
        title="Drag untuk mengubah urutan"
      >
        <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm8-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
        </svg>
      </div>
      <div className="ml-8">{children}</div>
    </div>
  );
};

const RoadmapAdminPage: React.FC = () => {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [konsentrasiList, setKonsentrasiList] = useState<Konsentrasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoadmap, setSelectedRoadmap] = useState<number | null>(null);
  const [roadmapDetail, setRoadmapDetail] = useState<any>(null);
  const [linkedCourses, setLinkedCourses] = useState<any[]>([]);

  // Modals
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showCourseLinkerModal, setShowCourseLinkerModal] = useState(false);
  const [editingRoadmap, setEditingRoadmap] = useState<Roadmap | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [currentSectionId, setCurrentSectionId] = useState<number | null>(null);
  
  // Course Linker State
  const [linkerTopicId, setLinkerTopicId] = useState<number | null>(null);
  const [linkerTopicName, setLinkerTopicName] = useState<string>('');
  const [linkerCourses, setLinkerCourses] = useState<any[]>([]);
  const [linkerSelectedCourses, setLinkerSelectedCourses] = useState<number[]>([]);
  const [linkerLoading, setLinkerLoading] = useState(false);
  const [linkerSearch, setLinkerSearch] = useState('');

  // Forms
  const [roadmapForm, setRoadmapForm] = useState({
    nama_roadmap: '',
    deskripsi: '',
    level: 'Beginner',
    estimasi_durasi: '3 bulan',
    konsentrasi: '',
    status: 'active'
  });

  const [sectionForm, setSectionForm] = useState({
    nama_section: '',
    deskripsi: '',
    warna: '#3B82F6',
    icon: '📚'
  });

  const [topicForm, setTopicForm] = useState({
    nama_topic: '',
    deskripsi: '',
    tipe: 'required',
    estimasi_jam: 10
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle section drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !roadmapDetail?.sections) return;

    const oldIndex = roadmapDetail.sections.findIndex((s: Section) => s.id === active.id);
    const newIndex = roadmapDetail.sections.findIndex((s: Section) => s.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Optimistic update
    const newSections = arrayMove(roadmapDetail.sections as Section[], oldIndex, newIndex);
    setRoadmapDetail({ ...roadmapDetail, sections: newSections });

    // Build order array and call API
    const orderData = newSections.map((s, idx) => ({
      id: s.id,
      urutan: idx + 1
    }));

    try {
      await api.post(`/roadmap-admin/${selectedRoadmap}/reorder-sections`, { sections: orderData });
    } catch (error) {
      console.error('Error reordering sections:', error);
      // Revert on error
      loadRoadmapDetail(selectedRoadmap!);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedRoadmap) {
      loadRoadmapDetail(selectedRoadmap);
    }
  }, [selectedRoadmap]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [roadmapData, konsentrasiData] = await Promise.all([
        api.getRoadmaps(),
        api.getMasterKonsentrasi()
      ]);
      setRoadmaps(roadmapData || []);
      setKonsentrasiList(konsentrasiData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoadmapDetail = async (id: number) => {
    try {
      const [data, courses] = await Promise.all([
        api.getRoadmapDetail(id),
        api.getRoadmapCourses(id)
      ]);
      setRoadmapDetail(data);
      setLinkedCourses(courses || []);
    } catch (error) {
      console.error('Error loading roadmap detail:', error);
    }
  };

  // Roadmap CRUD
  const openRoadmapModal = (roadmap?: Roadmap) => {
    if (roadmap) {
      setEditingRoadmap(roadmap);
      setRoadmapForm({
        nama_roadmap: roadmap.nama,
        deskripsi: roadmap.deskripsi || '',
        level: roadmap.level || 'Beginner',
        estimasi_durasi: roadmap.estimasi_durasi || '3 bulan',
        konsentrasi: roadmap.konsentrasi_id?.toString() || '',
        status: roadmap.status || 'active'
      });
    } else {
      setEditingRoadmap(null);
      setRoadmapForm({
        nama_roadmap: '',
        deskripsi: '',
        level: 'Beginner',
        estimasi_durasi: '3 bulan',
        konsentrasi: '',
        status: 'active'
      });
    }
    setShowRoadmapModal(true);
  };

  const saveRoadmap = async () => {
    if (!roadmapForm.nama_roadmap.trim()) {
      alert('Nama roadmap wajib diisi');
      return;
    }
    try {
      if (editingRoadmap) {
        await api.put(`/roadmap-admin/${editingRoadmap.id}`, roadmapForm);
      } else {
        await api.post('/roadmap-admin', roadmapForm);
      }
      setShowRoadmapModal(false);
      loadData();
      if (selectedRoadmap) loadRoadmapDetail(selectedRoadmap);
    } catch (error) {
      console.error('Error saving roadmap:', error);
      alert('Gagal menyimpan roadmap');
    }
  };

  const deleteRoadmap = async (id: number) => {
    if (!confirm('Yakin hapus roadmap ini? Semua section dan topic akan ikut terhapus.')) return;
    try {
      await api.delete(`/roadmap-admin/${id}`);
      loadData();
      if (selectedRoadmap === id) {
        setSelectedRoadmap(null);
        setRoadmapDetail(null);
      }
    } catch (error) {
      console.error('Error deleting roadmap:', error);
    }
  };

  // Section CRUD
  const openSectionModal = (section?: Section) => {
    if (section) {
      setEditingSection(section);
      setSectionForm({
        nama_section: section.nama,
        deskripsi: section.deskripsi || '',
        warna: section.warna || '#3B82F6',
        icon: section.icon || '📚'
      });
    } else {
      setEditingSection(null);
      setSectionForm({
        nama_section: '',
        deskripsi: '',
        warna: '#3B82F6',
        icon: '📚'
      });
    }
    setShowSectionModal(true);
  };

  const saveSection = async () => {
    if (!sectionForm.nama_section.trim() || !selectedRoadmap) return;
    try {
      if (editingSection) {
        await api.put(`/roadmap-admin/${selectedRoadmap}/sections/${editingSection.id}`, sectionForm);
      } else {
        await api.post(`/roadmap-admin/${selectedRoadmap}/sections`, sectionForm);
      }
      setShowSectionModal(false);
      loadRoadmapDetail(selectedRoadmap);
    } catch (error) {
      console.error('Error saving section:', error);
      alert('Gagal menyimpan section');
    }
  };

  const deleteSection = async (id: number) => {
    if (!confirm('Yakin hapus section ini?')) return;
    try {
      await api.delete(`/roadmap-admin/${selectedRoadmap}/sections/${id}`);
      loadRoadmapDetail(selectedRoadmap!);
    } catch (error) {
      console.error('Error deleting section:', error);
    }
  };

  // Topic CRUD
  const openTopicModal = (sectionId: number, topic?: Topic) => {
    setCurrentSectionId(sectionId);
    if (topic) {
      setEditingTopic(topic);
      setTopicForm({
        nama_topic: topic.nama,
        deskripsi: topic.deskripsi || '',
        tipe: topic.tipe || 'required',
        estimasi_jam: topic.estimasi_jam || 10
      });
    } else {
      setEditingTopic(null);
      setTopicForm({
        nama_topic: '',
        deskripsi: '',
        tipe: 'required',
        estimasi_jam: 10
      });
    }
    setShowTopicModal(true);
  };

  const saveTopic = async () => {
    if (!topicForm.nama_topic.trim() || !currentSectionId) return;
    try {
      if (editingTopic) {
        await api.put(`/roadmap-admin/sections/${currentSectionId}/topics/${editingTopic.id}`, topicForm);
      } else {
        await api.post(`/roadmap-admin/sections/${currentSectionId}/topics`, topicForm);
      }
      setShowTopicModal(false);
      loadRoadmapDetail(selectedRoadmap!);
    } catch (error) {
      console.error('Error saving topic:', error);
      alert('Gagal menyimpan topic');
    }
  };

  const deleteTopic = async (sectionId: number, topicId: number) => {
    if (!confirm('Yakin hapus topic ini?')) return;
    try {
      await api.delete(`/roadmap-admin/sections/${sectionId}/topics/${topicId}`);
      loadRoadmapDetail(selectedRoadmap!);
    } catch (error) {
      console.error('Error deleting topic:', error);
    }
  };

  // Course Linker Functions
  const openCourseLinkerModal = async (topicId: number, topicName: string) => {
    setLinkerTopicId(topicId);
    setLinkerTopicName(topicName);
    setLinkerLoading(true);
    setLinkerSearch('');
    setShowCourseLinkerModal(true);

    try {
      // Get ALL courses (no konsentrasi filter)
      const response = await api.get('/lms/courses?per_page=500');
      // Handle paginated response - data is in response.data (paginator) with .data inside
      const rawData = response?.data || response;
      const courses = Array.isArray(rawData) ? rawData : (rawData?.data || []);
      setLinkerCourses(courses);
      // Pre-select courses already linked to this topic (check both pivot table linked_topic_ids AND legacy roadmap_topic)
      const selected = Array.isArray(courses) 
        ? courses.filter((c: any) => {
            const linkedIds = (c.linked_topic_ids || []).map(Number);
            return c.roadmap_topic === topicId || linkedIds.includes(Number(topicId));
          }).map((c: any) => c.id_course) 
        : [];
      setLinkerSelectedCourses(selected);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLinkerLoading(false);
    }
  };

  const toggleCourseSelection = (courseId: number) => {
    setLinkerSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const saveCourseLinks = async () => {
    if (!linkerTopicId) return;
    try {
      await api.post(`/roadmap-admin/topics/${linkerTopicId}/sync-courses`, {
        course_ids: linkerSelectedCourses
      });
      setShowCourseLinkerModal(false);
      loadRoadmapDetail(selectedRoadmap!);
    } catch (error) {
      console.error('Error saving course links:', error);
      alert('Gagal menyimpan hubungan course');
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-orange-100 text-orange-800';
      case 'Expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipeColor = (tipe: string) => {
    switch (tipe) {
      case 'required': return 'bg-red-100 text-red-700';
      case 'recommended': return 'bg-yellow-100 text-yellow-700';
      case 'optional': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Kelola Learning Roadmap</h1>
        <button
          onClick={() => openRoadmapModal()}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
        >
          + Tambah Roadmap
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Roadmap List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="font-semibold text-gray-800 mb-4">Daftar Roadmap</h2>
            <div className="space-y-2">
              {roadmaps.map(roadmap => (
                <div
                  key={roadmap.id}
                  onClick={() => setSelectedRoadmap(roadmap.id)}
                  className={`p-3 rounded-lg cursor-pointer border-2 transition-all ${
                    selectedRoadmap === roadmap.id
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{roadmap.nama}</p>
                      <p className="text-sm text-gray-500">{roadmap.konsentrasi}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-xs ${getLevelColor(roadmap.level)}`}>
                          {roadmap.level}
                        </span>
                        <span className="text-xs text-gray-500">
                          {roadmap.total_sections} section, {roadmap.total_topics} topic
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); openRoadmapModal(roadmap); }}
                        className="p-1 text-primary hover:bg-primary/10 rounded"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteRoadmap(roadmap.id); }}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {roadmaps.length === 0 && (
                <p className="text-gray-500 text-center py-4">Belum ada roadmap</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Roadmap Detail */}
        <div className="lg:col-span-2">
          {!selectedRoadmap ? (
            <div className="bg-white rounded-xl shadow p-12 text-center text-gray-500">
              <p className="text-lg">Pilih roadmap untuk melihat dan mengelola konten</p>
            </div>
          ) : roadmapDetail ? (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{roadmapDetail.nama}</h2>
                    <p className="text-gray-500">{roadmapDetail.konsentrasi} - {roadmapDetail.level}</p>
                  </div>
                  <button
                    onClick={() => openSectionModal()}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                  >
                    + Tambah Section
                  </button>
                </div>
              </div>

              {/* Sections with Drag-Drop */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={roadmapDetail.sections?.map((s: Section) => s.id) || []}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {roadmapDetail.sections?.map((section: Section) => (
                      <SortableSection key={section.id} section={section}>
                        <div className="bg-white rounded-xl shadow overflow-hidden">
                          <div 
                            className="p-4 flex items-center justify-between"
                            style={{ backgroundColor: section.warna + '20', borderLeft: `4px solid ${section.warna}` }}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{section.icon}</span>
                              <div>
                                <h3 className="font-semibold text-gray-800">{section.nama}</h3>
                                <p className="text-sm text-gray-500">{section.total_topics} topics • urutan #{section.urutan}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => openTopicModal(section.id)}
                                className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary-dark"
                              >
                                + Topic
                              </button>
                              <button
                                onClick={() => openSectionModal(section)}
                                className="text-primary hover:underline text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteSection(section.id)}
                                className="text-red-600 hover:underline text-sm"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                          <div className="p-4 space-y-2">
                            {section.topics?.length === 0 ? (
                              <p className="text-gray-400 text-sm text-center py-2">Belum ada topic</p>
                            ) : (
                              section.topics?.map((topic: Topic) => (
                                <div key={topic.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <span className={`px-2 py-0.5 rounded text-xs ${getTipeColor(topic.tipe)}`}>
                                      {topic.tipe}
                                    </span>
                                    <div>
                                      <p className="font-medium text-gray-800 flex items-center gap-2">
                                        {topic.nama}
                                        {(() => {
                                          const count = linkedCourses.filter((c: any) => 
                                            c.linked_topic_ids?.includes(topic.id) || c.roadmap_topic === topic.id
                                          ).length;
                                          return count > 0 ? (
                                            <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold border border-blue-200">
                                              {count} Course
                                            </span>
                                          ) : null;
                                        })()}
                                      </p>
                                      <p className="text-xs text-gray-500">{topic.estimasi_jam} jam</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => openCourseLinkerModal(topic.id, topic.nama)}
                                      className="text-green-600 hover:underline text-sm"
                                    >
                                      📚 Course
                                    </button>
                                    <button
                                      onClick={() => openTopicModal(section.id, topic)}
                                      className="text-primary hover:underline text-sm"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => deleteTopic(section.id, topic.id)}
                                      className="text-red-600 hover:underline text-sm"
                                    >
                                      Hapus
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </SortableSection>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {roadmapDetail.sections?.length === 0 && (
                <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
                  <p>Belum ada section. Klik "Tambah Section" untuk mulai.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
            </div>
          )}
        </div>
      </div>

      {/* Roadmap Modal */}
      {showRoadmapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">{editingRoadmap ? 'Edit Roadmap' : 'Tambah Roadmap'}</h2>
              <button onClick={() => setShowRoadmapModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Roadmap *</label>
                <input
                  type="text"
                  value={roadmapForm.nama_roadmap}
                  onChange={(e) => setRoadmapForm({ ...roadmapForm, nama_roadmap: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Contoh: Backend Development"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea
                  value={roadmapForm.deskripsi}
                  onChange={(e) => setRoadmapForm({ ...roadmapForm, deskripsi: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Konsentrasi</label>
                <SearchableSelect
                  options={[
                    { value: '', label: 'Pilih Konsentrasi' },
                    ...konsentrasiList.map(k => ({ value: k.id_konsentrasi.toString(), label: k.nama_konsentrasi }))
                  ]}
                  value={roadmapForm.konsentrasi}
                  onChange={(v) => setRoadmapForm({ ...roadmapForm, konsentrasi: v as string })}
                  placeholder="Pilih konsentrasi"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Level</label>
                  <select
                    value={roadmapForm.level}
                    onChange={(e) => setRoadmapForm({ ...roadmapForm, level: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estimasi Durasi</label>
                  <input
                    type="text"
                    value={roadmapForm.estimasi_durasi}
                    onChange={(e) => setRoadmapForm({ ...roadmapForm, estimasi_durasi: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="3 bulan"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={roadmapForm.status}
                  onChange={(e) => setRoadmapForm({ ...roadmapForm, status: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button onClick={() => setShowRoadmapModal(false)} className="flex-1 border rounded-lg py-2 hover:bg-gray-50">Batal</button>
                <button onClick={saveRoadmap} className="flex-1 bg-primary text-white rounded-lg py-2 hover:bg-primary-dark">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">{editingSection ? 'Edit Section' : 'Tambah Section'}</h2>
              <button onClick={() => setShowSectionModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Section *</label>
                <input
                  type="text"
                  value={sectionForm.nama_section}
                  onChange={(e) => setSectionForm({ ...sectionForm, nama_section: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Contoh: Fundamental Programming"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea
                  value={sectionForm.deskripsi}
                  onChange={(e) => setSectionForm({ ...sectionForm, deskripsi: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Warna</label>
                  <input
                    type="color"
                    value={sectionForm.warna}
                    onChange={(e) => setSectionForm({ ...sectionForm, warna: e.target.value })}
                    className="w-full h-10 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Icon</label>
                  <input
                    type="text"
                    value={sectionForm.icon}
                    onChange={(e) => setSectionForm({ ...sectionForm, icon: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="📚"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button onClick={() => setShowSectionModal(false)} className="flex-1 border rounded-lg py-2 hover:bg-gray-50">Batal</button>
                <button onClick={saveSection} className="flex-1 bg-primary text-white rounded-lg py-2 hover:bg-primary-dark">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Topic Modal */}
      {showTopicModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">{editingTopic ? 'Edit Topic' : 'Tambah Topic'}</h2>
              <button onClick={() => setShowTopicModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Topic *</label>
                <input
                  type="text"
                  value={topicForm.nama_topic}
                  onChange={(e) => setTopicForm({ ...topicForm, nama_topic: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Contoh: PHP Basics"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea
                  value={topicForm.deskripsi}
                  onChange={(e) => setTopicForm({ ...topicForm, deskripsi: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tipe</label>
                  <select
                    value={topicForm.tipe}
                    onChange={(e) => setTopicForm({ ...topicForm, tipe: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="required">Required</option>
                    <option value="recommended">Recommended</option>
                    <option value="optional">Optional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estimasi (jam)</label>
                  <input
                    type="number"
                    min="1"
                    value={topicForm.estimasi_jam}
                    onChange={(e) => setTopicForm({ ...topicForm, estimasi_jam: parseInt(e.target.value) || 1 })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button onClick={() => setShowTopicModal(false)} className="flex-1 border rounded-lg py-2 hover:bg-gray-50">Batal</button>
                <button onClick={saveTopic} className="flex-1 bg-primary text-white rounded-lg py-2 hover:bg-primary-dark">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Linker Modal */}
      {showCourseLinkerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">Hubungkan Course</h2>
                <p className="text-sm text-gray-500">Topic: {linkerTopicName}</p>
              </div>
              <button onClick={() => setShowCourseLinkerModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-4 border-b">
              <input
                type="text"
                placeholder="🔍 Cari course..."
                value={linkerSearch}
                onChange={(e) => setLinkerSearch(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
              <p className="text-xs text-gray-500 mt-2">
                {linkerSelectedCourses.length} course dipilih dari {linkerCourses.length} tersedia
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {linkerLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
                </div>
              ) : linkerCourses.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Tidak ada course di konsentrasi ini</p>
              ) : (
                linkerCourses
                  .filter((c: any) => c.judul?.toLowerCase().includes(linkerSearch.toLowerCase()))
                  .sort((a: any, b: any) => {
                    // Selected/linked courses first
                    const aSelected = linkerSelectedCourses.includes(a.id_course) ? 1 : 0;
                    const bSelected = linkerSelectedCourses.includes(b.id_course) ? 1 : 0;
                    return bSelected - aSelected;
                  })
                  .map((course: any) => (
                    <label
                      key={course.id_course}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        linkerSelectedCourses.includes(course.id_course)
                          ? 'bg-green-50 border-2 border-green-500'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={linkerSelectedCourses.includes(course.id_course)}
                        onChange={() => toggleCourseSelection(course.id_course)}
                        className="w-5 h-5 rounded text-green-600"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{course.judul}</p>
                        {course.roadmap_topic && course.roadmap_topic !== linkerTopicId && (
                          <p className="text-xs text-orange-600">⚠️ Sudah terhubung ke topic lain</p>
                        )}
                      </div>
                    </label>
                  ))
              )}
            </div>
            <div className="p-4 border-t flex gap-2">
              <button 
                onClick={() => setShowCourseLinkerModal(false)} 
                className="flex-1 border rounded-lg py-2 hover:bg-gray-50"
              >
                Batal
              </button>
              <a 
                href="/course/new"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 text-center"
              >
                ➕ Buat Course
              </a>
              <button 
                onClick={saveCourseLinks} 
                className="flex-1 bg-green-600 text-white rounded-lg py-2 hover:bg-green-700"
              >
                💾 Simpan ({linkerSelectedCourses.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapAdminPage;
