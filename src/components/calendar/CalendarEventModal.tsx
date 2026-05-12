import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Calendar, Clock, Tag, FileText, Save, Loader2, Users } from 'lucide-react';
import { api } from '../../services/api';
import { format } from 'date-fns';

interface CalendarEventFormData {
  category: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  is_full_day: boolean;
  recurrence: string;
  visibility: string;
  pj_id?: number | null;
}

interface CalendarEvent {
  id: string | number;
  title: string;
  category: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  source: string;
  color: string;
  is_full_day?: boolean;
  recurrence?: string;
  visibility?: string;
  created_by?: number;
  pj_id?: number | null;
  pj_name?: string;
}

interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  existingEvents: CalendarEvent[];
  onEventSaved?: () => void;
}

const CATEGORY_OPTIONS = [
  { value: 'event', label: 'Event', color: '#8b5cf6' },
  { value: 'sharing', label: 'Sharing', color: '#10b981' },
  { value: 'visit', label: 'Kunjungan', color: '#f97316' },
  { value: 'libur', label: 'Libur', color: '#ef4444' },
];

const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'Tidak berulang' },
  { value: 'weekly', label: 'Mingguan' },
  { value: 'bi-weekly', label: 'Dua Mingguan' },
  { value: 'monthly', label: 'Bulanan' },
];

