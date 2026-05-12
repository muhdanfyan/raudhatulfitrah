import { useState, useEffect, useRef } from 'react';
import { 
  User, Camera, Save, Loader2, ArrowLeft, Mail, MapPin, 
  Calendar, Users, Home, GraduationCap, Target, BookOpen, Sparkles,
  CheckCircle, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import RichTextEditor from '../../components/RichTextEditor';
import { API_URL, getHeaders } from '../../services/api';
import { getStudentPhotoUrl } from '../../utils/imageUtils';

interface SantriProfile {
  id_santri: number;
  email_santri: string;
  nama_lengkap_santri: string;
  nama_panggilan_santri: string;
  status_santri: string;
  angkatan_santri: number;
  tempat_lahir_santri: string;
  tanggal_lahir_santri: string;
  alamat_lengkap_santri: string;
  asal_daerah_santri: string;
  kota_domisili_sekarang_santri: string;
  kondisi_keluarga_santri: string;
  anak_ke_santri: number;
  jumlah_saudara_santri: number;
  punya_tanggungan_keluarga_santri: string;
  izin_orang_tua_santri: string;
  konsentrasi_santri: number;
  alasan_mendaftar_santri: string;
  target_santri: string;
  hafalan_quran_santri: string;
  skill_kelebihan_santri: string;
  foto_santri: string;
  // Joined fields
  nama_angkatan?: string;
  nama_konsentrasi?: string;
}


interface Konsentrasi {
  id_konsentrasi: number;
  nama_konsentrasi: string;
}

export default function SantriProfilPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [profile, setProfile] = useState<SantriProfile | null>(null);
  const [konsentrasiList, setKonsentrasiList] = useState<Konsentrasi[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fotoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nama_lengkap_santri: '',
    nama_panggilan_santri: '',
    email_santri: '',
    tempat_lahir_santri: '',
    tanggal_lahir_santri: '',
    alamat_lengkap_santri: '',
    asal_daerah_santri: '',
    kota_domisili_sekarang_santri: '',
    kondisi_keluarga_santri: '',
    anak_ke_santri: 1,
    jumlah_saudara_santri: 1,
    punya_tanggungan_keluarga_santri: 'Tidak',
    konsentrasi_santri: 0,
    target_santri: '',
    hafalan_quran_santri: '',
    skill_kelebihan_santri: '',
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user?.santri_id) {
      setError('Data santri tidak ditemukan');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const [profileRes, , konsentrasiRes] = await Promise.all([
        fetch(`${API_URL}/santri-feature/profil/${user.santri_id}`, {
          headers: getHeaders()
        }),
        fetch(`${API_URL}/master/angkatan`, {
          headers: getHeaders()
        }),
        fetch(`${API_URL}/master/konsentrasi`, {
          headers: getHeaders()
        })
      ]);

      const profileData = await profileRes.json();
      const konsentrasiData = await konsentrasiRes.json();

      if (profileRes.ok && profileData.data) {
        setProfile(profileData.data);
        setFormData({
          nama_lengkap_santri: profileData.data.nama_lengkap_santri || '',
          nama_panggilan_santri: profileData.data.nama_panggilan_santri || '',
          email_santri: profileData.data.email_santri || '',
          tempat_lahir_santri: profileData.data.tempat_lahir_santri || '',
          tanggal_lahir_santri: profileData.data.tanggal_lahir_santri || '',
          alamat_lengkap_santri: profileData.data.alamat_lengkap_santri || '',
          asal_daerah_santri: profileData.data.asal_daerah_santri || '',
          kota_domisili_sekarang_santri: profileData.data.kota_domisili_sekarang_santri || '',
          kondisi_keluarga_santri: profileData.data.kondisi_keluarga_santri || 'Masih Lengkap',
          anak_ke_santri: profileData.data.anak_ke_santri || 1,
          jumlah_saudara_santri: profileData.data.jumlah_saudara_santri || 1,
          punya_tanggungan_keluarga_santri: profileData.data.punya_tanggungan_keluarga_santri || 'Tidak',
          konsentrasi_santri: profileData.data.konsentrasi_santri || 0,
          target_santri: profileData.data.target_santri || '',
          hafalan_quran_santri: profileData.data.hafalan_quran_santri || '',
          skill_kelebihan_santri: profileData.data.skill_kelebihan_santri || '',
        });
      }

      // API returns array directly or { data: [...] }
      if (konsentrasiRes.ok) setKonsentrasiList(Array.isArray(konsentrasiData) ? konsentrasiData : (konsentrasiData.data || []));

    } catch (err) {
      setError('Gagal memuat data profil');
    } finally {
      setLoading(false);
    }
  };

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB');
      return;
    }
    
    setUploadingFoto(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('foto', file);
      
      const res = await fetch(`${API_URL}/santri-feature/foto/${user?.santri_id}`, {
        method: 'POST',
        headers: getHeaders(),
        body: formData
      });
      
      const json = await res.json();
      if (res.ok) {
        setProfile(prev => prev ? { ...prev, foto_santri: json.data.foto } : null);
        setSuccess('Foto berhasil diperbarui');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(json.message || 'Gagal upload foto');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat upload foto');
    } finally {
      setUploadingFoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_URL}/santri-feature/profil/${user?.santri_id}`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify(formData)
      });

      const json = await res.json();
      if (res.ok) {
        setSuccess('Profil berhasil diperbarui');
        setProfile(json.data);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(json.message || 'Gagal memperbarui profil');
      }
    } catch (err) {
      setError('Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="relative h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 flex items-center px-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Profil Santri</h1>
              <p className="text-blue-100">Kelola data profil Anda</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Photo Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <img
              src={getStudentPhotoUrl(profile?.foto_santri)}
              alt={profile?.nama_lengkap_santri}
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
              onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.nama_lengkap_santri || 'U')}&background=random`; }}
            />
            <button
              onClick={() => fotoInputRef.current?.click()}
              disabled={uploadingFoto}
              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              {uploadingFoto ? (
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              ) : (
                <div className="text-center text-white">
                  <Camera className="w-8 h-8 mx-auto mb-1" />
                  <span className="text-xs">Ganti Foto</span>
                </div>
              )}
            </button>
            <input
              ref={fotoInputRef}
              type="file"
              accept="image/*"
              onChange={handleFotoChange}
              className="hidden"
            />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-900">{profile?.nama_lengkap_santri}</h2>
            <p className="text-gray-600">{profile?.nama_konsentrasi || 'Belum ada konsentrasi'}</p>
            <p className="text-sm text-gray-500">Angkatan: {profile?.nama_angkatan || '-'}</p>
            <div className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
              profile?.status_santri === 'Mondok' ? 'bg-green-100 text-green-700' :
              profile?.status_santri === 'Alumni' ? 'bg-primary/10 text-primary-dark' :
              'bg-gray-100 text-gray-700'
            }`}>
              {profile?.status_santri}
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Data Pribadi */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Data Pribadi
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={formData.nama_lengkap_santri}
                onChange={(e) => setFormData({...formData, nama_lengkap_santri: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Panggilan</label>
              <input
                type="text"
                value={formData.nama_panggilan_santri}
                onChange={(e) => setFormData({...formData, nama_panggilan_santri: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={formData.email_santri}
                onChange={(e) => setFormData({...formData, email_santri: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <GraduationCap className="w-4 h-4 inline mr-1" />
                Konsentrasi
              </label>
              <select
                value={formData.konsentrasi_santri}
                onChange={(e) => setFormData({...formData, konsentrasi_santri: parseInt(e.target.value)})}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-primary"
              >
                <option value={0}>Pilih Konsentrasi</option>
                {konsentrasiList.map(k => (
                  <option key={k.id_konsentrasi} value={k.id_konsentrasi}>{k.nama_konsentrasi}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Data Kelahiran & Alamat */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            Kelahiran & Alamat
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
              <input
                type="text"
                value={formData.tempat_lahir_santri}
                onChange={(e) => setFormData({...formData, tempat_lahir_santri: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Tanggal Lahir
              </label>
              <input
                type="date"
                value={formData.tanggal_lahir_santri}
                onChange={(e) => setFormData({...formData, tanggal_lahir_santri: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asal Daerah</label>
              <input
                type="text"
                value={formData.asal_daerah_santri}
                onChange={(e) => setFormData({...formData, asal_daerah_santri: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kota Domisili Sekarang</label>
              <input
                type="text"
                value={formData.kota_domisili_sekarang_santri}
                onChange={(e) => setFormData({...formData, kota_domisili_sekarang_santri: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Home className="w-4 h-4 inline mr-1" />
                Alamat Lengkap
              </label>
              <textarea
                value={formData.alamat_lengkap_santri}
                onChange={(e) => setFormData({...formData, alamat_lengkap_santri: e.target.value})}
                rows={3}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Data Keluarga */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Data Keluarga
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kondisi Keluarga</label>
              <select
                value={formData.kondisi_keluarga_santri}
                onChange={(e) => setFormData({...formData, kondisi_keluarga_santri: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-primary"
              >
                <option value="Masih Lengkap">Masih Lengkap</option>
                <option value="Bersama Bapak">Bersama Bapak</option>
                <option value="Bersama Ibu">Bersama Ibu</option>
                <option value="Yatim Piatu">Yatim Piatu</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Punya Tanggungan Keluarga</label>
              <select
                value={formData.punya_tanggungan_keluarga_santri}
                onChange={(e) => setFormData({...formData, punya_tanggungan_keluarga_santri: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-primary"
              >
                <option value="Tidak">Tidak</option>
                <option value="Ya">Ya</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Anak Ke</label>
              <input
                type="number"
                min="1"
                value={formData.anak_ke_santri}
                onChange={(e) => setFormData({...formData, anak_ke_santri: parseInt(e.target.value) || 1})}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Saudara</label>
              <input
                type="number"
                min="1"
                value={formData.jumlah_saudara_santri}
                onChange={(e) => setFormData({...formData, jumlah_saudara_santri: parseInt(e.target.value) || 1})}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Data Akademik */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-600" />
            Data Akademik & Skill
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hafalan Quran</label>
              <input
                type="text"
                value={formData.hafalan_quran_santri}
                onChange={(e) => setFormData({...formData, hafalan_quran_santri: e.target.value})}
                placeholder="Contoh: 3 Juz"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Sparkles className="w-4 h-4 inline mr-1" />
                Skill / Kelebihan
              </label>
              <input
                type="text"
                value={formData.skill_kelebihan_santri}
                onChange={(e) => setFormData({...formData, skill_kelebihan_santri: e.target.value})}
                placeholder="Contoh: Web Development, Design"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Target className="w-4 h-4 inline mr-1" />
                Target di Pondok
              </label>
              <RichTextEditor
                value={formData.target_santri}
                onChange={(value) => setFormData({...formData, target_santri: value})}
                placeholder="Apa target yang ingin dicapai selama di pondok?"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <Link
            to="/"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
