import { useState, useEffect, useRef } from 'react';
import { API_URL, getHeaders } from '../services/api';
import { Bell, Check, CheckCheck, Info, AlertTriangle, AlertCircle, CheckCircle, X } from 'lucide-react';



interface Notification {
  id_notification: number;
  type: 'info' | 'warning' | 'success' | 'error' | 'reminder';
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);


  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(`${API_URL}/notifications/unread-count`, {
        headers: getHeaders()
      });
      const json = await res.json();
      if (json.status === 'success') {
        setUnreadCount(json.data.count);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/notifications?per_page=10`, {
        headers: getHeaders()
      });
      const json = await res.json();
      if (json.status === 'success') {
        setNotifications(json.data.items);
        setUnreadCount(json.data.unread_count);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: getHeaders()
      });
      setNotifications(prev => prev.map(n => 
        n.id_notification === id ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${API_URL}/notifications/mark-all-read`, {
        method: 'POST',
        headers: getHeaders()
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-primary-light" />;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    if (days < 7) return `${days} hari lalu`;
    return date.toLocaleDateString('id-ID');
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id_notification);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Notifikasi</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
              >
                <CheckCheck className="w-4 h-4" /> Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Memuat...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>Belum ada notifikasi</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id_notification}
                  onClick={() => handleNotificationClick(notification)}
                  className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.is_read ? 'bg-primary/5/50' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${!notification.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <span className="flex-shrink-0 w-2 h-2 bg-primary-light rounded-full mt-1.5"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-0.5">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatTime(notification.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100">
              <a
                href="/notifications"
                className="block text-center text-sm text-primary hover:text-primary-dark"
              >
                Lihat semua notifikasi
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
