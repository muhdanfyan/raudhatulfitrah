import { useState, useEffect, useCallback } from 'react';
import { 
  PenTool, Plus, Loader2, ChevronLeft, Calendar, Tag, Eye, Copy, Check, 
  Sparkles, Target, Trophy, Flame, BookOpen, Lightbulb, FileText, Trash2,
  Image, Link2, Save, Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { API_URL, getHeaders } from '../../services/api';


// Enhanced Quill modules with more features
const quillModules = {
  toolbar: {
    container: [
      [{ 'header': [1, 2, 3, 4, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean']
    ]
  },
  clipboard: {
    matchVisual: false
  }
};

const quillFormats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'script',
  'list', 'bullet', 'indent',
  'align',
  'blockquote', 'code-block',
  'link', 'image', 'video'
];

const kategoriOptions = [
  { value: 'teknologi', label: 'Teknologi', color: 'from-blue-500 to-cyan-500', icon: '💻' },
  { value: 'Tutorial', label: 'Tutorial', color: 'from-green-500 to-emerald-500', icon: '📚' },
  { value: 'ibadah', label: 'Ibadah', color: 'from-purple-500 to-violet-500', icon: '🕌' },
  { value: 'review_kajian', label: 'Review Kajian', color: 'from-amber-500 to-orange-500', icon: '📖' },
  { value: 'produktifitas', label: 'Produktivitas', color: 'from-cyan-500 to-teal-500', icon: '⚡' },
  { value: 'hiburan', label: 'Hiburan', color: 'from-pink-500 to-rose-500', icon: '🎮' },
  { value: 'psikologi', label: 'Psikologi', color: 'from-indigo-500 to-purple-500', icon: '🧠' },
  { value: 'nasional', label: 'Nasional', color: 'from-red-500 to-orange-500', icon: '🇮🇩' },
  { value: 'internasional', label: 'Internasional', color: 'from-blue-600 to-indigo-600', icon: '🌍' },
  { value: 'pengalaman', label: 'Pengalaman', color: 'from-teal-500 to-green-500', icon: '✨' },
];

const writingTips = [
  "Mulai dengan hook yang menarik untuk memikat pembaca",
  "Gunakan subjudul untuk memecah konten panjang",
  "Tambahkan gambar atau ilustrasi untuk memperjelas",
  "Tutup dengan kesimpulan yang memorable",
  "Baca ulang dan edit sebelum publikasi",
  "Gunakan bahasa yang mudah dipahami",
  "Tambahkan contoh konkret untuk memperkuat argumen",
  "Sisipkan quote atau ayat yang relevan"
];

const articleTemplates = [
  {
    name: 'Tutorial',
    icon: '📚',
    content: `<h2>Pendahuluan</h2>
<p>Jelaskan apa yang akan dipelajari pembaca...</p>

<h2>Persiapan</h2>
<p>Apa saja yang dibutuhkan sebelum mulai...</p>

<h2>Langkah 1: [Judul Langkah]</h2>
<p>Penjelasan langkah pertama...</p>

<h2>Langkah 2: [Judul Langkah]</h2>
<p>Penjelasan langkah kedua...</p>

<h2>Kesimpulan</h2>
<p>Ringkasan dan tips tambahan...</p>`
  },
  {
    name: 'Review',
    icon: '⭐',
    content: `<h2>Overview</h2>
<p>Pengenalan singkat tentang apa yang direview...</p>

<h2>Kelebihan</h2>
<ul>
<li>Kelebihan pertama</li>
<li>Kelebihan kedua</li>
</ul>

<h2>Kekurangan</h2>
<ul>
<li>Kekurangan pertama</li>
<li>Kekurangan kedua</li>
</ul>

<h2>Kesimpulan</h2>
<p>Penilaian akhir dan rekomendasi...</p>`
  },
  {
    name: 'Opini',
    icon: '💭',
    content: `<h2>Latar Belakang</h2>
<p>Konteks dan alasan menulis topik ini...</p>

<h2>Argumen Utama</h2>
<p>Pendapat dan argumen kamu...</p>

<h2>Bukti Pendukung</h2>
<p>Data, fakta, atau pengalaman yang mendukung...</p>

<h2>Penutup</h2>
<p>Kesimpulan dan ajakan untuk pembaca...</p>`
  },
  {
    name: 'Cerita',
    icon: '📝',
    content: `<h2>Pembuka</h2>
<p>Set the scene - kapan, dimana, siapa...</p>

<h2>Konflik/Tantangan</h2>
<p>Masalah atau tantangan yang dihadapi...</p>

<h2>Proses/Perjalanan</h2>
<p>Bagaimana menghadapi tantangan tersebut...</p>

<h2>Resolusi</h2>
<p>Hasil akhir dan pelajaran yang didapat...</p>`
  }
];

function ArticleContent({ content }: { content: string }) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const copyCode = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const parseContent = () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const elements: JSX.Element[] = [];
    let codeIndex = 0;

    const processNode = (node: Node, key: string): JSX.Element | null => {
      if (node.nodeType === Node.TEXT_NODE) {
        return <span key={key}>{node.textContent}</span>;
      }
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        const tagName = el.tagName.toLowerCase();
        
        if (tagName === 'pre' || el.classList.contains('ql-code-block-container') || el.classList.contains('ql-code-block')) {
          const codeText = el.textContent || '';
          const currentIndex = codeIndex++;
          return (
            <div key={key} className="relative my-4 group">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-sm leading-relaxed">
                <code>{codeText}</code>
              </pre>
              <button
                onClick={() => copyCode(codeText, currentIndex)}
                className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
              >
                {copiedIndex === currentIndex ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          );
        }

        if (tagName === 'code' && el.parentElement?.tagName.toLowerCase() !== 'pre') {
          return <code key={key} className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono">{el.textContent}</code>;
        }
        
        const children = Array.from(el.childNodes).map((child, i) => processNode(child, `${key}-${i}`)).filter(Boolean);
        const props: any = { key };
        
        switch (tagName) {
          case 'p': return <p {...props} className="mb-4">{children}</p>;
          case 'h1': return <h1 {...props} className="text-2xl font-bold mt-6 mb-3">{children}</h1>;
          case 'h2': return <h2 {...props} className="text-xl font-bold mt-5 mb-2">{children}</h2>;
          case 'h3': return <h3 {...props} className="text-lg font-bold mt-4 mb-2">{children}</h3>;
          case 'h4': return <h4 {...props} className="text-base font-bold mt-3 mb-2">{children}</h4>;
          case 'strong': case 'b': return <strong {...props}>{children}</strong>;
          case 'em': case 'i': return <em {...props}>{children}</em>;
          case 'u': return <u {...props}>{children}</u>;
          case 's': case 'strike': return <s {...props}>{children}</s>;
          case 'ul': return <ul {...props} className="list-disc pl-6 my-3 space-y-1">{children}</ul>;
          case 'ol': return <ol {...props} className="list-decimal pl-6 my-3 space-y-1">{children}</ol>;
          case 'li': return <li {...props}>{children}</li>;
          case 'blockquote': return <blockquote {...props} className="border-l-4 border-purple-500 bg-purple-50 pl-4 py-2 my-4 italic text-gray-700">{children}</blockquote>;
          case 'a': return <a {...props} href={(el as HTMLAnchorElement).href} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">{children}</a>;
          case 'img': return <img {...props} src={(el as HTMLImageElement).src} alt="" className="max-w-full rounded-lg my-4 shadow-md" />;
          case 'iframe': return <div key={key} className="aspect-video my-4"><iframe src={(el as HTMLIFrameElement).src} className="w-full h-full rounded-lg" allowFullScreen /></div>;
          case 'br': return <br key={key} />;
          default: return <span {...props}>{children}</span>;
        }
      }
      return null;
    };

    Array.from(doc.body.childNodes).forEach((node, i) => {
      const el = processNode(node, `node-${i}`);
      if (el) elements.push(el);
    });

    return elements;
  };

  return <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">{parseContent()}</div>;
}

export default function SantriTulisanPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [viewArticle, setViewArticle] = useState<any>(null);
  const [formData, setFormData] = useState({
    judul: '',
    kategori: 'teknologi',
    isi: '',
    image_url: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [autoSaved, setAutoSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user?.santri_id) fetchData();
    // Load draft from localStorage
    const draft = localStorage.getItem(`tulisan_draft_${user?.santri_id}`);
    if (draft) {
      const parsed = JSON.parse(draft);
      setFormData(parsed);
      updateCounts(parsed.isi);
    }
  }, [user]);

  // Rotate tips
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % writingTips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Auto-save draft
  useEffect(() => {
    if (showForm && (formData.judul || formData.isi)) {
      const timeout = setTimeout(() => {
        localStorage.setItem(`tulisan_draft_${user?.santri_id}`, JSON.stringify(formData));
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 2000);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [formData, showForm]);

  const updateCounts = (html: string) => {
    const text = html.replace(/<[^>]*>/g, '').trim();
    setCharCount(text.length);
    setWordCount(text ? text.split(/\s+/).length : 0);
  };

  const handleContentChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, isi: value }));
    updateCounts(value);
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/santri-feature/tulisan/${user?.santri_id}`, {
        headers: getHeaders()
      });
      const json = await res.json();
      setData(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul.trim() || !formData.isi.trim()) {
      alert('Judul dan isi tulisan wajib diisi');
      return;
    }
    if (wordCount < 50) {
      alert('Tulisan minimal 50 kata agar lebih bermakna');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/santri-feature/tulisan`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({
          author: user?.santri_id,
          judul: formData.judul,
          kategori: formData.kategori,
          isi: formData.isi,
          image_url: formData.image_url || null
        })
      });
      const json = await res.json();
      if (res.ok) {
        fetchData();
        setShowForm(false);
        setFormData({ judul: '', kategori: 'teknologi', isi: '', image_url: '' });
        localStorage.removeItem(`tulisan_draft_${user?.santri_id}`);
        setWordCount(0);
        setCharCount(0);
      } else {
        alert(json.message || 'Gagal menyimpan tulisan');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/santri-feature/tulisan/${deleteConfirm.id}?santri_id=${user?.santri_id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const json = await res.json();
      if (res.ok) {
        fetchData();
        setDeleteConfirm(null);
      } else {
        alert(json.message || 'Gagal menghapus tulisan');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan');
    } finally {
      setDeleting(false);
    }
  };

  const applyTemplate = (template: typeof articleTemplates[0]) => {
    setFormData(prev => ({ ...prev, isi: template.content }));
    updateCounts(template.content);
    setShowTemplates(false);
  };

  const clearDraft = () => {
    if (confirm('Hapus draft yang tersimpan?')) {
      localStorage.removeItem(`tulisan_draft_${user?.santri_id}`);
      setFormData({ judul: '', kategori: 'teknologi', isi: '', image_url: '' });
      setWordCount(0);
      setCharCount(0);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getKategori = (value: string) => kategoriOptions.find(k => k.value === value) || kategoriOptions[0];
  const stripHtml = (html: string) => { const tmp = document.createElement('div'); tmp.innerHTML = html; return tmp.textContent || ''; };
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <PenTool className="w-6 h-6 text-purple-600" />
              Tulisan Saya
            </h1>
            <p className="text-gray-600">Ekspresikan ide dan bagikan ilmumu</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
        >
          <Sparkles className="w-5 h-5" />
          Mulai Menulis
        </button>
      </div>

      {/* Motivational Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        </div>
        <div className="relative flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Lightbulb className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">Tips Menulis</h3>
            <p className="text-purple-100 transition-all duration-500">{writingTips[currentTip]}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{data.length}</div>
              <div className="text-gray-500 text-sm">Total Tulisan</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Flame className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {data.filter(d => {
                  const date = new Date(d.created_at);
                  const now = new Date();
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                }).length}
              </div>
              <div className="text-gray-500 text-sm">Bulan Ini</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {data.reduce((acc, d) => acc + (stripHtml(d.content || '').split(' ').length), 0).toLocaleString()}
              </div>
              <div className="text-gray-500 text-sm">Total Kata</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Trophy className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {new Set(data.map(d => d.kategori)).size}
              </div>
              <div className="text-gray-500 text-sm">Kategori</div>
            </div>
          </div>
        </div>
      </div>

      {/* List Tulisan */}
      {data.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PenTool className="w-10 h-10 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Mulai Perjalanan Menulismu!</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Setiap penulis hebat memulai dari satu tulisan. Bagikan pemikiranmu dan inspirasi orang lain.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            <Sparkles className="w-5 h-5 inline mr-2" />
            Tulis Artikel Pertama
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {data.map((item: any) => {
            const kat = getKategori(item.kategori);
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group"
              >
                <div className="flex flex-col sm:flex-row">
                  {item.image_url && (
                    <div className="sm:w-56 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
                      <img 
                        src={item.image_url} 
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${kat.color}`}>
                            {kat.icon} {kat.label}
                          </span>
                          <span className="text-gray-400 text-sm flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(item.created_at)}
                          </span>
                          <span className="text-gray-400 text-sm flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {Math.ceil(stripHtml(item.content || '').split(' ').length / 200)} min
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {stripHtml(item.content || '').substring(0, 180)}...
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewArticle(item)}
                          className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-xl text-sm font-medium transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Baca
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(item)}
                          className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Enhanced Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <PenTool className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Tulis Artikel Baru</h3>
                  <p className="text-purple-200 text-sm">Ekspresikan idemu dengan bebas</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {autoSaved && (
                  <span className="text-purple-200 text-sm flex items-center gap-1">
                    <Save className="w-4 h-4" /> Tersimpan
                  </span>
                )}
                <button onClick={() => setShowForm(false)} className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-5">
                {/* Templates */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Template Cepat</label>
                    {formData.isi && (
                      <button type="button" onClick={clearDraft} className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1">
                        <Trash2 className="w-3.5 h-3.5" /> Hapus Draft
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {articleTemplates.map((t, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => applyTemplate(t)}
                        className="px-4 py-2 bg-gray-100 hover:bg-purple-100 hover:text-purple-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        {t.icon} {t.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Judul Artikel *</label>
                  <input
                    type="text"
                    value={formData.judul}
                    onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl p-4 text-lg font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    placeholder="Tulis judul yang menarik..."
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {kategoriOptions.map(kat => (
                      <button
                        key={kat.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, kategori: kat.value })}
                        className={`p-3 rounded-xl text-sm font-medium transition-all ${
                          formData.kategori === kat.value
                            ? `bg-gradient-to-r ${kat.color} text-white shadow-md`
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {kat.icon} {kat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Image className="w-4 h-4 inline mr-1" /> Cover Image (URL)
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="https://example.com/gambar.jpg"
                  />
                  {formData.image_url && (
                    <img src={formData.image_url} alt="Preview" className="mt-3 w-full h-40 object-cover rounded-xl border-2 border-gray-200" 
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  )}
                </div>

                {/* Editor */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Isi Artikel *</label>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{charCount.toLocaleString()} karakter</span>
                      <span className={wordCount < 50 ? 'text-red-500' : 'text-green-600'}>{wordCount} kata</span>
                      <span><Clock className="w-3.5 h-3.5 inline mr-1" />{readingTime} min baca</span>
                    </div>
                  </div>
                  <div className="border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-purple-500 transition-colors">
                    <ReactQuill
                      theme="snow"
                      value={formData.isi}
                      onChange={handleContentChange}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Mulai menulis artikelmu di sini..."
                      className="bg-white"
                    />
                  </div>
                  {wordCount > 0 && wordCount < 50 && (
                    <p className="text-red-500 text-sm mt-2">Minimal 50 kata ({50 - wordCount} kata lagi)</p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                >
                  Simpan Draft
                </button>
                <button
                  type="submit"
                  disabled={submitting || wordCount < 50}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  Publikasikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Article Modal */}
      {viewArticle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white mb-2`}>
                    {getKategori(viewArticle.kategori).icon} {getKategori(viewArticle.kategori).label}
                  </span>
                  <h3 className="text-xl font-bold text-white">{viewArticle.title}</h3>
                  <p className="text-purple-200 text-sm mt-1 flex items-center gap-3">
                    <span><Calendar className="w-4 h-4 inline mr-1" />{formatDate(viewArticle.created_at)}</span>
                    <span><Clock className="w-4 h-4 inline mr-1" />{Math.ceil(stripHtml(viewArticle.content || '').split(' ').length / 200)} min</span>
                  </p>
                </div>
                <button onClick={() => setViewArticle(null)} className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg">
                  ✕
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {viewArticle.image_url && (
                <img src={viewArticle.image_url} alt={viewArticle.title} className="w-full h-56 object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              )}
              <div className="p-6">
                <ArticleContent content={viewArticle.content || ''} />
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button onClick={() => setViewArticle(null)} className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Hapus Tulisan?</h3>
                <p className="text-gray-500 text-sm">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="font-medium text-gray-900 line-clamp-2">{deleteConfirm.title}</p>
              <p className="text-gray-500 text-sm mt-1">{formatDate(deleteConfirm.created_at)}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Quill Styles */}
      <style>{`
        .ql-toolbar { border-top-left-radius: 0.75rem; border-top-right-radius: 0.75rem; border-color: transparent !important; background: #f9fafb; }
        .ql-container { border-bottom-left-radius: 0.75rem; border-bottom-right-radius: 0.75rem; border-color: transparent !important; min-height: 300px; font-size: 16px; }
        .ql-editor { min-height: 300px; line-height: 1.8; }
        .ql-editor.ql-blank::before { font-style: normal; color: #9ca3af; }
        .ql-snow .ql-picker { font-size: 14px; }
        .ql-toolbar.ql-snow .ql-formats { margin-right: 10px; }
        .ql-editor h1 { font-size: 2em; font-weight: bold; margin: 0.67em 0; }
        .ql-editor h2 { font-size: 1.5em; font-weight: bold; margin: 0.75em 0; }
        .ql-editor h3 { font-size: 1.17em; font-weight: bold; margin: 0.83em 0; }
        .ql-editor blockquote { border-left: 4px solid #a855f7; padding-left: 16px; margin: 16px 0; background: #faf5ff; padding: 12px 16px; border-radius: 0 8px 8px 0; }
        .ql-editor pre.ql-syntax { background: #1e1e1e; color: #d4d4d4; border-radius: 8px; padding: 16px; overflow-x: auto; }
        .ql-editor img { max-width: 100%; border-radius: 8px; margin: 16px 0; }
        .ql-editor a { color: #7c3aed; }
        .ql-snow .ql-tooltip { z-index: 100; }
      `}</style>
    </div>
  );
}
