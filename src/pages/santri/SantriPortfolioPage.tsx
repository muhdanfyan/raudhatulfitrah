import { useState, useEffect, useRef } from 'react';
import { Briefcase, Plus, Loader2, ExternalLink, Code, ChevronLeft, Layers, User, Image as ImageIcon, X, GraduationCap, Edit2, Trash2, ImagePlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { API_URL, getHeaders } from '../../services/api';

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const COMPRESS_MAX_WIDTH = 1920;
const COMPRESS_MAX_HEIGHT = 1080;
const COMPRESS_QUALITY = 0.8; // 80% quality

// Compress image using canvas
const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      let { width, height } = img;

      // Calculate new dimensions while maintaining aspect ratio
      if (width > COMPRESS_MAX_WIDTH) {
        height = (height * COMPRESS_MAX_WIDTH) / width;
        width = COMPRESS_MAX_WIDTH;
      }
      if (height > COMPRESS_MAX_HEIGHT) {
        width = (width * COMPRESS_MAX_HEIGHT) / height;
        height = COMPRESS_MAX_HEIGHT;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create new file with compressed blob
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Return original if compression fails
          }
        },
        'image/jpeg',
        COMPRESS_QUALITY
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

const getCloudinaryUrl = (url: string, width = 400, height = 300) => {
  if (!url) return url;
  if (url.includes('res.cloudinary.com')) {
    return url.replace('/upload/', `/upload/c_fill,w_${width},h_${height},q_auto,f_auto/`);
  }
  return url;
};

const getPortfolioImage = (item: any) => {
  if (item.gambar_urls && Array.isArray(item.gambar_urls) && item.gambar_urls.length > 0) {
    return item.gambar_urls[0];
  }
  return item.image_portofolio || item.gambar_url || null;
};

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link'],
    ['clean']
  ],
};

const quillFormats = ['header', 'bold', 'italic', 'underline', 'list', 'bullet', 'link'];

interface Evaluasi {
  id_quiz: number;
  judul: string;
  deskripsi: string;
  tugas_deskripsi: string;
  nama_course: string;
  can_submit: boolean;
  submissions_count: number;
  max_attempts: number;
}

interface Portfolio {
  id_portofolio: number;
  nama_portofolio: string;
  deskripsi: string;
  demo_link: string;
  techstack: string;
  klien: string;
  gambar_urls: string[];
  image_portofolio: string;
  created_at: string;
  // Mentor feedback fields
  score?: number;
  score_label?: string;
  feedback_good?: string;
  feedback_improve?: string;
  feedback_todo?: string;
  assessed_at?: string;
}

