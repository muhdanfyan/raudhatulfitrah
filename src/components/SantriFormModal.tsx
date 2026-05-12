import { useState, useEffect, useRef } from 'react';
import { X, Loader2, Upload, Camera } from 'lucide-react';
import { api } from '../services/api';
import SearchableSelect from './SearchableSelect';
import RichTextEditor from './RichTextEditor';
import { ProgramSantri, PROGRAM_SANTRI_OPTIONS } from '../types/santri';

interface Angkatan {
  id_angkatan: number;
  angkatan: string;
}

interface Konsentrasi {
  id_konsentrasi: number;
  nama_konsentrasi: string;
}

interface Jabatan {
  id_jabatan: number;
  nama_jabatan: string;
}

interface SantriFormData {
  email_santri: string;
  nama_lengkap_santri: string;
  nama_panggilan_santri: string;
  status_santri: string;
  program_santri: ProgramSantri;
  angkatan_santri: number;
  tempat_lahir_santri: string;
  tanggal_lahir_santri: string;
  alamat_lengkap_santri: string;
  asal_daerah_santri: string;
  kota_domisili_sekarang_santri: string;
  kondisi_keluarga_santri: string;
  anak_ke_santri: number;
  jumlah_saudara_santri: number;
  konsentrasi_santri: number;
  alasan_mendaftar_santri: string;
  target_santri: string;
  hafalan_quran_santri: string;
  skill_kelebihan_santri: string;
  musyrif: number;
  jabatan_santri: number;
}

interface SantriFormModalProps {
  mode: 'create' | 'edit';
  santriId?: number;
  onClose: () => void;
  onSuccess: () => void;
}

const initialFormData: SantriFormData = {
  email_santri: '',
  nama_lengkap_santri: '',
  nama_panggilan_santri: '',
  status_santri: 'Daftar',
  program_santri: 'mondok',
  angkatan_santri: 0,
  tempat_lahir_santri: '',
  tanggal_lahir_santri: '',
  alamat_lengkap_santri: '',
  asal_daerah_santri: '',
  kota_domisili_sekarang_santri: '',
  kondisi_keluarga_santri: 'Masih Lengkap',
  anak_ke_santri: 1,
  jumlah_saudara_santri: 1,
  konsentrasi_santri: 0,
  alasan_mendaftar_santri: '',
  target_santri: '',
  hafalan_quran_santri: '',
  skill_kelebihan_santri: '',
  musyrif: 0,
  jabatan_santri: 0,
};

