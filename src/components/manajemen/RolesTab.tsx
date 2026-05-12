import { useState, useEffect } from 'react';
import { API_URL, getHeaders } from '../../services/api';
import { Shield, Plus, Pencil, Trash2, Users, Loader2, X, Save } from 'lucide-react';

interface Role {
  id: number;
  name: string;
  description: string;
  users_count: number;
}

export default function RolesTab() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);


  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/roles`, {
        headers: getHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setRoles(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreate = () => {
    setEditRole(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (role: Role) => {
    setEditRole(role);
    setFormData({ name: role.name, description: role.description || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editRole ? `${API_URL}/api/roles/${editRole.id}` : `${API_URL}/api/roles`;
      const response = await fetch(url, {
        method: editRole ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        fetchRoles();
      } else {
        alert(data.message || 'Gagal menyimpan');
      }
    } catch (error) {
      console.error('Failed to save role:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const response = await fetch(`${API_URL}/api/roles/${deleteId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setDeleteId(null);
        fetchRoles();
      } else {
        alert(data.message || 'Gagal menghapus');
      }
    } catch (error) {
      console.error('Failed to delete role:', error);
    } finally {
      setDeleting(false);
    }
  };

  const ROLE_COLORS: Record<string, string> = {
    admin: 'bg-red-100 text-red-800 border-red-200',
    members: 'bg-blue-100 text-blue-800 border-blue-200',
    pengontrol: 'bg-purple-100 text-purple-800 border-purple-200',
    mentor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    akademik: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    pembinaan: 'bg-green-100 text-green-800 border-green-200',
    asrama: 'bg-orange-100 text-orange-800 border-orange-200',
    koperasi: 'bg-teal-100 text-teal-800 border-teal-200',
    ppdb: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    ortu: 'bg-pink-100 text-pink-800 border-pink-200',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Daftar Role</h2>
          <p className="text-sm text-gray-500">Total {roles.length} role</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Role</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <div
            key={role.id}
            className={`p-5 rounded-xl border-2 ${ROLE_COLORS[role.name] || 'bg-gray-50 border-gray-200'}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/60 rounded-lg">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold capitalize">{role.name}</h3>
                  <p className="text-xs opacity-75">{role.description || '-'}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm">
                <Users className="w-4 h-4" />
                <span>{role.users_count} user</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(role)}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteId(role.id)}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors text-red-600"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold">{editRole ? 'Edit Role' : 'Tambah Role'}</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Role *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
                    placeholder="contoh: akademik"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Deskripsi role..."
                  />
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3 rounded-b-2xl">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-xl hover:bg-gray-100">
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.name}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Save className="w-4 h-4" />
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
            <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">Hapus Role?</h3>
              <p className="text-gray-600 text-center mb-6">Role sistem tidak dapat dihapus. Role dengan user aktif juga tidak bisa dihapus.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 border rounded-xl hover:bg-gray-100">
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
