import { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

// Types
type AlertType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: AlertType;
  title: string;
  message?: string;
}

interface ConfirmOptions {
  title: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
}

interface AlertContextType {
  showToast: (type: AlertType, title: string, message?: string) => void;
  showConfirm: (options: ConfirmOptions) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextType | null>(null);

// Hook to use alerts
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

// Icon components based on type
const getIcon = (type: AlertType) => {
  const iconClass = "w-6 h-6";
  switch (type) {
    case 'success':
      return <CheckCircle2 className={`${iconClass} text-green-500`} />;
    case 'error':
      return <AlertCircle className={`${iconClass} text-red-500`} />;
    case 'warning':
      return <AlertTriangle className={`${iconClass} text-yellow-500`} />;
    case 'info':
    default:
      return <Info className={`${iconClass} text-blue-500`} />;
  }
};

const getBgColor = (type: AlertType) => {
  switch (type) {
    case 'success': return 'bg-green-50 border-green-200';
    case 'error': return 'bg-red-50 border-red-200';
    case 'warning': return 'bg-yellow-50 border-yellow-200';
    case 'info': return 'bg-blue-50 border-blue-200';
    default: return 'bg-gray-50 border-gray-200';
  }
};

const getButtonColor = (type: AlertType) => {
  switch (type) {
    case 'success': return 'bg-green-600 hover:bg-green-700';
    case 'error': return 'bg-red-600 hover:bg-red-700';
    case 'warning': return 'bg-yellow-600 hover:bg-yellow-700';
    case 'info': return 'bg-blue-600 hover:bg-blue-700';
    default: return 'bg-gray-600 hover:bg-gray-700';
  }
};

// Toast Component
const Toast = ({ toast, onClose }: { toast: ToastItem; onClose: () => void }) => {
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm animate-slide-in ${getBgColor(toast.type)}`}
      style={{ animation: 'slideIn 0.3s ease-out' }}
    >
      {getIcon(toast.type)}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900">{toast.title}</p>
        {toast.message && <p className="text-sm text-gray-600 mt-0.5">{toast.message}</p>}
      </div>
      <button
        onClick={onClose}
        className="p-1 hover:bg-black/5 rounded-lg transition"
      >
        <X className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  );
};

// Confirm Dialog Component
const ConfirmDialog = ({
  isOpen,
  options,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  options: ConfirmOptions;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Icon */}
        <div className={`p-6 rounded-t-2xl ${getBgColor(options.type || 'info')}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
              {getIcon(options.type || 'info')}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{options.title}</h3>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600">{options.message}</p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition"
          >
            {options.cancelText || 'Batal'}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 text-white rounded-xl font-medium transition ${getButtonColor(options.type || 'info')}`}
          >
            {options.confirmText || 'Ya, Lanjutkan'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Provider Component
export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    options: { title: '', message: '' },
    resolve: null,
  });

  const showToast = useCallback((type: AlertType, title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showConfirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        options,
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    confirmState.resolve?.(true);
    setConfirmState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  }, [confirmState.resolve]);

  const handleCancel = useCallback(() => {
    confirmState.resolve?.(false);
    setConfirmState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  }, [confirmState.resolve]);

  return (
    <AlertContext.Provider value={{ showToast, showConfirm }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[101] flex flex-col gap-3 max-w-sm">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        options={confirmState.options}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      {/* Global Styles */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </AlertContext.Provider>
  );
};

export default AlertProvider;