export default function SantriFormModal({ mode, santriId, onClose, onSuccess }: SantriFormModalProps) {
  const [formData, setFormData] = useState<SantriFormData>(initialFormData);
  const [angkatanList, setAngkatanList] = useState<Angkatan[]>([]);
  const [konsentrasiList, setKonsentrasiList] = useState<Konsentrasi[]>([]);
  const [jabatanList, setJabatanList] = useState<Jabatan[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(mode === 'edit');
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  
  // Foto upload
  const [currentFotoUrl, setCurrentFotoUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [angkatan, konsentrasi, jabatan] = await Promise.all([
          api.getMasterAngkatan(),
          api.getMasterKonsentrasi(),
          api.getMasterJabatan(),
        ]);
        setAngkatanList(angkatan || []);
        setKonsentrasiList(konsentrasi || []);
        setJabatanList(jabatan || []);
      } catch (err) {
        console.error('Gagal mengambil master data:', err);
      }
    };
    fetchMasterData();
  }, []);

  useEffect(() => {
    if (mode === 'edit' && santriId) {
      const fetchSantriDetail = async () => {
        setLoadingData(true);
        try {
          const data = await api.getSantriDetail(santriId);
          setFormData({
            email_santri: data.email || '',
            nama_lengkap_santri: data.name || '',
            nama_panggilan_santri: data.nickname || '',
            status_santri: data.status || 'Daftar',
            program_santri: data.program_santri || 'mondok',
            angkatan_santri: data.angkatan || 0,
            tempat_lahir_santri: data.tempat_lahir || '',
            tanggal_lahir_santri: data.tanggal_lahir || '',
            alamat_lengkap_santri: data.alamat || '',
            asal_daerah_santri: data.asal_daerah || '',
            kota_domisili_sekarang_santri: data.domisili || '',
            kondisi_keluarga_santri: data.kondisi_keluarga || 'Masih Lengkap',
            anak_ke_santri: data.anak_ke || 1,
            jumlah_saudara_santri: data.jumlah_saudara || 1,
            konsentrasi_santri: data.konsentrasi || 0,
            alasan_mendaftar_santri: data.alasan_mendaftar || '',
            target_santri: data.target || '',
            hafalan_quran_santri: data.hafalan || '',
            skill_kelebihan_santri: data.skill || '',
            musyrif: data.is_musyrif ? 1 : 0,
            jabatan_santri: data.jabatan_santri || 0,
          });
          setCurrentFotoUrl(data.foto_url || null);
        } catch (err: any) {
          setError(err.message || 'Gagal mengambil data santri');
        } finally {
          setLoadingData(false);
        }
      };
      fetchSantriDetail();
    }
  }, [mode, santriId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: [] }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Ukuran file maksimal 2MB');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadFoto = async (newSantriId: number) => {
    if (!selectedFile) return;
    
    setUploadingFoto(true);
    try {
      await api.uploadFotoSantri(newSantriId, selectedFile);
    } catch (err: any) {
      console.error('Gagal upload foto:', err);
    } finally {
      setUploadingFoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrors({});

    try {
      let resultId = santriId;
      
      if (mode === 'create') {
        const result = await api.createSantri(formData);
        resultId = result.data?.id;
      } else if (santriId) {
        await api.updateSantri(santriId, formData);
      }

      // Upload foto jika ada file dipilih
      if (selectedFile && resultId) {
        await handleUploadFoto(resultId);
      }

      onSuccess();
    } catch (err: any) {
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setError(err.message || 'Terjadi kesalahan');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen">
          <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
          <div className="relative bg-white rounded-lg p-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary-light" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>

        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {mode === 'create' ? 'Tambah Santri Baru' : 'Edit Data Santri'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Foto Upload Section */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="relative">
                <img
                  src={previewUrl || currentFotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.nama_lengkap_santri || 'S')}&background=random&size=80`}
                  alt="Foto Santri"
                  className="w-20 h-20 rounded-lg object-cover bg-gray-200 border-2 border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full hover:bg-primary-dark"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Upload className="w-4 h-4" />
                  {selectedFile ? 'Ganti Foto' : 'Upload Foto'}
                </button>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF. Maks 2MB</p>
                {selectedFile && (
                  <p className="text-xs text-green-600 mt-1">File dipilih: {selectedFile.name}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email_santri"
                  value={formData.email_santri}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${errors.email_santri ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
                {errors.email_santri && <p className="text-red-500 text-xs mt-1">{errors.email_santri[0]}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  name="nama_lengkap_santri"
                  value={formData.nama_lengkap_santri}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${errors.nama_lengkap_santri ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
                {errors.nama_lengkap_santri && <p className="text-red-500 text-xs mt-1">{errors.nama_lengkap_santri[0]}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Panggilan *</label>
                <input
                  type="text"
                  name="nama_panggilan_santri"
                  value={formData.nama_panggilan_santri}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status_santri"
                  value={formData.status_santri}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Daftar">Daftar</option>
                  <option value="Mondok">Mondok</option>
                  <option value="Alumni">Alumni</option>
                  <option value="Mengabdi">Mengabdi</option>
                  <option value="Keluar">Keluar</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program Santri</label>
                <select
                  name="program_santri"
                  value={formData.program_santri}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  {PROGRAM_SANTRI_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Angkatan *</label>
                <SearchableSelect
                  options={angkatanList.map(a => ({ value: a.id_angkatan, label: a.angkatan }))}
                  value={formData.angkatan_santri}
                  onChange={(val) => setFormData({ ...formData, angkatan_santri: Number(val) })}
                  placeholder="Pilih Angkatan"
                  searchPlaceholder="Cari angkatan..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konsentrasi</label>
                <SearchableSelect
                  options={konsentrasiList.map(k => ({ value: k.id_konsentrasi, label: k.nama_konsentrasi }))}
                  value={formData.konsentrasi_santri}
                  onChange={(val) => setFormData({ ...formData, konsentrasi_santri: Number(val) })}
                  placeholder="Pilih Konsentrasi"
                  searchPlaceholder="Cari konsentrasi..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir *</label>
                <input
                  type="text"
                  name="tempat_lahir_santri"
                  value={formData.tempat_lahir_santri}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir *</label>
                <input
                  type="date"
                  name="tanggal_lahir_santri"
                  value={formData.tanggal_lahir_santri}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asal Daerah</label>
                <input
                  type="text"
                  name="asal_daerah_santri"
                  value={formData.asal_daerah_santri}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Domisili Sekarang</label>
                <input
                  type="text"
                  name="kota_domisili_sekarang_santri"
                  value={formData.kota_domisili_sekarang_santri}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kondisi Keluarga</label>
                <select
                  name="kondisi_keluarga_santri"
                  value={formData.kondisi_keluarga_santri}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Masih Lengkap">Masih Lengkap</option>
                  <option value="Bersama Bapak">Bersama Bapak</option>
                  <option value="Bersama Ibu">Bersama Ibu</option>
                  <option value="Yatim Piatu">Yatim Piatu</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hafalan Quran</label>
                <input
                  type="text"
                  name="hafalan_quran_santri"
                  value={formData.hafalan_quran_santri}
                  onChange={handleChange}
                  placeholder="contoh: 5 Juz"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Anak Ke</label>
                <input
                  type="number"
                  name="anak_ke_santri"
                  value={formData.anak_ke_santri}
                  onChange={handleChange}
                  min={1}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Saudara</label>
                <input
                  type="number"
                  name="jumlah_saudara_santri"
                  value={formData.jumlah_saudara_santri}
                  onChange={handleChange}
                  min={1}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skill/Kelebihan</label>
                <input
                  type="text"
                  name="skill_kelebihan_santri"
                  value={formData.skill_kelebihan_santri}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan (Untuk Mengabdi/Staff)</label>
                <SearchableSelect
                  options={jabatanList.map(j => ({ value: j.id_jabatan, label: j.nama_jabatan }))}
                  value={formData.jabatan_santri}
                  onChange={(val) => setFormData({ ...formData, jabatan_santri: Number(val) })}
                  placeholder="Pilih Jabatan"
                  searchPlaceholder="Cari jabatan..."
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  name="musyrif"
                  checked={formData.musyrif === 1}
                  onChange={(e) => setFormData(prev => ({ ...prev, musyrif: e.target.checked ? 1 : 0 }))}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">Musyrif (Pengajar)</label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
              <RichTextEditor
                value={formData.alamat_lengkap_santri}
                onChange={(value) => setFormData(prev => ({ ...prev, alamat_lengkap_santri: value }))}
                placeholder="Masukkan alamat lengkap..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alasan Mendaftar</label>
              <RichTextEditor
                value={formData.alasan_mendaftar_santri}
                onChange={(value) => setFormData(prev => ({ ...prev, alasan_mendaftar_santri: value }))}
                placeholder="Alasan mendaftar di pesantren ini..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
              <RichTextEditor
                value={formData.target_santri}
                onChange={(value) => setFormData(prev => ({ ...prev, target_santri: value }))}
                placeholder="Target yang ingin dicapai selama belajar..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || uploadingFoto}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 flex items-center gap-2"
              >
                {(loading || uploadingFoto) && <Loader2 className="w-4 h-4 animate-spin" />}
                {uploadingFoto ? 'Mengupload foto...' : (mode === 'create' ? 'Simpan' : 'Update')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
