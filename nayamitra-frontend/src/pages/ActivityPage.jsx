import { useState, useEffect } from 'react';
import { Upload, CheckCircle, AlertTriangle, ArrowUpRight, FileText } from 'lucide-react';
import Header from '../components/Header';
import { dashboardService } from '../services/api';
import { formatDocId } from '../utils/formatters';

const iconMap = {
  UPLOAD: { icon: Upload, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  VERIFY_BULK_APPROVE: { icon: CheckCircle, bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  ERROR: { icon: AlertTriangle, bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  FEEDBACK: { icon: ArrowUpRight, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  DEFAULT: { icon: FileText, bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
};

export default function ActivityPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await dashboardService.getAuditLogs();
        setLogs(data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load audit logs.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <Header title="Activity Log" subtitle="Audit trail of all system actions" />
      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-[#1e3a5f] rounded-full" />
            </div>
          ) : logs.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">
              No activity logs found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="w-12 bg-gray-50 border-b border-gray-200"></th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-wide text-gray-400 py-2.5 px-4 bg-gray-50 border-b border-gray-200">Timestamp</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-wide text-gray-400 py-2.5 px-4 bg-gray-50 border-b border-gray-200">User</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-wide text-gray-400 py-2.5 px-4 bg-gray-50 border-b border-gray-200">Action</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-wide text-gray-400 py-2.5 px-4 bg-gray-50 border-b border-gray-200">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const mapped = iconMap[log.action] || iconMap.DEFAULT;
                    const Icon = mapped.icon;
                    return (
                      <tr key={log.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                        <td className="py-2.5 px-4">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${mapped.bg} ${mapped.text}`}>
                            <Icon size={14} />
                          </div>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-xs text-gray-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-4 text-sm font-medium">{log.user_email || log.user_id}</td>
                        <td className="py-2.5 px-4 text-sm font-semibold text-gray-800">{log.action.replace(/_/g, ' ')}</td>
                        <td className="py-2.5 px-4 text-sm text-gray-500">
                          {log.document_id ? <span className="font-mono text-[#2563eb] mr-2">{formatDocId(log.document_id)}</span> : ''}
                          {log.details_json ? <span className="text-xs">{JSON.stringify(log.details_json)}</span> : ''}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