export default function SantriPortfolioPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Portfolio[]>([]);
  const [evaluasiList, setEvaluasiList] = useState<Evaluasi[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const [formData, setFormData] = useState({
    nama_portofolio: '',
    deskripsi: '',
    demo_link: '',
    techstack: '',
    klien: '',
    evaluasi_id: '' as string | number,
    catatan_santri: ''
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);

  useEffect(() => {
    if (user?.santri_id) {
      fetchData();
      fetchEvaluasi();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/santri-feature/portfolio/${user?.santri_id}`, {
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

  const fetchEvaluasi = async () => {
    try {
      const res = await fetch(`${API_URL}/santri-feature/evaluasi/available/${user?.santri_id}?tipe=portofolio`, {
        headers: getHeaders()
      });
      const json = await res.json();
      setEvaluasiList(json.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({ nama_portofolio: '', deskripsi: '', demo_link: '', techstack: '', klien: '', evaluasi_id: '', catatan_santri: '' });
    setSelectedImages([]);
    setPreviewUrls([]);
    setExistingImages([]);
    setUploadProgress(0);
    setEditingPortfolio(null);
    setShowForm(false);
  };

  const [compressing, setCompressing] = useState(false);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = selectedImages.length + existingImages.length + files.length;
    
    if (totalImages > MAX_IMAGES) {
      alert(`Maksimal ${MAX_IMAGES} gambar`);
      return;
    }

    // Filter valid files first
    const validFiles: File[] = [];
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File ${file.name} terlalu besar. Maksimal 5MB.`);
        continue;
      }
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} bukan gambar.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Compress images
    setCompressing(true);
    try {
      const compressedFiles: File[] = [];
      const newPreviews: string[] = [];

      for (const file of validFiles) {
        const compressed = await compressImage(file);
        compressedFiles.push(compressed);
        newPreviews.push(URL.createObjectURL(compressed));
      }

      setSelectedImages(prev => [...prev, ...compressedFiles]);
      setPreviewUrls(prev => [...prev, ...newPreviews]);
    } catch (err) {
      console.error('Compression error:', err);
      alert('Gagal mengompresi gambar. Silakan coba lagi.');
    } finally {
      setCompressing(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeSelectedImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleEdit = (portfolio: Portfolio) => {
    setEditingPortfolio(portfolio);
    setFormData({
      nama_portofolio: portfolio.nama_portofolio,
      deskripsi: portfolio.deskripsi,
      demo_link: portfolio.demo_link,
      techstack: portfolio.techstack,
      klien: portfolio.klien,
      evaluasi_id: '',
      catatan_santri: ''
    });
    // Load existing images
    const images: string[] = [];
    if (portfolio.gambar_urls && Array.isArray(portfolio.gambar_urls)) {
      images.push(...portfolio.gambar_urls);
    } else if (portfolio.image_portofolio) {
      images.push(portfolio.image_portofolio);
    }
    setExistingImages(images);
    setSelectedImages([]);
    setPreviewUrls([]);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus portfolio ini?')) return;
    setDeleting(id);
    try {
      await fetch(`${API_URL}/santri-feature/portfolio/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
      setSubmitting(true);
      setUploadProgress(0);
      
      try {
      const url = editingPortfolio
        ? `${API_URL}/santri-feature/portfolio/${editingPortfolio.id_portofolio}`
        : `${API_URL}/santri-feature/portfolio`;
      
      const formDataToSend = new FormData();
      formDataToSend.append('santri_portofolio', String(user?.santri_id));
      formDataToSend.append('nama_portofolio', formData.nama_portofolio);
      formDataToSend.append('deskripsi', formData.deskripsi || '');
      formDataToSend.append('demo_link', formData.demo_link || '');
      formDataToSend.append('techstack', formData.techstack || '');
      formDataToSend.append('klien', formData.klien || '');
      
      if (formData.evaluasi_id) {
        formDataToSend.append('evaluasi_id', String(formData.evaluasi_id));
        formDataToSend.append('catatan_santri', formData.catatan_santri || '');
      }

      // Append new images
      selectedImages.forEach((file) => {
        formDataToSend.append('gambar[]', file);
      });

      // For edit: keep track of existing images that weren't removed
      if (editingPortfolio && existingImages.length > 0) {
        formDataToSend.append('keep_existing_images', JSON.stringify(existingImages));
      }

      // Use XMLHttpRequest for progress tracking
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(editingPortfolio ? 'POST' : 'POST', url);
        const headers = getHeaders();
        Object.entries(headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, String(value));
        });
        
        // For PUT method, use POST with _method field
        if (editingPortfolio) {
          formDataToSend.append('_method', 'PUT');
        }

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response);
          } else {
            reject(new Error(xhr.statusText));
          }
        };

        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(formDataToSend);
      });

      fetchData();
      resetForm();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan portfolio. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-600 mx-auto" />
          <p className="mt-3 text-gray-500">Memuat portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            {/* Santri Photo */}
            {user?.photo ? (
              <img 
                src={getCloudinaryUrl(user.photo, 56, 56)} 
                alt={user.name} 
                className="w-14 h-14 rounded-full object-cover border-2 border-white/30 shadow-lg"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
                <User className="w-7 h-7 text-white/80" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">Portfolio Saya</h1>
              <p className="text-cyan-100 text-sm">{user?.name || 'Showcase project dan karya terbaik'}</p>
            </div>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tambah</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center">
            <Briefcase className="w-6 h-6 mx-auto mb-2" />
            <div className="text-3xl font-bold">{data.length}</div>
            <div className="text-xs text-cyan-100">Total Project</div>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center">
            <Layers className="w-6 h-6 mx-auto mb-2" />
            <div className="text-3xl font-bold">
              {new Set(data.flatMap(d => d.techstack?.split(',').map((t: string) => t.trim()) || [])).size}
            </div>
            <div className="text-xs text-cyan-100">Tech Stack</div>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">
              {editingPortfolio ? 'Edit Portfolio' : 'Tambah Portfolio Baru'}
            </h2>
            <button onClick={resetForm} className="text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Evaluasi Dropdown */}
            {!editingPortfolio && evaluasiList.length > 0 && (
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-4">
                <label className="block text-sm font-semibold text-teal-800 mb-2">
                  <GraduationCap className="w-4 h-4 inline mr-1" />
                  Hubungkan dengan Tugas Course (Opsional)
                </label>
                <select
                  value={formData.evaluasi_id}
                  onChange={(e) => setFormData({...formData, evaluasi_id: e.target.value})}
                  className="w-full border border-teal-200 rounded-xl p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                >
                  <option value="">-- Tidak ada tugas --</option>
                  {evaluasiList.filter(e => e.can_submit).map((evaluasi) => (
                    <option key={evaluasi.id_quiz} value={evaluasi.id_quiz}>
                      [{evaluasi.nama_course}] {evaluasi.judul} ({evaluasi.submissions_count}/{evaluasi.max_attempts} submit)
                    </option>
                  ))}
                </select>
                {formData.evaluasi_id && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-teal-700 mb-1">Catatan untuk Mentor</label>
                    <textarea
                      value={formData.catatan_santri}
                      onChange={(e) => setFormData({...formData, catatan_santri: e.target.value})}
                      className="w-full border border-teal-200 rounded-xl p-3 focus:ring-2 focus:ring-teal-500 text-sm"
                      rows={2}
                      placeholder="Catatan tambahan untuk mentor..."
                    />
                  </div>
                )}
              </div>
            )}

            {/* Nama Project */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Briefcase className="w-4 h-4 inline mr-1" />
                Nama Project <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nama_portofolio}
                onChange={(e) => setFormData({...formData, nama_portofolio: e.target.value})}
                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Nama project atau aplikasi"
                required
              />
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi Project</label>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <ReactQuill
                  theme="snow"
                  value={formData.deskripsi}
                  onChange={(value) => setFormData({...formData, deskripsi: value})}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Jelaskan tentang project ini..."
                  className="bg-white"
                />
              </div>
            </div>

            {/* Tech Stack */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Code className="w-4 h-4 inline mr-1" />
                Tech Stack
              </label>
              <input
                type="text"
                value={formData.techstack}
                onChange={(e) => setFormData({...formData, techstack: e.target.value})}
                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500"
                placeholder="React, Laravel, MySQL, ..."
              />
              <p className="text-xs text-gray-400 mt-1">Pisahkan dengan koma</p>
            </div>

            {/* Screenshot / Gambar Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <ImageIcon className="w-4 h-4 inline mr-1" />
                Screenshot / Gambar Project
                <span className="text-gray-400 font-normal ml-2">(Max {MAX_IMAGES} gambar, masing-masing max 5MB)</span>
              </label>
              
              {/* Upload Area */}
              <div 
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer
                  ${compressing ? 'border-amber-300 bg-amber-50/50 cursor-wait' :
                    (selectedImages.length + existingImages.length) >= MAX_IMAGES 
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                    : 'border-cyan-300 hover:border-cyan-400 hover:bg-cyan-50/50'}`}
                onClick={() => !compressing && (selectedImages.length + existingImages.length) < MAX_IMAGES && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={compressing || (selectedImages.length + existingImages.length) >= MAX_IMAGES}
                />
                <div className="flex flex-col items-center gap-2">
                  {compressing ? (
                    <>
                      <div className="p-3 bg-amber-100 rounded-full">
                        <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
                      </div>
                      <div>
                        <p className="font-medium text-amber-700">Mengompresi gambar...</p>
                        <p className="text-sm text-amber-500">Mohon tunggu sebentar</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-3 bg-cyan-100 rounded-full">
                        <ImagePlus className="w-6 h-6 text-cyan-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">
                          {(selectedImages.length + existingImages.length) >= MAX_IMAGES 
                            ? 'Batas gambar tercapai' 
                            : 'Klik untuk upload gambar'}
                        </p>
                        <p className="text-sm text-gray-400">PNG, JPG, JPEG, GIF (max 5MB, auto-compress)</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Upload Progress */}
              {submitting && uploadProgress > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Mengupload gambar...</span>
                    <span className="text-cyan-600 font-medium">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Existing Images (saat edit) */}
              {existingImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Gambar tersimpan:</p>
                  <div className="flex flex-wrap gap-3">
                    {existingImages.map((url, index) => (
                      <div key={`existing-${index}`} className="relative group">
                        <img 
                          src={getCloudinaryUrl(url, 120, 90)} 
                          alt={`Existing ${index + 1}`} 
                          className="w-28 h-20 object-cover rounded-lg border shadow-sm"
                        />
                        <button 
                          type="button" 
                          onClick={() => removeExistingImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Selected Images Preview */}
              {previewUrls.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Gambar baru ({previewUrls.length}):</p>
                  <div className="flex flex-wrap gap-3">
                    {previewUrls.map((url, index) => (
                      <div key={`new-${index}`} className="relative group">
                        <img 
                          src={url} 
                          alt={`Preview ${index + 1}`} 
                          className="w-28 h-20 object-cover rounded-lg border shadow-sm"
                        />
                        <button 
                          type="button" 
                          onClick={() => removeSelectedImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-1 left-1 right-1 flex justify-between">
                          <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">Baru</span>
                          <span className="bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                            {(selectedImages[index]?.size / 1024).toFixed(0)}KB
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Counter */}
              <p className="text-xs text-gray-400 mt-2">
                {selectedImages.length + existingImages.length} / {MAX_IMAGES} gambar
              </p>
            </div>

            {/* Links */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <ExternalLink className="w-4 h-4 inline mr-1" />
                  Link Demo
                </label>
                <input
                  type="url"
                  value={formData.demo_link}
                  onChange={(e) => setFormData({...formData, demo_link: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Klien
                </label>
                <input
                  type="text"
                  value={formData.klien}
                  onChange={(e) => setFormData({...formData, klien: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500"
                  placeholder="Personal / Nama Klien"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={resetForm} className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50">
                Batal
              </button>
              <button type="submit" disabled={submitting} className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-medium hover:from-cyan-700 hover:to-teal-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4" />}
                {submitting ? 'Menyimpan...' : (editingPortfolio ? 'Update Portfolio' : 'Simpan Portfolio')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Portfolio Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item: Portfolio) => (
          <div key={item.id_portofolio} className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-lg transition-all group">
            {/* Screenshot Image */}
            {getPortfolioImage(item) ? (
              <div className="relative h-44 overflow-hidden">
                <img src={getCloudinaryUrl(getPortfolioImage(item), 400, 176)} alt={item.nama_portofolio} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {/* Edit/Delete buttons */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button onClick={() => handleEdit(item)} className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow" title="Edit">
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button onClick={() => handleDelete(item.id_portofolio)} className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow" title="Hapus" disabled={deleting === item.id_portofolio}>
                    {deleting === item.id_portofolio ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <Trash2 className="w-4 h-4 text-red-500" />}
                  </button>
                </div>
                {item.klien && (
                  <span className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">{item.klien}</span>
                )}
              </div>
            ) : (
              <div className="bg-gradient-to-r from-cyan-500 to-teal-500 p-4 flex items-center justify-between relative">
                <Briefcase className="w-8 h-8 text-white" />
                {item.klien && <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">{item.klien}</span>}
                {/* Edit/Delete buttons */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button onClick={() => handleEdit(item)} className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow" title="Edit">
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button onClick={() => handleDelete(item.id_portofolio)} className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow" title="Hapus">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            )}
            <div className="p-4 cursor-pointer" onClick={() => setSelectedPortfolio(item)}>
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-cyan-600 transition-colors">{item.nama_portofolio}</h3>
              {item.deskripsi && (
                <div className="prose prose-sm max-w-none text-gray-600 mt-2 line-clamp-3" dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
              )}
              {item.techstack && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {item.techstack.split(',').slice(0, 4).map((tech: string, j: number) => (
                    <span key={j} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{tech.trim()}</span>
                  ))}
                  {item.techstack.split(',').length > 4 && (
                    <span className="bg-gray-100 text-gray-400 text-xs px-2 py-1 rounded-full">+{item.techstack.split(',').length - 4}</span>
                  )}
                </div>
              )}
              {item.demo_link && (
                <a href={item.demo_link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 mt-4 text-sm text-cyan-600 hover:text-cyan-700 font-medium">
                  <ExternalLink className="w-4 h-4" /> Lihat Demo
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 && !showForm && (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">Belum ada portfolio</h3>
          <p className="text-gray-400 mt-1">Klik "Tambah" untuk menambahkan project pertama Anda</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedPortfolio && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setSelectedPortfolio(null)}>
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {getPortfolioImage(selectedPortfolio) ? (
                <div className="relative">
                  <div className="h-64 overflow-hidden">
                    <img src={getCloudinaryUrl(getPortfolioImage(selectedPortfolio), 800, 256)} alt={selectedPortfolio.nama_portofolio} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                  {selectedPortfolio.klien && (
                    <span className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full">{selectedPortfolio.klien}</span>
                  )}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-3xl font-bold text-white">{selectedPortfolio.nama_portofolio}</h2>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 p-8">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                      <Briefcase className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      {selectedPortfolio.klien && <span className="text-white/80 text-sm font-medium uppercase tracking-wider">{selectedPortfolio.klien}</span>}
                      <h2 className="text-2xl font-bold text-white mt-1">{selectedPortfolio.nama_portofolio}</h2>
                    </div>
                  </div>
                </div>
              )}
              <button onClick={() => setSelectedPortfolio(null)} className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 backdrop-blur-sm transition-colors">
                <X className="w-5 h-5" />
              </button>
              <div className="p-6 overflow-y-auto max-h-[50vh]">
                {selectedPortfolio.techstack && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Code className="w-4 h-4" /> Tech Stack
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPortfolio.techstack.split(',').map((tech: string, j: number) => (
                        <span key={j} className="bg-gradient-to-r from-cyan-50 to-teal-50 text-cyan-700 border border-cyan-200 text-sm px-3 py-1.5 rounded-full font-medium">{tech.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedPortfolio.deskripsi && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Deskripsi</h4>
                    <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: selectedPortfolio.deskripsi }} />
                  </div>
                )}
                {selectedPortfolio.demo_link && (
                  <div className="pt-4 border-t">
                    <a href={selectedPortfolio.demo_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:from-cyan-700 hover:to-teal-700 transition-all shadow-lg shadow-cyan-500/25">
                      <ExternalLink className="w-5 h-5" /> Lihat Demo Project
                    </a>
                  </div>
                )}

                {/* Mentor Feedback Section */}
                {selectedPortfolio.score && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="p-1.5 bg-green-100 rounded-lg"><svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
                      Feedback dari Mentor
                    </h3>
                    <div className="mb-3">
                      <span className="text-sm text-gray-500">Nilai:</span>
                      <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold">
                        {selectedPortfolio.score_label || `Bobot ${selectedPortfolio.score}`}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {selectedPortfolio.feedback_good && (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                          <div className="text-xs font-semibold text-green-700 mb-1 flex items-center gap-1">✅ Yang Sudah Baik</div>
                          <p className="text-sm text-green-800">{selectedPortfolio.feedback_good}</p>
                        </div>
                      )}
                      {selectedPortfolio.feedback_improve && (
                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                          <div className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1">⚠️ Yang Perlu Ditingkatkan</div>
                          <p className="text-sm text-amber-800">{selectedPortfolio.feedback_improve}</p>
                        </div>
                      )}
                      {selectedPortfolio.feedback_todo && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">📋 Yang Harus Dilakukan</div>
                          <p className="text-sm text-blue-800">{selectedPortfolio.feedback_todo}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-6 mt-6 border-t">
                  <button
                    onClick={() => {
                      handleEdit(selectedPortfolio);
                      setSelectedPortfolio(null);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-medium transition-colors"
                  >
                    <Edit2 className="w-4 h-4" /> Edit Portfolio
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Yakin ingin menghapus portfolio "${selectedPortfolio.nama_portofolio}"? File gambar juga akan dihapus dari server.`)) {
                        handleDelete(selectedPortfolio.id_portofolio);
                        setSelectedPortfolio(null);
                      }
                    }}
                    disabled={deleting === selectedPortfolio.id_portofolio}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    {deleting === selectedPortfolio.id_portofolio ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Menghapus...</>
                    ) : (
                      <><Trash2 className="w-4 h-4" /> Hapus Portfolio</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .ql-container { font-family: inherit; font-size: 14px; min-height: 150px; }
        .ql-editor { min-height: 150px; }
        .ql-toolbar { border-top-left-radius: 0.75rem; border-top-right-radius: 0.75rem; background: #f9fafb; border-color: #e5e7eb; }
        .ql-container { border-bottom-left-radius: 0.75rem; border-bottom-right-radius: 0.75rem; border-color: #e5e7eb; }
        .ql-editor.ql-blank::before { color: #9ca3af; font-style: normal; }
      `}</style>
    </div>
  );
}
