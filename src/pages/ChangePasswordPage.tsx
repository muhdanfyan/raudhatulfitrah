import { useState } from 'react';
import { API_URL, getHeaders } from '../services/api';
import { KeyRound, Eye, EyeOff, Loader2, Save, ChevronLeft, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';



export default function ChangePasswordPage() {
  const [saving, setSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (formData.new_password !== formData.new_password_confirmation) {
      setMessage({ type: 'error', text: 'Konfirmasi password tidak cocok' });
      return;
    }

    if (formData.new_password.length < 6) {
      setMessage({ type: 'error', text: 'Password baru minimal 6 karakter' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/profile/change-password`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Password berhasil diubah' });
        setFormData({ current_password: '', new_password: '', new_password_confirmation: '' });
      } else {
        setMessage({ type: 'error', text: json.message || 'Gagal mengubah password' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Ganti Password</h1>
            <p className="text-amber-100 text-sm">Perbarui password akun Anda</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-3 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Keamanan Akun</h2>
              <p className="text-sm text-gray-500">Gunakan password yang kuat dan unik</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {message && (
            <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <KeyRound className="w-4 h-4 inline mr-1" />
              Password Saat Ini
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={formData.current_password}
                onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                className="w-full border border-gray-200 rounded-xl p-3 pr-10 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password Baru
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={formData.new_password}
                onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                className="w-full border border-gray-200 rounded-xl p-3 pr-10 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Minimal 6 karakter</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={formData.new_password_confirmation}
                onChange={(e) => setFormData({ ...formData, new_password_confirmation: e.target.value })}
                className="w-full border border-gray-200 rounded-xl p-3 pr-10 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Menyimpan...' : 'Ubah Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
