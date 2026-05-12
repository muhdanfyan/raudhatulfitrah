import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Subtopic {
  id: number;
  nama: string;
  deskripsi: string;
  link_referensi: string;
}

interface Resource {
  id: number;
  judul: string;
  tipe: string;
  url: string;
  bahasa: string;
  gratis: boolean;
}

interface Topic {
  id: number;
  nama: string;
  deskripsi: string;
  tipe: 'required' | 'recommended' | 'optional';
  urutan: number;
  estimasi_jam: number;
  subtopics: Subtopic[];
  resources: Resource[];
}

interface Section {
  id: number;
  nama: string;
  deskripsi: string;
  urutan: number;
  warna: string;
  icon: string;
  total_topics: number;
  estimasi_jam: number;
  topics: Topic[];
}

interface Milestone {
  id: number;
  nama: string;
  deskripsi: string;
  badge_icon: string;
  urutan: number;
}

interface Roadmap {
  id: number;
  nama: string;
  deskripsi: string;
  level: string;
  estimasi_durasi: string;
  konsentrasi: string;
  total_topics: number;
  estimasi_jam: number;
  sections: Section[];
  milestones: Milestone[];
}

interface Progress {
  topic_id: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  catatan: string;
}

const RoadmapDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [progress, setProgress] = useState<Record<number, Progress>>({});
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());
  const [linkedCourses, setLinkedCourses] = useState<any[]>([]);

  // Course Linker Modal State
  const [showCourseLinkerModal, setShowCourseLinkerModal] = useState(false);
  const [linkerTopicId, setLinkerTopicId] = useState<number | null>(null);
  const [linkerTopicName, setLinkerTopicName] = useState<string>('');
  const [linkerCourses, setLinkerCourses] = useState<any[]>([]);
  const [linkerSelectedCourses, setLinkerSelectedCourses] = useState<number[]>([]);
  const [linkerLoading, setLinkerLoading] = useState(false);
  const [linkerSearch, setLinkerSearch] = useState('');

  // Permission check - only admin, akademik, mentor can edit
  const canEditCourse = user?.role && ['admin', 'akademik', 'mentor', 'superadmin'].includes(user.role);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [roadmapData, coursesData] = await Promise.all([
        api.getRoadmapDetail(parseInt(id)),
        api.getRoadmapCourses(parseInt(id)),
      ]);
      setRoadmap(roadmapData);
      setLinkedCourses(coursesData || []);
      
      // Load progress if user is santri
      if (user?.santri_id) {
        try {
          const progressData = await api.getRoadmapProgress(user.santri_id, parseInt(id));
          const progressMap: Record<number, Progress> = {};
          // progress_detail is an object keyed by topic_id, not an array
          const detail = progressData?.progress_detail || {};
          Object.values(detail).forEach((p: any) => {
            progressMap[p.topic_id] = p;
          });
          setProgress(progressMap);
          console.log('Progress loaded:', progressMap);
        } catch (e) {
          console.log('No progress data', e);
        }
      }
      
      // Expand first section by default
      if (roadmapData?.sections?.length > 0) {
        setExpandedSections(new Set([roadmapData.sections[0].id]));
      }
    } catch (error) {
      console.error('Error loading roadmap:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionId: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const toggleTopic = (topicId: number) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  };

  const updateTopicProgress = async (topicId: number, status: string) => {
    console.log('updateTopicProgress:', { topicId, status, santri_id: user?.santri_id, userRole: user?.role });
    if (!user?.santri_id) {
      console.log('No santri_id, function returning early');
      return;
    }
    
    // Optimistic update - update UI immediately
    setProgress((prev) => ({
      ...prev,
      [topicId]: { ...prev[topicId], topic_id: topicId, status: status as any },
    }));
    
    try {
      await api.updateRoadmapProgress({
        santri_id: user.santri_id,
        topic_id: topicId,
        status,
      });
    } catch (error) {
      console.error('Error updating progress:', error);
      // Optionally revert on error (reload data)
    }
  };

  const getTopicStatusIcon = (topicId: number) => {
    const status = progress[topicId]?.status;
    switch (status) {
      case 'completed': return '✅';
      case 'in_progress': return '🔄';
      case 'skipped': return '⏭️';
      default: return '⬜';
    }
  };

  const getTopicTypeColor = (tipe: string) => {
    switch (tipe) {
      case 'required': return 'border-l-purple-500 bg-purple-50';
      case 'recommended': return 'border-l-blue-500 bg-primary/5';
      case 'optional': return 'border-l-gray-400 bg-gray-50';
      default: return 'border-l-gray-300';
    }
  };

  const getResourceIcon = (tipe: string) => {
    switch (tipe) {
      case 'video': return '🎬';
      case 'artikel': return '📄';
      case 'buku': return '📚';
      case 'course': return '🎓';
      case 'dokumentasi': return '📖';
      case 'project': return '💻';
      case 'quiz': return '❓';
      default: return '🔗';
    }
  };

  const calculateSectionProgress = (section: Section) => {
    const topicIds = section.topics.map((t) => t.id);
    const completed = topicIds.filter((id) => progress[id]?.status === 'completed').length;
    return {
      completed,
      total: topicIds.length,
      percentage: topicIds.length > 0 ? Math.round((completed / topicIds.length) * 100) : 0,
    };
  };

  // Course Linker Functions
  const openCourseLinkerModal = async (topicId: number, topicName: string) => {
    setLinkerTopicId(topicId);
    setLinkerTopicName(topicName);
    setLinkerLoading(true);
    setLinkerSearch('');
    setShowCourseLinkerModal(true);

    try {
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
    if (!linkerTopicId || !id) return;
    try {
      await api.post(`/roadmap-admin/topics/${linkerTopicId}/sync-courses`, {
        course_ids: linkerSelectedCourses
      });
      setShowCourseLinkerModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving course links:', error);
      alert('Gagal menyimpan hubungan course');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-gray-800">Roadmap tidak ditemukan</h2>
        <Link to="/roadmap" className="text-primary hover:underline mt-2 inline-block">
          ← Kembali ke daftar roadmap
        </Link>
      </div>
    );
  }

  const totalCompleted = Object.values(progress).filter((p) => p.status === 'completed').length;
  const overallProgress = roadmap.total_topics > 0 
    ? Math.round((totalCompleted / roadmap.total_topics) * 100) 
    : 0;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Back Button */}
      <Link to="/roadmap" className="text-primary hover:underline mb-4 inline-flex items-center gap-1">
        ← Kembali
      </Link>

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span className="bg-primary/10 text-primary-dark px-2 py-1 rounded">{roadmap.konsentrasi}</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">{roadmap.level}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{roadmap.nama}</h1>
            <p className="text-gray-600 mt-2">{roadmap.deskripsi}</p>
          </div>
          <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4 min-w-[150px]">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${overallProgress * 2.51} 251`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-800">{overallProgress}%</span>
              </div>
            </div>
            <div className="text-sm text-gray-600 mt-2 text-center">
              {totalCompleted} / {roadmap.total_topics} topics
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{roadmap.sections.length}</div>
            <div className="text-sm text-gray-500">Sections</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{roadmap.total_topics}</div>
            <div className="text-sm text-gray-500">Topics</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{roadmap.estimasi_jam || 0}+</div>
            <div className="text-sm text-gray-500">Jam Belajar</div>
          </div>
        </div>
      </div>

      {/* Milestones */}
      {roadmap.milestones.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🏆 Milestones</h2>
          <div className="flex flex-wrap gap-3">
            {roadmap.milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg px-4 py-2"
              >
                <span className="text-2xl">{milestone.badge_icon ? `🏅` : '🎖️'}</span>
                <div>
                  <div className="font-medium text-gray-800">{milestone.nama}</div>
                  {milestone.deskripsi && (
                    <div className="text-xs text-gray-500">{milestone.deskripsi}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-4">
        {roadmap.sections.map((section, sectionIndex) => {
          const sectionProgress = calculateSectionProgress(section);
          const isExpanded = expandedSections.has(section.id);
          
          return (
            <div key={section.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Section Header */}
              <div
                onClick={() => toggleSection(section.id)}
                className="p-4 cursor-pointer hover:bg-gray-50 transition"
                style={{ borderLeft: `4px solid ${section.warna || '#3498db'}` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold">
                      {sectionIndex + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{section.nama}</h3>
                      <p className="text-sm text-gray-500">
                        {section.total_topics} topics • ~{section.estimasi_jam || 0} jam
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${sectionProgress.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 min-w-[50px]">
                        {sectionProgress.completed}/{sectionProgress.total}
                      </span>
                    </div>
                    <span className="text-gray-400 text-xl">
                      {isExpanded ? '▼' : '▶'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section Content */}
              {isExpanded && (
                <div className="border-t">
                  {section.deskripsi && (
                    <div className="px-4 py-3 bg-gray-50 text-sm text-gray-600">
                      {section.deskripsi}
                    </div>
                  )}
                  <div className="p-4 space-y-3">
                    {section.topics.map((topic) => {
                      const isTopicExpanded = expandedTopics.has(topic.id);
                      const topicStatus = progress[topic.id]?.status || 'not_started';
                      
                      return (
                        <div
                          key={topic.id}
                          className={`border-l-4 rounded-r-lg ${getTopicTypeColor(topic.tipe)}`}
                        >
                          <div
                            onClick={() => toggleTopic(topic.id)}
                            className="p-3 cursor-pointer hover:bg-white/50 transition"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-xl">{getTopicStatusIcon(topic.id)}</span>
                                <div>
                                  <div className={`font-medium flex items-center gap-2 ${
                                    topicStatus === 'completed' 
                                      ? 'text-gray-400 line-through' 
                                      : topicStatus === 'skipped'
                                      ? 'text-gray-400'
                                      : 'text-gray-800'
                                  }`}>
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
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className={`px-2 py-0.5 rounded ${
                                      topic.tipe === 'required' ? 'bg-purple-200 text-purple-800' :
                                      topic.tipe === 'recommended' ? 'bg-blue-200 text-primary-dark' :
                                      'bg-gray-200 text-gray-600'
                                    }`}>
                                      {topic.tipe}
                                    </span>
                                    {topic.estimasi_jam && <span>~{topic.estimasi_jam} jam</span>}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {/* Status select for santri */}
                                {user?.santri_id && (
                                  <select
                                    value={topicStatus}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      updateTopicProgress(topic.id, e.target.value);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-sm border rounded px-2 py-1 bg-white"
                                  >
                                    <option value="not_started">⬜ Belum</option>
                                    <option value="in_progress">🔄 Belajar</option>
                                    <option value="completed">✅ Selesai</option>
                                    <option value="skipped">⏭️ Skip</option>
                                  </select>
                                )}
                                {/* Course link button for admin/akademik/mentor */}
                                {canEditCourse && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openCourseLinkerModal(topic.id, topic.nama);
                                    }}
                                    className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                                  >
                                    📚 Course
                                  </button>
                                )}
                                <span className="text-gray-400">
                                  {isTopicExpanded ? '▼' : '▶'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Topic Details */}
                          {isTopicExpanded && (
                            <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                              {topic.deskripsi && (
                                <p className="text-sm text-gray-600 mb-3">{topic.deskripsi}</p>
                              )}
                              
                              {/* Subtopics */}
                              {topic.subtopics.length > 0 && (
                                <div className="mb-3">
                                  <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">Subtopics</h5>
                                  <ul className="space-y-1">
                                    {topic.subtopics.map((st) => (
                                      <li key={st.id} className="flex items-center gap-2 text-sm">
                                        <span>•</span>
                                        <span>{st.nama}</span>
                                        {st.link_referensi && (
                                          <a
                                            href={st.link_referensi}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline text-xs"
                                          >
                                            🔗 Link
                                          </a>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {/* Resources */}
                              {topic.resources.length > 0 && (
                                <div className="mb-3">
                                  <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">Resources</h5>
                                  <div className="grid gap-2">
                                    {topic.resources.map((res) => (
                                      <a
                                        key={res.id}
                                        href={res.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-2 bg-white rounded border hover:border-blue-300 transition"
                                      >
                                        <span>{getResourceIcon(res.tipe)}</span>
                                        <div className="flex-1 min-w-0">
                                          <div className="text-sm font-medium text-gray-800 truncate">
                                            {res.judul}
                                          </div>
                                          <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span>{res.tipe}</span>
                                            <span>•</span>
                                            <span>{res.bahasa === 'id' ? '🇮🇩' : res.bahasa === 'en' ? '🇬🇧' : '🌐'}</span>
                                            {res.gratis && <span className="text-green-600">FREE</span>}
                                          </div>
                                        </div>
                                        <span className="text-primary">→</span>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Linked Courses for this Topic */}
                              {(() => {
                                const topicCourses = linkedCourses.filter((c: any) => 
                                  c.linked_topic_ids?.includes(topic.id) || c.roadmap_topic === topic.id
                                );
                                if (topicCourses.length === 0) return null;
                                
                                return (
                                  <div>
                                    <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">🎓 Course Tersedia</h5>
                                    <div className="grid gap-2">
                                      {topicCourses.map((course: any) => (
                                        <Link
                                          key={course.id_course}
                                          to={`/santri/lms/course/${course.id_course}`}
                                          className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/5 to-blue-50 rounded-lg border border-primary/20 hover:border-primary/40 transition"
                                        >
                                          {course.thumbnail_url ? (
                                            <img src={course.thumbnail_url} alt="" className="w-12 h-12 object-cover rounded" />
                                          ) : (
                                            <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center text-xl">📘</div>
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <div className="font-medium text-gray-800 truncate">{course.judul}</div>
                                            <div className="text-xs text-gray-500">{course.materi_count || 0} materi • {course.durasi_menit || 0} menit</div>
                                          </div>
                                          <span className="text-primary font-semibold">Mulai →</span>
                                        </Link>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Linked Courses */}
      {linkedCourses.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📚 Course Terkait</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {linkedCourses.map((course: any) => (
              <Link
                key={course.id_course}
                to={`/santri/lms/course/${course.id_course}`}
                className="flex items-center gap-3 p-3 border rounded-lg hover:border-blue-300 transition"
              >
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt="" className="w-16 h-16 object-cover rounded" />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-2xl">📘</div>
                )}
                <div>
                  <div className="font-medium text-gray-800">{course.judul}</div>
                  <div className="text-sm text-gray-500">{course.materi_count || 0} materi</div>
                </div>
              </Link>
            ))}
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
                <p className="text-gray-500 text-center py-8">Tidak ada course tersedia</p>
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

export default RoadmapDetailPage;
