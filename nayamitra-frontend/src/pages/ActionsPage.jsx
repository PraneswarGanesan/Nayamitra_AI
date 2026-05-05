import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Eye, AlertTriangle, Clock, CheckCircle, FileText } from 'lucide-react';
import Header from '../components/Header';
import { dashboardService } from '../services/api';
import { formatFileName } from '../utils/formatters';

export default function ActionsPage() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await dashboardService.getActions();
        setActions(data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load action plans. Is the backend running?');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <Header title="Action Plans" subtitle="Approved documents with finalized action plans" />
      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-[#1e3a5f] rounded-full"></div>
          </div>
        ) : actions.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-10 flex flex-col items-center justify-center text-gray-400">
            <CheckSquare size={48} className="mb-4 opacity-40" />
            <p className="text-sm">No approved action plans found.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {actions.map(doc => {
              const ap = doc.action_plan;
              const meta = ap?.case_metadata;
              const lim = ap?.limitation_data;
              const dir = ap?.directives?.[0];

              const urgColor = lim?.urgency_status === 'GREEN' ? 'bg-green-50 text-green-700 border-green-200'
                : lim?.urgency_status === 'AMBER' ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-red-50 text-red-700 border-red-200';
              const UrgIcon = lim?.urgency_status === 'GREEN' ? CheckCircle
                : lim?.urgency_status === 'AMBER' ? Clock
                  : AlertTriangle;

              return (
                <div key={doc.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-4 flex justify-between items-start border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-gray-900">{meta?.case_number?.value || 'Unknown Case Number'}</span>
                        {meta?.case_type?.value && (
                          <span className="px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-600 text-[11px] font-semibold">
                            {meta.case_type.value}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1"><FileText size={12}/> {formatFileName(doc.pdf_path)}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      {lim?.urgency_status && (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-[11px] font-semibold ${urgColor}`}>
                          <UrgIcon size={12} />
                          {lim.urgency_status}
                        </span>
                      )}
                      <Link to={`/document/${doc.id}`} className="inline-flex items-center gap-1 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-gray-50 transition-colors">
                        <Eye size={14} /> Details
                      </Link>
                    </div>
                  </div>
                  {dir && (
                    <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50/50">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">Action</div>
                        <div className="text-sm font-medium text-gray-800">{dir.action_plan?.what || '—'}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">Department</div>
                        <div className="text-sm font-medium text-gray-800">{dir.action_plan?.who || '—'}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">Deadline</div>
                        <div className="text-sm font-medium text-gray-800">{lim?.computed_deadline_date || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">Priority</div>
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${dir.action_plan?.priority === 'LOW' ? 'bg-green-50 text-green-700 border-green-200' :
                            dir.action_plan?.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-red-50 text-red-700 border-red-200'
                          }`}>
                          {dir.action_plan?.priority || '—'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
