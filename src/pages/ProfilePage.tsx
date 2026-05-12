import { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, Shield, Camera, Loader2, Save, ChevronLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { fetchWithTenant, API_URL } from '../utils/fetchWithTenant';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetchWithTenant(`${API_URL}/profile/update`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Profil berhasil diperbarui' });
        if (refreshUser) refreshUser();
      } else {
        setMessage({ type: 'error', text: json.message || 'Gagal memperbarui profil' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Ukuran foto maksimal 5MB' });
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(file.type)) {
      setMessage({ type: 'error', text: 'Format foto harus JPG, PNG, atau GIF' });
      return;
    }

    setUploadingPhoto(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await fetchWithTenant(`${API_URL}/profile/photo`, {
        method: 'POST',
        body: formData
      });

      const json = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Foto profil berhasil diperbarui' });
        if (refreshUser) refreshUser();
      } else {
        setMessage({ type: 'error', text: json.message || 'Gagal mengupload foto' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat mengupload foto' });
    } finally {
      setUploadingPhoto(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Profil Saya</h1>
            <p className="text-blue-100 text-sm">Kelola informasi profil Anda</p>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {/* Avatar Section */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="relative group">
              {user?.photo ? (
                <img src={user.photo} alt={user.name} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-md">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
              {/* Upload Overlay */}
              <button
                onClick={handlePhotoClick}
                disabled={uploadingPhoto}
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
              >
                {uploadingPhoto ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/gif"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm text-gray-600 capitalize bg-primary/10 text-primary-dark px-2 py-0.5 rounded-full">{user?.role}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Klik foto untuk mengubah</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {message && (
            <div className={`p-4 rounded-xl flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.type === 'success' ? '✓' : '!'} {message.text}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Nama Lengkap
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              No. Telepon
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="08xxxxxxxxxx"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