const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  existingEvents,
  onEventSaved,
}) => {
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [canManage, setCanManage] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [userJabatanId, setUserJabatanId] = useState<number | null>(null);
  const [linkedJabatanId, setLinkedJabatanId] = useState<number | null>(null);
  const [staffList, setStaffList] = useState<{id: number, name: string}[]>([]);
  const [formData, setFormData] = useState<CalendarEventFormData>({
    category: 'event',
    title: '',
    description: '',
    start_date: format(selectedDate, 'yyyy-MM-dd'),
    end_date: '',
    is_full_day: true,
    recurrence: 'none',
    visibility: 'all',
  });

  // Filter only calendar events (not agenda/proker)
  useEffect(() => {
    if (isOpen) {
      setMode('list');
      setEditingEvent(null);
      setError('');
      resetForm();
      fetchPermissions();
    }
  }, [isOpen, selectedDate]);

  const fetchPermissions = async () => {
    try {
      const response = await api.get('/calendar/permissions');
      if (response.status === 'success') {
        const { role, user_id } = response.data;
        setCanManage(true); // Force true as requested for universal visibility
        setUserRole(role || '');
        setCurrentUserId(user_id || null);
        setUserJabatanId(response.data.user_jabatan_id || null);
        setLinkedJabatanId(response.data.linked_jabatan_id || null);
        setStaffList(response.data.staff_list || []);
        
        const isAdmin = ['superadmin', 'admin', 'kepsek'].includes(role?.toLowerCase() || '') || user_id === 10007061;
        
        if (mode === 'add' || (mode === 'list' && !editingEvent)) {
          if (!isAdmin && response.data.linked_jabatan_id) {
            setFormData(prev => ({ ...prev, pj_id: response.data.linked_jabatan_id }));
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch calendar permissions');
    }
  };

  const resetForm = () => {
    setFormData({
      category: 'event',
      title: '',
      description: '',
      start_date: format(selectedDate, 'yyyy-MM-dd'),
      end_date: '',
      is_full_day: true,
      recurrence: 'none',
      visibility: 'all',
      pj_id: currentUserId,
    });
  };

  const handleAddNew = () => {
    resetForm();
    setMode('add');
    setEditingEvent(null);
  };

  const handleEdit = async (event: CalendarEvent) => {
    if (event.source !== 'calendar') {
      setError('Hanya event kalender yang bisa diedit');
      return;
    }

    setLoading(true);
    try {
      const eventId = typeof event.id === 'string' ? parseInt(event.id) : event.id;
      const response = await api.getCalendarEvent(eventId);
      if (response.status === 'success') {
        const eventData = response.data;
        setFormData({
          category: eventData.category || 'event',
          title: eventData.title || '',
          description: eventData.description || '',
          start_date: eventData.start_date?.split('T')[0] || format(selectedDate, 'yyyy-MM-dd'),
          end_date: eventData.end_date?.split('T')[0] || '',
          is_full_day: eventData.is_full_day ?? true,
          recurrence: eventData.recurrence || 'none',
          visibility: eventData.visibility || 'all',
          pj_id: eventData.pj_id || null,
        });
        setEditingEvent(event);
        setMode('edit');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data event');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (event: CalendarEvent) => {
    if (event.source !== 'calendar') {
      setError('Hanya event kalender yang bisa dihapus');
      return;
    }

    if (!confirm(`Hapus event "${event.title}"?`)) return;

    setLoading(true);
    try {
      const eventId = typeof event.id === 'string' ? parseInt(event.id) : event.id;
      await api.deleteCalendarEvent(eventId);
      onEventSaved?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus event');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Judul event wajib diisi');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (mode === 'edit' && editingEvent) {
        const eventId = typeof editingEvent.id === 'string' ? parseInt(editingEvent.id) : editingEvent.id;
        await api.updateCalendarEvent(eventId, {
          ...formData,
          end_date: formData.end_date || undefined,
        });
      } else {
        await api.saveCalendarEvent({
          ...formData,
          end_date: formData.end_date || undefined,
        });
      }
      onEventSaved?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan event');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5" />
            <div>
              <h2 className="font-bold">
                {mode === 'list' ? 'Event Kalender' : mode === 'add' ? 'Tambah Event' : 'Edit Event'}
              </h2>
              <p className="text-sm text-indigo-100">{format(selectedDate, 'EEEE, d MMMM yyyy')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {mode === 'list' ? (
            <div className="space-y-3">
              {/* Add Button - Only for authorized users */}
              {canManage && (
                <button
                  onClick={handleAddNew}
                  className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-indigo-300 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Tambah Event Baru</span>
                </button>
              )}

              {/* Existing Events */}
              {existingEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Tidak ada event pada tanggal ini</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                    Event Hari Ini ({existingEvents.length})
                  </h3>
                  {existingEvents.map((event, index) => {
                    const isAdmin = ['superadmin', 'admin', 'kepsek'].includes(userRole.toLowerCase());
                    const canEdit = isAdmin || 
                                   (event.pj_id === currentUserId || 
                                    event.created_by === currentUserId || 
                                    (userJabatanId && event.pj_id === userJabatanId) ||
                                    (linkedJabatanId && event.pj_id === linkedJabatanId));
                    
                    return (
                      <div
                        key={event.id || index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group hover:bg-gray-100 transition-colors"
                      >
                        <div
                          className="w-3 h-10 rounded-full flex-shrink-0"
                          style={{ backgroundColor: event.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{event.title}</p>
                          <p className="text-xs text-gray-500 capitalize">
                            {event.source === 'calendar' ? event.category : event.source}
                            {event.pj_name && ` • PJ: ${event.pj_name}`}
                          </p>
                        </div>
                        {event.source === 'calendar' && canManage && canEdit && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(event)}
                              disabled={loading}
                              className="p-2 hover:bg-indigo-100 rounded-lg text-indigo-600"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(event)}
                              disabled={loading}
                              className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      {event.source !== 'calendar' && (
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-200/50 px-2 py-1 rounded uppercase tracking-wider">
                          {event.source}
                        </span>
                      )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Add/Edit Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Kategori
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORY_OPTIONS.map((cat) => {
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat.value })}
                        className={`p-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          formData.category === cat.value
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className="w-3 h-3 rounded-full mx-auto mb-1"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Judul Event *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nama event..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi event (opsional)..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Tanggal Mulai *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    min={formData.start_date}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Recurrence */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pengulangan
                </label>
                <select
                  value={formData.recurrence}
                  onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {RECURRENCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Full Day Toggle */}
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_full_day}
                  onChange={(e) => setFormData({ ...formData, is_full_day: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Event sepanjang hari</span>
              </label>

              {/* PJ Selection */}
              {staffList.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Users className="w-4 h-4 inline mr-1" />
                    Penanggung Jawab (PJ)
                  </label>
                  <select
                    value={formData.pj_id || ''}
                    onChange={(e) => setFormData({ ...formData, pj_id: e.target.value ? parseInt(e.target.value) : null })}
                    disabled={!['superadmin', 'admin', 'kepsek'].includes(userRole.toLowerCase()) && currentUserId !== 10007061 && linkedJabatanId !== null}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${(!['superadmin', 'admin', 'kepsek'].includes(userRole.toLowerCase()) && currentUserId !== 10007061 && linkedJabatanId) ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
                  >
                    <option value="">-- Pilih PJ (Jabatan) --</option>
                    {staffList.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        {mode !== 'list' && (
          <div className="flex items-center justify-between p-4 border-t bg-gray-50">
            <button
              type="button"
              onClick={() => setMode('list')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.title.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {mode === 'edit' ? 'Simpan Perubahan' : 'Simpan Event'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarEventModal;
