import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL, getHeaders } from '../../services/api';

interface FormData {
  nama_programdonasi: string;
  anggaran_programdonasi: number;
  tanggal_mulai: string;
  tanggal_akhir: string;
  deskripsi_programdonasi: string;
  kriteria_donasi: string;
  status_program: string;
  is_featured: boolean;
  gambar: File | null;
}

const API_BASE = API_URL;

const CrowdfundCampaignFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [form, setForm] = useState<FormData>({
    nama_programdonasi: '',
    anggaran_programdonasi: 10000000,
    tanggal_mulai: getLocalDateString(),
    tanggal_akhir: getLocalDateString(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    deskripsi_programdonasi: '',
    kriteria_donasi: '',
    status_program: 'draft',
    is_featured: false,
    gambar: null
  });
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchCampaign();
    }
  }, [id]);

  const fetchCampaign = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/crowdfund-admin/campaigns/${id}`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success && data.data) {
        const c = data.data;
        setForm({
          nama_programdonasi: c.nama_programdonasi,
          anggaran_programdonasi: c.anggaran_programdonasi,
          tanggal_mulai: c.tanggal_mulai,
          tanggal_akhir: c.tanggal_akhir,
          deskripsi_programdonasi: c.deskripsi_programdonasi,
          kriteria_donasi: c.kriteria_donasi || '',
          status_program: c.status_program,
          is_featured: c.is_featured,
          gambar: null
        });
        setExistingImage(c.gambar_url);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = isEdit ? `${API_BASE}/crowdfund-admin/campaigns/${id}` : `${API_BASE}/crowdfund-admin/campaigns`;
      const res = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        navigate('/crowdfund');
      } else {
        alert(data.message || 'Gagal menyimpan');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/crowdfund')} className="p-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEdit ? 'Edit Program Donasi' : 'Tambah Program Donasi'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-6">
        {/* Nama Program */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Program *</label>
          <input
            type="text"
            value={form.nama_programdonasi}
            onChange={(e) => setForm({ ...form, nama_programdonasi: e.target.value })}
            className="w-full border rounded-lg px-4 py-2"
            placeholder="Contoh: Pembangunan Masjid Baru"
            required
          />
        </div>

        {/* Target & Tanggal */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Dana *</label>
            <input
              type="number"
              value={form.anggaran_programdonasi}
              onChange={(e) => setForm({ ...form, anggaran_programdonasi: parseInt(e.target.value) || 0 })}
              className="w-full border rounded-lg px-4 py-2"
              min={100000}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{formatCurrency(form.anggaran_programdonasi)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai *</label>
            <input
              type="date"
              value={form.tanggal_mulai}
              onChange={(e) => setForm({ ...form, tanggal_mulai: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Berakhir *</label>
            <input
              type="date"
              value={form.tanggal_akhir}
              onChange={(e) => setForm({ ...form, tanggal_akhir: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
              required
            />
          </div>
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Program *</label>
          <textarea
            value={form.deskripsi_programdonasi}
            onChange={(e) => setForm({ ...form, deskripsi_programdonasi: e.target.value })}
            className="w-full border rounded-lg px-4 py-2"
            rows={5}
            placeholder="Jelaskan tentang program donasi ini..."
            required
          />
        </div>

        {/* Kriteria */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kriteria Donasi</label>
          <input
            type="text"
            value={form.kriteria_donasi}
            onChange={(e) => setForm({ ...form, kriteria_donasi: e.target.value })}
            className="w-full border rounded-lg px-4 py-2"
            placeholder="Contoh: Minimal Rp 50.000"
          />
        </div>

        {/* Status & Featured */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status_program}
              onChange={(e) => setForm({ ...form, status_program: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
            >
              <option value="draft">Draft</option>
              <option value="active">Aktif</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
          <div className="flex items-center pt-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="w-5 h-5 text-emerald-600 rounded"
              />
              <span className="text-gray-700">Tampilkan sebagai Program Unggulan</span>
            </label>
          </div>
        </div>

        {/* Gambar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Program</label>
          {existingImage && !form.gambar && (
            <div className="mb-2">
              <img src={existingImage} alt="Current" className="h-32 rounded-lg object-cover" />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setForm({ ...form, gambar: e.target.files?.[0] || null })}
            className="w-full border rounded-lg px-4 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">Format: JPG/PNG, Maksimal 2MB</p>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/crowdfund')}
            className="px-6 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            {saving ? 'Menyimpan...' : isEdit ? 'Update Program' : 'Simpan Program'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrowdfundCampaignFormPage;
