import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import SearchableSelect from '../components/SearchableSelect';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { parseVideoUrl, getPlatformLabel } from '../utils/videoEmbed';

interface Section {
  id_section: number;
  judul: string;
  deskripsi: string;
  urutan: number;
  materi: Materi[];
}

interface Materi {
  id_materi: number;
  judul: string;
  konten: string;
  video_url: string | null;
  audio_url: string | null;
  pdf_url: string | null;
  file_url: string | null;
  full_file_url: string | null;
  full_audio_url: string | null;
  full_pdf_url: string | null;
  durasi_menit: number;
  urutan: number;
  section_id: number | null;
}

interface Quiz {
  id_quiz: number;
  judul: string;
  soal_count: number;
}

interface Course {
  id_course: number;
  judul: string;
  deskripsi: string;
  thumbnail: string;
  thumbnail_url: string | null;
  konsentrasi: number | null;
  status: string;
  durasi_menit: number;
  sections: Section[];
  unsectioned_materi: Materi[];
  quiz: Quiz[];
}

interface Konsentrasi {
  id_konsentrasi: number;
  nama_konsentrasi: string;
}

interface RoadmapTopic {
  id: number;
  nama: string;
  section_nama: string;
  section_urutan: number;
  roadmap_nama: string;
  konsentrasi_id: number | null;
}

const LmsCourseFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [konsentrasiList, setKonsentrasiList] = useState<Konsentrasi[]>([]);
  const [roadmapTopics, setRoadmapTopics] = useState<RoadmapTopic[]>([]);
  const [topicSearch, setTopicSearch] = useState('');
  
  // Course form
  const [form, setForm] = useState({
    judul: '',
    deskripsi: '',
    konsentrasi: '',
    roadmap_topics: [] as number[],
    status: 'draft',
    content_mode: 'structured' as 'simple' | 'structured',
    video_url: '',
    thumbnail: null as File | null,
    pdf_file: null as File | null
  });
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [existingPdfUrl, setExistingPdfUrl] = useState<string | null>(null);

  // Sections & Materi
  const [sections, setSections] = useState<Section[]>([]);
  const [unsectionedMateri, setUnsectionedMateri] = useState<Materi[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  // Modals
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [sectionForm, setSectionForm] = useState({ judul: '', deskripsi: '' });

  const [showMateriModal, setShowMateriModal] = useState(false);
  const [editingMateri, setEditingMateri] = useState<Materi | null>(null);
  const [materiSectionId, setMateriSectionId] = useState<number | null>(null);
  const [materiForm, setMateriForm] = useState({
    judul: '',
    konten: '',
    video_url: '',
    canva_embed: '',
    durasi_menit: 0,
    audioFile: null as File | null,
    pdfFile: null as File | null,
    file: null as File | null
  });

  useEffect(() => {
    fetchKonsentrasi();
    fetchRoadmapTopics();
    if (isEdit) {
      fetchCourse();
    }
  }, [id]);

  const fetchKonsentrasi = async () => {
    try {
      const res = await api.get('/master/konsentrasi');
      // Response langsung array: [{ id_konsentrasi, nama_konsentrasi }, ...]
      const data = Array.isArray(res) ? res : (res.data || []);
      setKonsentrasiList(data);
    } catch (err) {
      console.error('Fetch konsentrasi error:', err);
    }
  };

  const fetchRoadmapTopics = async () => {
    try {
      const roadmaps = await api.getRoadmaps();
      const topics: RoadmapTopic[] = [];
      for (const roadmap of roadmaps || []) {
        try {
          const detail = await api.getRoadmapDetail(roadmap.id);
          for (const section of detail?.sections || []) {
            for (const topic of section.topics || []) {
              topics.push({
                id: topic.id,
                nama: topic.nama,
                section_nama: section.nama,
                section_urutan: section.urutan || 0,
                roadmap_nama: roadmap.nama,
                konsentrasi_id: roadmap.konsentrasi_id || null,
              });
            }
          }
        } catch (detailErr) {
          console.warn(`Failed to fetch roadmap ${roadmap.id}:`, detailErr);
        }
      }
      setRoadmapTopics(topics);
    } catch (err) {
      console.warn('Failed to fetch roadmaps:', err);
      // Don't block the page if roadmaps fail to load
    }
  };

  // Filter roadmap topics by selected konsentrasi and search term
  const filteredRoadmapTopics = useMemo(() => {
    let filtered = roadmapTopics;
    
    // Filter by konsentrasi
    if (form.konsentrasi) {
      const selectedKonsentrasiId = parseInt(form.konsentrasi);
      filtered = filtered.filter(t => t.konsentrasi_id === selectedKonsentrasiId);
    }
    
    // Filter by search term
    if (topicSearch.trim()) {
      const search = topicSearch.toLowerCase();
      filtered = filtered.filter(t => 
        t.nama.toLowerCase().includes(search) || 
        t.section_nama.toLowerCase().includes(search) ||
        t.roadmap_nama.toLowerCase().includes(search)
      );
    }
    
    // Sort by section order
    return filtered.sort((a, b) => a.section_urutan - b.section_urutan);
  }, [roadmapTopics, form.konsentrasi, topicSearch]);

  const fetchCourse = async () => {
    try {
      const res = await api.get(`/lms/courses/${id}`);
      // Response: { success: true, data: { id_course, judul, ... } }
      const course = res.data;
      if (!course) {
        throw new Error('Course tidak ditemukan');
      }
      // Load roadmap_topics array from API (linked_topic_ids or roadmapTopics relation)
      let topicIds: number[] = [];
      if (course.linked_topic_ids && Array.isArray(course.linked_topic_ids)) {
        topicIds = course.linked_topic_ids;
      } else if (course.roadmap_topics && Array.isArray(course.roadmap_topics)) {
        topicIds = course.roadmap_topics.map((t: any) => t.id_topic || t.id);
      } else if (course.roadmap_topic) {
        // Fallback for single topic
        const singleId = typeof course.roadmap_topic === 'object' 
          ? course.roadmap_topic?.id_topic 
          : course.roadmap_topic;
        if (singleId) topicIds = [Number(singleId)];
      }
      
      setForm({
        judul: course.judul || '',
        deskripsi: course.deskripsi || '',
        konsentrasi: course.konsentrasi?.toString() || '',
        roadmap_topics: topicIds,
        status: course.status || 'draft',
        content_mode: course.content_mode || 'structured',
        video_url: course.video_url || '',
        thumbnail: null,
        pdf_file: null
      });
      setThumbnailPreview(course.thumbnail_url || null);
      setExistingPdfUrl(course.pdf_url || null);
      setSections(course.sections || []);
      setUnsectionedMateri(course.unsectioned_materi || []);
      setQuizzes(course.quiz || []);
    } catch (err: any) {
      console.error('Fetch course error:', err);
      alert('Gagal memuat course: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, thumbnail: file });
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveCourse = async () => {
    if (!form.judul.trim()) {
      alert('Judul course wajib diisi');
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append('judul', form.judul);
    formData.append('deskripsi', form.deskripsi);
    if (form.konsentrasi) formData.append('konsentrasi', form.konsentrasi);
    // Send roadmap_topics as array
    form.roadmap_topics.forEach((topicId, idx) => {
      formData.append(`roadmap_topics[${idx}]`, topicId.toString());
    });
    formData.append('status', form.status);
    formData.append('content_mode', form.content_mode);
    if (form.video_url) formData.append('video_url', form.video_url);
    if (form.thumbnail) formData.append('thumbnail', form.thumbnail);
    if (form.pdf_file) formData.append('pdf_file', form.pdf_file);

    try {
      if (isEdit) {
        await api.post(`/lms/courses/${id}`, formData);
        alert('Course berhasil diupdate');
        fetchCourse();
      } else {
        const res = await api.post('/lms/courses', formData);
        alert('Course berhasil dibuat');
        // Response structure: { success: true, data: { id_course: ... } }
        const courseId = res?.data?.id_course || res?.id_course;
        if (courseId) {
          navigate(`/lms/courses/${courseId}/edit`, { replace: true });
        } else {
          console.error('Response:', res);
          navigate('/lms/courses', { replace: true });
        }
      }
    } catch (err: any) {
      console.error('Save course error:', err);
      const message = err?.message || err?.response?.data?.message || 'Gagal menyimpan course';
      alert(`Error: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  // Section handlers
  const openSectionModal = (section?: Section) => {
    if (section) {
      setEditingSection(section);
      setSectionForm({ judul: section.judul, deskripsi: section.deskripsi || '' });
    } else {
      setEditingSection(null);
      setSectionForm({ judul: '', deskripsi: '' });
    }
    setShowSectionModal(true);
  };

  const handleSaveSection = async () => {
    if (!sectionForm.judul.trim()) return;
    try {
      if (editingSection) {
        await api.put(`/lms/courses/${id}/sections/${editingSection.id_section}`, sectionForm);
      } else {
        await api.post(`/lms/courses/${id}/sections`, sectionForm);
      }
      setShowSectionModal(false);
      fetchCourse();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan sesi');
    }
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!confirm('Yakin hapus sesi ini? Materi di dalamnya akan dipindah ke luar sesi.')) return;
    try {
      await api.delete(`/lms/courses/${id}/sections/${sectionId}`);
      fetchCourse();
    } catch (err) {
      console.error(err);
    }
  };

  // Materi handlers
  const openMateriModal = (sectionId: number | null, materi?: Materi) => {
    setMateriSectionId(sectionId);
    if (materi) {
      setEditingMateri(materi);
      setMateriForm({
        judul: materi.judul,
        konten: materi.konten || '',
        video_url: materi.video_url || '',
        canva_embed: (materi as any).canva_embed || '',
        durasi_menit: materi.durasi_menit,
        audioFile: null,
        pdfFile: null,
        file: null
      });
    } else {
      setEditingMateri(null);
      setMateriForm({ judul: '', konten: '', video_url: '', canva_embed: '', durasi_menit: 0, audioFile: null, pdfFile: null, file: null });
    }
    setShowMateriModal(true);
  };

  const handleSaveMateri = async () => {
    if (!materiForm.judul.trim()) return;
    const formData = new FormData();
    formData.append('judul', materiForm.judul);
    formData.append('konten', materiForm.konten);
    formData.append('video_url', materiForm.video_url);
    formData.append('canva_embed', materiForm.canva_embed);
    formData.append('durasi_menit', materiForm.durasi_menit.toString());
    if (materiSectionId) formData.append('section_id', materiSectionId.toString());
    if (materiForm.audioFile) formData.append('audio', materiForm.audioFile);
    if (materiForm.pdfFile) formData.append('pdf', materiForm.pdfFile);
    if (materiForm.file) formData.append('file', materiForm.file);

    try {
      if (editingMateri) {
        await api.post(`/lms/courses/${id}/materi/${editingMateri.id_materi}`, formData);
      } else {
        await api.post(`/lms/courses/${id}/materi`, formData);
      }
      setShowMateriModal(false);
      fetchCourse();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan materi');
    }
  };

  const handleDeleteMateri = async (materiId: number) => {
    if (!confirm('Yakin hapus materi ini?')) return;
    try {
      await api.delete(`/lms/courses/${id}/materi/${materiId}`);
      fetchCourse();
    } catch (err) {
      console.error(err);
    }
  };

  const getMateriIcons = (materi: Materi) => {
    const icons = [];
    if (materi.konten) icons.push('📝');
    if (materi.video_url) icons.push('🎬');
    if (materi.audio_url || materi.full_audio_url) icons.push('🎧');
    if (materi.pdf_url || materi.full_pdf_url) icons.push('📄');
    if (materi.file_url || materi.full_file_url) icons.push('📁');
    return icons.length > 0 ? icons.join(' ') : '📝';
  };

  const getMateriTypes = (materi: Materi) => {
    const types = [];
    if (materi.konten) types.push('Teks');
    if (materi.video_url) types.push('Video');
    if (materi.audio_url || materi.full_audio_url) types.push('Audio');
    if (materi.pdf_url || materi.full_pdf_url) types.push('PDF');
    if (materi.file_url || materi.full_file_url) types.push('File');
    return types.length > 0 ? types.join(', ') : 'Kosong';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link to="/lms/courses" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary text-sm mb-3 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Courses
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{isEdit ? '✏️ Edit Course' : '🎓 Buat Course Baru'}</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {isEdit ? 'Perbarui informasi dan konten course' : 'Mulai dengan mengisi informasi dasar course'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isEdit && (
                <Link
                  to={`/lms/courses/${id}`}
                  className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition"
                  title="Lihat Tampilan Publik"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Lihat Course
                </Link>
              )}
              <button
                onClick={handleSaveCourse}
                disabled={saving}
                className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-dark disabled:opacity-50 transition shadow-md hover:shadow-lg"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Simpan Course
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Dynamic grid: full-width for new course, 2-column when editing structured mode */}
        <div className={`grid gap-8 ${
          isEdit && form.content_mode === 'structured' 
            ? 'grid-cols-1 lg:grid-cols-3' 
            : 'grid-cols-1 max-w-3xl mx-auto'
        }`}>
          {/* Left: Course Info */}
          <div className={`space-y-6 ${isEdit && form.content_mode === 'structured' ? 'lg:col-span-1' : ''}`}>
            {/* Thumbnail Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">🖼️</span>
                  Thumbnail
                </h2>
              </div>
              <div className="p-5">
                {thumbnailPreview ? (
                  <div className="relative group">
                    <img 
                      src={thumbnailPreview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-xl border-2 border-gray-100" 
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <label className="cursor-pointer bg-white text-gray-800 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-100 transition shadow-lg">
                        📷 Ganti Gambar
                        <input type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300 group">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary/10 transition">
                      <svg className="w-7 h-7 text-gray-400 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-600 group-hover:text-primary">Klik untuk upload</span>
                    <span className="text-xs text-gray-400 mt-1">JPG, PNG max 2MB</span>
                    <input type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
                  </label>
                )}
                <p className="text-xs text-gray-400 mt-3 flex items-center justify-center gap-1.5 bg-gray-50 py-2 rounded-lg">
                  <span>☁️</span> Upload otomatis ke Cloudinary
                </p>
              </div>
            </div>

            {/* Content Mode Selector */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">📋</span>
                  Mode Konten
                </h2>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, content_mode: 'simple' })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      form.content_mode === 'simple' 
                        ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">📝</div>
                    <div className="font-semibold text-gray-800">Simple</div>
                    <div className="text-xs text-gray-500 mt-1">Tulis tutorial langsung di deskripsi</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, content_mode: 'structured' })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      form.content_mode === 'structured' 
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">📚</div>
                    <div className="font-semibold text-gray-800">Structured</div>
                    <div className="text-xs text-gray-500 mt-1">Buat sections & materi terstruktur</div>
                  </button>
                </div>
                {form.content_mode === 'simple' && (
                  <p className="text-xs text-purple-600 mt-3 bg-purple-50 p-2 rounded-lg">
                    💡 Mode Simple: Gunakan deskripsi sebagai konten utama (WYSIWYG)
                  </p>
                )}
              </div>
            </div>

            {/* Course Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">📝</span>
                  Informasi Course
                </h2>
              </div>
              <div className="p-5 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Judul Course <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.judul}
                    onChange={(e) => setForm({ ...form, judul: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                    placeholder="Contoh: Belajar React dari Nol"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi {form.content_mode === 'simple' && <span className="text-purple-600 text-xs font-normal">(Konten Utama)</span>}
                  </label>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <ReactQuill
                      theme="snow"
                      value={form.deskripsi}
                      onChange={(v) => setForm({ ...form, deskripsi: v })}
                      className={`bg-white ${form.content_mode === 'simple' ? '[&_.ql-editor]:min-h-[300px]' : '[&_.ql-editor]:min-h-[150px]'}`}
                      placeholder="Jelaskan apa yang akan dipelajari santri..."
                    />
                  </div>
                  {form.content_mode === 'simple' ? (
                    <div className="mt-3 bg-purple-50 border border-purple-100 rounded-xl p-4">
                      <p className="font-medium text-purple-800 text-sm mb-2">💡 Tips Mode Simple:</p>
                      <ul className="text-xs text-purple-700 space-y-1">
                        <li>• Gunakan <strong>Heading</strong> untuk membagi topik per section</li>
                        <li>• Embed <strong>YouTube</strong> via Insert → Video atau paste link langsung</li>
                        <li>• Tambahkan <strong>gambar</strong> via Insert → Image</li>
                        <li>• Sisipkan <strong>code</strong> via Insert → Code Block</li>
                        <li>• Untuk Canva/PDF/file, gunakan <strong>Structured Mode</strong></li>
                      </ul>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 mt-2">
                      Deskripsi singkat tentang course ini (overview)
                    </p>
                  )}
                </div>

                {/* Media Fields - Video & PDF */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">🎬 Video URL</label>
                    <input
                      type="text"
                      value={form.video_url}
                      onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                      placeholder="YouTube/Vimeo URL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">📄 File PDF</label>
                    {existingPdfUrl && !form.pdf_file && (
                      <a href={existingPdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline block mb-1">
                        📎 PDF saat ini
                      </a>
                    )}
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setForm({ ...form, pdf_file: e.target.files?.[0] || null })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Konsentrasi</label>
                  <SearchableSelect
                    options={[{ value: '', label: 'Semua Konsentrasi' }, ...konsentrasiList.map(k => ({ value: k.id_konsentrasi.toString(), label: k.nama_konsentrasi }))]}
                    value={form.konsentrasi}
                    onChange={(v) => setForm({ ...form, konsentrasi: v ? String(v) : '' })}
                    placeholder="Pilih konsentrasi course ini"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Roadmap Topics (Multi-select)
                    <Link to="/roadmap" className="text-primary hover:underline text-xs ml-2 font-normal">
                      Lihat Roadmap →
                    </Link>
                  </label>
                  {/* Search Input */}
                  <div className="relative mb-3">
                    <input
                      type="text"
                      value={topicSearch}
                      onChange={(e) => setTopicSearch(e.target.value)}
                      placeholder="🔍 Cari topic..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pl-10 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                    />
                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {topicSearch && (
                      <button
                        type="button"
                        onClick={() => setTopicSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  {!form.konsentrasi ? (
                    <div className="text-sm text-gray-400 bg-gray-50 rounded-xl p-4 text-center">
                      📋 Pilih konsentrasi terlebih dahulu untuk melihat roadmap topics
                    </div>
                  ) : (() => {
                    // Group filtered topics by roadmap
                    const groupedTopics = filteredRoadmapTopics.reduce((acc, t) => {
                      const key = t.roadmap_nama;
                      if (!acc[key]) acc[key] = [];
                      acc[key].push(t);
                      return acc;
                    }, {} as Record<string, RoadmapTopic[]>);
                    
                    if (Object.keys(groupedTopics).length === 0) {
                      return (
                        <div className="text-sm text-orange-500 bg-orange-50 rounded-xl p-4 text-center">
                          ⚠️ Belum ada roadmap untuk konsentrasi ini
                        </div>
                      );
                    }
                    
                    return (
                      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl bg-gray-50">
                        {Object.entries(groupedTopics).map(([roadmapName, topics]) => (
                          <div key={roadmapName} className="border-b border-gray-200 last:border-b-0">
                            <div className="px-3 py-2 bg-gray-100 font-medium text-sm text-gray-700 sticky top-0">
                              🗺️ {roadmapName}
                            </div>
                            <div className="p-2 space-y-1">
                              {topics.map(t => (
                                <label 
                                  key={t.id} 
                                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition hover:bg-white ${
                                    form.roadmap_topics.includes(t.id) ? 'bg-primary/10 border border-primary/30' : ''
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={form.roadmap_topics.includes(t.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setForm({ ...form, roadmap_topics: [...form.roadmap_topics, t.id] });
                                      } else {
                                        setForm({ ...form, roadmap_topics: form.roadmap_topics.filter(id => id !== t.id) });
                                      }
                                    }}
                                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-800 text-sm truncate">{t.nama}</div>
                                    <div className="text-xs text-gray-500">{t.section_nama}</div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                  {form.roadmap_topics.length > 0 && (
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-green-600">
                        ✅ {form.roadmap_topics.length} topic terpilih
                      </p>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, roadmap_topics: [] })}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Reset
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className="flex gap-2">
                    {[
                      { value: 'draft', label: 'Draft', icon: '📝', color: 'bg-gray-100 text-gray-700 border-gray-200' },
                      { value: 'published', label: 'Published', icon: '🌐', color: 'bg-green-50 text-green-700 border-green-200' },
                      { value: 'archived', label: 'Archived', icon: '📦', color: 'bg-orange-50 text-orange-700 border-orange-200' },
                    ].map(s => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setForm({ ...form, status: s.value })}
                        className={`flex-1 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          form.status === s.value 
                            ? `${s.color} ring-2 ring-offset-1 ring-primary/30 scale-[1.02]` 
                            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        <span className="block text-lg mb-0.5">{s.icon}</span>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          {isEdit && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Quiz</h2>
              <div className="space-y-2">
                {quizzes.map(quiz => (
                  <Link
                    key={quiz.id_quiz}
                    to={`/lms/quiz/${quiz.id_quiz}/soal`}
                    className="block p-3 bg-purple-50 rounded-lg hover:bg-purple-100"
                  >
                    <p className="font-medium text-purple-800">{quiz.judul}</p>
                    <p className="text-sm text-purple-600">{quiz.soal_count} soal</p>
                  </Link>
                ))}
              </div>
              <Link
                to={`/lms/courses/${id}`}
                className="mt-3 block text-center text-primary hover:underline text-sm"
              >
                Kelola Quiz &rarr;
              </Link>
            </div>
          )}
        </div>


        {/* Right: Sections & Materi (only for edit + structured mode) */}
        {isEdit && form.content_mode === 'structured' && (
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Header Konten */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">📖 Konten Course</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {sections.length} sesi • {sections.reduce((acc, s) => acc + s.materi.length, 0) + unsectionedMateri.length} materi
                  </p>
                </div>
                <button
                  onClick={() => openSectionModal()}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl hover:from-green-600 hover:to-emerald-700 transition shadow-md hover:shadow-lg font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Tambah Sesi
                </button>
              </div>

              {/* Unsectioned Materi */}
              {unsectionedMateri.length > 0 && (
                <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-amber-800 flex items-center gap-2">
                      <span className="w-6 h-6 bg-amber-200 rounded-lg flex items-center justify-center text-sm">📝</span>
                      Materi Tanpa Sesi
                    </h3>
                    <button
                      onClick={() => openMateriModal(null)}
                      className="text-amber-700 hover:text-amber-900 text-sm font-medium hover:underline"
                    >
                      + Tambah Materi
                    </button>
                  </div>
                  <div className="space-y-2">
                    {unsectionedMateri.map(materi => (
                      <div key={materi.id_materi} className="bg-white p-4 rounded-xl flex items-center gap-4 shadow-sm border border-amber-100 hover:shadow-md transition group">
                        <span className="text-2xl">{getMateriIcons(materi)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{materi.judul}</p>
                          <p className="text-xs text-gray-500">{getMateriTypes(materi)} • {materi.durasi_menit} menit</p>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                          <button onClick={() => openMateriModal(null, materi)} className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20">Edit</button>
                          <button onClick={() => handleDeleteMateri(materi.id_materi)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100">Hapus</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sections */}
              {sections.map((section, idx) => (
                <div key={section.id_section} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                  <div className="bg-gradient-to-r from-primary/5 to-blue-50 p-5 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center font-bold text-primary">{idx + 1}</span>
                      <div>
                        <h3 className="font-semibold text-gray-800">{section.judul}</h3>
                        {section.deskripsi && <p className="text-sm text-gray-500">{section.deskripsi}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openMateriModal(section.id_section)} className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-dark transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Materi
                      </button>
                      <button onClick={() => openSectionModal(section)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDeleteSection(section.id_section)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    {section.materi.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <span className="text-3xl block mb-2">📭</span>
                        <p className="text-sm">Belum ada materi di sesi ini</p>
                      </div>
                    ) : (
                      section.materi.map(materi => (
                        <div key={materi.id_materi} className="bg-gray-50 p-4 rounded-xl flex items-center gap-4 hover:bg-gray-100 transition group">
                          <span className="text-2xl">{getMateriIcons(materi)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate">{materi.judul}</p>
                            <p className="text-xs text-gray-500">{getMateriTypes(materi)} • {materi.durasi_menit} menit</p>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                            <button onClick={() => openMateriModal(section.id_section, materi)} className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20">Edit</button>
                            <button onClick={() => handleDeleteMateri(materi.id_materi)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100">Hapus</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}

              {sections.length === 0 && unsectionedMateri.length === 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">🚀</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Mulai buat konten!</h3>
                  <p className="text-gray-500 max-w-sm mx-auto mb-6">
                    Tambahkan sesi untuk mengorganisir materi pembelajaran dengan rapi
                  </p>
                  <button
                    onClick={() => openSectionModal()}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Tambah Sesi Pertama
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>

      {/* Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">{editingSection ? 'Edit Sesi' : 'Tambah Sesi'}</h2>
              <button onClick={() => setShowSectionModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Sesi *</label>
                <input
                  type="text"
                  value={sectionForm.judul}
                  onChange={(e) => setSectionForm({ ...sectionForm, judul: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Contoh: Bab 1 - Pengenalan"
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
              <div className="flex gap-2">
                <button onClick={() => setShowSectionModal(false)} className="flex-1 border rounded-lg py-2 hover:bg-gray-50">Batal</button>
                <button onClick={handleSaveSection} className="flex-1 bg-primary text-white rounded-lg py-2 hover:bg-primary-dark">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Materi Modal */}
      {showMateriModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-lg font-semibold">{editingMateri ? 'Edit Materi' : 'Tambah Materi'}</h2>
              <button onClick={() => setShowMateriModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Judul Materi *</label>
                <input
                  type="text"
                  value={materiForm.judul}
                  onChange={(e) => setMateriForm({ ...materiForm, judul: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              
              {/* Konten Teks (WYSIWYG) */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">📝</span>
                  <label className="font-medium">Konten Materi</label>
                </div>
                <ReactQuill
                  theme="snow"
                  value={materiForm.konten}
                  onChange={(v) => setMateriForm({ ...materiForm, konten: v })}
                  className="bg-white [&_.ql-editor]:min-h-[200px]"
                />
                <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <p className="font-medium text-blue-800 text-xs mb-1">💡 Tips:</p>
                  <ul className="text-xs text-blue-700 space-y-0.5">
                    <li>• Embed <strong>YouTube</strong>: Insert → Video</li>
                    <li>• Tambah <strong>gambar</strong>: Insert → Image</li>
                    <li>• Sisipkan <strong>code</strong>: Insert → Code Block</li>
                  </ul>
                </div>
              </div>

              {/* Video URL - Multi Platform */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🎬</span>
                  <label className="font-medium">Video</label>
                  <span className="text-xs bg-primary/10 text-primary-dark px-2 py-0.5 rounded-full">Multi-Platform</span>
                </div>
                <input
                  type="url"
                  value={materiForm.video_url}
                  onChange={(e) => setMateriForm({ ...materiForm, video_url: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Paste link YouTube, Vimeo, Instagram, TikTok, Google Drive..."
                />
                <div className="mt-2 flex flex-wrap gap-1">
                  {['YouTube', 'Vimeo', 'Instagram', 'TikTok', 'G-Drive'].map(p => (
                    <span key={p} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{p}</span>
                  ))}
                </div>
                
                {/* Video Preview */}
                {materiForm.video_url && (() => {
                  const videoInfo = parseVideoUrl(materiForm.video_url);
                  if (videoInfo.embedUrl) {
                    return (
                      <div className="mt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-green-600">✓ Terdeteksi:</span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            {getPlatformLabel(videoInfo.platform)}
                          </span>
                        </div>
                        <div className="aspect-video bg-black rounded-lg overflow-hidden">
                          {videoInfo.platform === 'direct' ? (
                            <video src={videoInfo.embedUrl} controls className="w-full h-full" />
                          ) : (
                            <iframe 
                              src={videoInfo.embedUrl} 
                              className="w-full h-full" 
                              allowFullScreen
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            />
                          )}
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <p className="mt-2 text-xs text-orange-600">
                        ⚠️ Format URL tidak dikenali. Paste URL video dari platform yang didukung.
                      </p>
                    );
                  }
                })()}
              </div>

              {/* Canva Embed */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🎨</span>
                  <label className="font-semibold text-gray-700">Canva Presentation</label>
                </div>
                <input
                  type="text"
                  value={materiForm.canva_embed}
                  onChange={(e) => setMateriForm({ ...materiForm, canva_embed: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Paste Canva embed URL (dari tombol Share > Embed)"
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Di Canva, klik Share → More → Embed → Copy link
                </p>
                {materiForm.canva_embed && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-green-600">✓ Preview:</span>
                    </div>
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <iframe 
                        src={materiForm.canva_embed} 
                        className="w-full h-full border-0"
                        allowFullScreen
                        allow="fullscreen"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Audio Upload */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🎧</span>
                  <label className="font-medium">Audio</label>
                </div>
                {editingMateri?.full_audio_url && !materiForm.audioFile && (
                  <div className="mb-2 p-2 bg-green-50 rounded flex items-center justify-between">
                    <span className="text-sm text-green-700">Audio sudah ada</span>
                    <audio controls className="h-8"><source src={editingMateri.full_audio_url} /></audio>
                  </div>
                )}
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setMateriForm({ ...materiForm, audioFile: e.target.files?.[0] || null })}
                  className="w-full border rounded-lg px-3 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">Format: MP3, WAV, OGG. Max 50MB</p>
              </div>

              {/* PDF Upload */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">📄</span>
                  <label className="font-medium">PDF</label>
                </div>
                {editingMateri?.full_pdf_url && !materiForm.pdfFile && (
                  <div className="mb-2 p-2 bg-red-50 rounded flex items-center justify-between">
                    <span className="text-sm text-red-700">PDF sudah ada</span>
                    <a href={editingMateri.full_pdf_url} target="_blank" rel="noreferrer" className="text-red-600 underline text-sm">Lihat PDF</a>
                  </div>
                )}
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setMateriForm({ ...materiForm, pdfFile: e.target.files?.[0] || null })}
                  className="w-full border rounded-lg px-3 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">Format: PDF. Max 50MB</p>
              </div>

              {/* File Upload */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">📁</span>
                  <label className="font-medium">File Lainnya</label>
                </div>
                {editingMateri?.full_file_url && !materiForm.file && (
                  <div className="mb-2 p-2 bg-primary/5 rounded flex items-center justify-between">
                    <span className="text-sm text-primary-dark">File sudah ada</span>
                    <a href={editingMateri.full_file_url} target="_blank" rel="noreferrer" className="text-primary underline text-sm">Download</a>
                  </div>
                )}
                <input
                  type="file"
                  onChange={(e) => setMateriForm({ ...materiForm, file: e.target.files?.[0] || null })}
                  className="w-full border rounded-lg px-3 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">Max 50MB. DOC, PPT, ZIP, dll.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Durasi (menit)</label>
                <input
                  type="number"
                  min="0"
                  value={materiForm.durasi_menit}
                  onChange={(e) => setMateriForm({ ...materiForm, durasi_menit: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button onClick={() => setShowMateriModal(false)} className="flex-1 border rounded-lg py-2 hover:bg-gray-50">Batal</button>
                <button onClick={handleSaveMateri} className="flex-1 bg-primary text-white rounded-lg py-2 hover:bg-primary-dark">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LmsCourseFormPage;
