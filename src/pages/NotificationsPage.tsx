import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Bell, Check, CheckCheck, Info, AlertTriangle, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';



interface Notification {
  id_notification: number;
  type: 'info' | 'warning' | 'success' | 'error' | 'reminder';
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage.toString(), per_page: '20' });
      if (filter === 'unread') params.append('unread', 'true');
      
      const json: any = await api.get(`/notifications?${params}`);
      if (json.status === 'success') {
        setNotifications(json.data.items);
        setTotalPages(json.data.last_page);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [currentPage, filter]);

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => 
        n.id_notification === id ? { ...n, is_read: true } : n
      ));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read', {});
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-primary-light" />;
    }
  };

  const getTypeBg = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-primary/5 border-blue-200';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifikasi</h1>
          <p className="text-gray-600">Semua notifikasi dan pengumuman</p>
        </div>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value as 'all' | 'unread'); setCurrentPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="all">Semua</option>
            <option value="unread">Belum dibaca</option>
          </select>
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center gap-2"
          >
            <CheckCheck className="w-4 h-4" /> Tandai Semua Dibaca
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada notifikasi</h3>
          <p className="text-gray-500">Belum ada notifikasi untuk ditampilkan</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id_notification}
              className={`bg-white rounded-xl shadow-sm border p-4 ${
                !notification.is_read ? 'ring-2 ring-blue-200' : ''
              }`}
            >
              <div className="flex gap-4">
                <div className={`flex-shrink-0 p-2 rounded-lg ${getTypeBg(notification.type)}`}>
                  {getTypeIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className={`font-semibold ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h3>
                      <p className="text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-sm text-gray-400 mt-2">{formatDate(notification.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id_notification)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg"
                          title="Tandai sudah dibaca"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {notification.link && (
                        <a
                          href={notification.link}
                          className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary-dark"
                        >
                          Lihat
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Sebelumnya
              </button>
              <span className="px-4 py-2">
                Halaman {currentPage} dari {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Berikutnya
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
