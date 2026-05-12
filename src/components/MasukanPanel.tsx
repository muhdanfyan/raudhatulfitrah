import { useState } from 'react';
import { MessageSquare, Send, X, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface Masukan {
  id_masukan: number;
  santri: number;
  masukan: string;
  bidang: number;
  status: string;
  tanggapan: string;
  created_at: string;
  nama_lengkap_santri: string;
  nama_jabatan: string;
}

interface MasukanPanelProps {
  masukan: Masukan[];
  title?: string;
  onRefresh?: () => void;
}

export default function MasukanPanel({ masukan, title = 'Masukan Santri', onRefresh }: MasukanPanelProps) {
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [saving, setSaving] = useState(false);

  const pendingCount = masukan.filter(m => !m.tanggapan).length;
  const respondedCount = masukan.filter(m => m.tanggapan).length;

  const handleSubmitReply = async (id: number) => {
    if (!replyText.trim()) return;
    
    setSaving(true);
    try {
      await api.tanggapiMasukan(id, replyText);
      setReplyingId(null);
      setReplyText('');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Gagal menyimpan tanggapan');
    } finally {
      setSaving(false);
    }
  };

  if (!masukan || masukan.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {title}
          </h2>
          <div className="flex gap-2 text-xs">
            {pendingCount > 0 && (
              <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {pendingCount} Belum
              </span>
            )}
            {respondedCount > 0 && (
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {respondedCount} Sudah
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {masukan.map((item) => (
          <div 
            key={item.id_masukan} 
            className={`p-4 ${item.tanggapan ? 'bg-emerald-50/50' : 'bg-amber-50/50'}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="font-medium text-gray-900">{item.nama_lengkap_santri}</span>
                <span className="text-xs text-gray-500 ml-2">
                  {item.nama_jabatan} • {new Date(item.created_at).toLocaleDateString('id-ID')}
                </span>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${item.tanggapan ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'}`}>
                {item.tanggapan ? '✓ Ditanggapi' : '⏳ Pending'}
              </span>
            </div>
            
            <div className="text-sm text-gray-700 mb-3 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: item.masukan }} />
            
            {item.tanggapan ? (
              <div className="p-3 bg-white rounded border border-emerald-200">
                <div className="text-xs text-emerald-600 font-medium mb-1">Tanggapan:</div>
                <div className="text-sm text-gray-700 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: item.tanggapan }} />
              </div>
            ) : replyingId === item.id_masukan ? (
              <div className="space-y-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Tulis tanggapan..."
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-primary"
                  rows={3}
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => { setReplyingId(null); setReplyText(''); }}
                    disabled={saving}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
                  >
                    <X className="w-4 h-4 inline mr-1" />
                    Batal
                  </button>
                  <button
                    onClick={() => handleSubmitReply(item.id_masukan)}
                    disabled={saving || !replyText.trim()}
                    className="px-3 py-1.5 text-sm bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50 flex items-center gap-1"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Kirim
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setReplyingId(item.id_masukan)}
                className="text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-1"
              >
                <Send className="w-4 h-4" />
                Tanggapi
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
