import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, CheckCircle, Clock, AlertTriangle, Upload } from 'lucide-react';
import Header from '../components/Header';
import { documentService, dashboardService } from '../services/api';
import { formatDocId } from '../utils/formatters';

export default function DashboardPage() {
  const [docs, setDocs] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [docsRes, actionsRes] = await Promise.all([
          documentService.list(),
          dashboardService.getActions(),
        ]);
        setDocs(docsRes);
        setActions(actionsRes);
      } catch (err) {
        setError('Failed to load dashboard data. Is the backend running?');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Derive stats from real data
  const stats = useMemo(() => ({
    total: docs.length,
    approved: docs.filter(d => d.status === 'Approved').length,
    pending: docs.filter(d => d.status === 'Pending Verification').length,
    failed: docs.filter(d => d.status === 'Failed').length,
  }), [docs]);

  // Derive urgency chart from real action plans
  const urgencyData = useMemo(() => {
    const counts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    actions.forEach(a => {
      a.action_plan?.directives?.forEach(d => {
        if (counts[d.urgency] !== undefined) counts[d.urgency]++;
      });
    });
    return [
      { name: 'Low', value: counts.LOW, color: '#166534' },
      { name: 'Medium', value: counts.MEDIUM, color: '#92400e' },
      { name: 'High', value: counts.HIGH, color: '#991b1b' },
    ].filter(d => d.value > 0);
  }, [actions]);

  // Derive status chart from real docs
  const statusData = useMemo(() => {
    return [
      { name: 'Approved', value: stats.approved, color: '#166534' },
      { name: 'Pending', value: stats.pending, color: '#92400e' },
      { name: 'Failed', value: stats.failed, color: '#991b1b' },
    ].filter(d => d.value > 0);
  }, [stats]);

  if (loading) {
    return (
      <>
        <Header title="Dashboard" subtitle="Overview of case monitoring" />
        <div className="p-6 flex items-center justify-center h-64">
          <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-[#1e3a5f] rounded-full" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Dashboard" subtitle="Overview of case monitoring" />
      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Documents', value: stats.total, icon: FileText, color: 'border-t-[#1e3a5f] text-[#1e3a5f]' },
            { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'border-t-green-700 text-green-700' },
            { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'border-t-amber-700 text-amber-700' },
            { label: 'Failed', value: stats.failed, icon: AlertTriangle, color: 'border-t-red-700 text-red-700' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`bg-white border border-gray-200 rounded-lg p-5 border-t-3 ${s.color.split(' ')[0]}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">{s.label}</div>
                    <div className={`text-3xl font-bold ${s.color.split(' ')[1]}`}>{s.value}</div>
                  </div>
                  <Icon size={20} className="text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts - only show if there's data */}
        {docs.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Status distribution */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-4">Document Status</h3>
              {statusData.length > 0 ? (
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" stroke="none">
                        {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1">
                    {statusData.map(it => (
                      <div key={it.name} className="flex items-center gap-2 mb-2">
                        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: it.color }} />
                        <span className="flex-1 text-sm text-gray-600">{it.name}</span>
                        <span className="text-sm font-bold">{it.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No data</p>
              )}
            </div>

            {/* Urgency distribution from actions */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-4">Directive Urgency</h3>
              {urgencyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={urgencyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12 }} />
                    <Bar dataKey="value" name="Directives" radius={[3, 3, 0, 0]}>
                      {urgencyData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-400">No approved action plans yet</p>
              )}
            </div>
          </div>
        )}

        {/* Recent action plans from real data */}
        {actions.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-4">Recent Approved Action Plans</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-[11px] font-bold uppercase tracking-wide text-gray-400 py-2 px-3">Case Number</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-wide text-gray-400 py-2 px-3">Type</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-wide text-gray-400 py-2 px-3">Urgency</th>
                    <th className="text-right text-[11px] font-bold uppercase tracking-wide text-gray-400 py-2 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {actions.slice(0, 5).map(doc => {
                    const meta = doc.action_plan?.case_metadata;
                    const urg = doc.action_plan?.limitation_data?.urgency_status;
                    return (
                      <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2.5 px-3 font-mono text-sm font-semibold text-gray-700">{meta?.case_number?.value ? `${formatDocId(doc.id)} (${meta.case_number.value})` : formatDocId(doc.id)}</td>
                        <td className="py-2.5 px-3 text-sm text-gray-600">{meta?.case_type?.value || '—'}</td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            urg === 'GREEN' ? 'bg-green-50 text-green-700 border border-green-200' :
                            urg === 'AMBER' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-red-50 text-red-700 border border-red-200'
                          }`}>{urg || '—'}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <Link to={`/app/document/${doc.id}`} className="inline-flex items-center gap-1 bg-white border border-gray-200 text-[#2563eb] px-3 py-1.5 rounded-md text-xs font-bold hover:bg-blue-50 transition-colors shadow-sm">View</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="flex gap-3">
          <Link to="/app/upload" className="inline-flex items-center gap-2 bg-[#1e3a5f] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#2c5282] transition-colors">
            <Upload size={16} /> Upload Judgment
          </Link>
          <Link to="/app/documents" className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-50 transition-colors">
            <FileText size={16} /> All Documents
          </Link>
        </div>
      </div>
    </>
  );
}
