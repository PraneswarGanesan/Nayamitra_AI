import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Eye, CheckCircle, Clock, AlertTriangle, Search } from 'lucide-react';
import Header from '../components/Header';
import { documentService } from '../services/api';
import { formatDocId, formatFileName } from '../utils/formatters';

function StatusBadge({ status }) {
  if (!status) return null;
  const s = status.toLowerCase();
  const cls = s.includes('approved') ? 'bg-green-50 text-green-700 border-green-200'
    : s.includes('pending') ? 'bg-amber-50 text-amber-700 border-amber-200'
    : s.includes('failed') ? 'bg-red-50 text-red-700 border-red-200'
    : 'bg-gray-100 text-gray-600 border-gray-200';
  const Icon = s.includes('approved') ? CheckCircle : s.includes('pending') ? Clock : s.includes('failed') ? AlertTriangle : FileText;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-semibold ${cls}`}>
      <Icon size={12} /> {status}
    </span>
  );
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await documentService.list();
        setDocs(data);
      } catch (err) {
        setError('Failed to load documents. Is the backend running?');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = docs.filter(d => {
    if (filter !== 'all' && !d.status?.toLowerCase().includes(filter)) return false;
    if (search && !d.id.toLowerCase().includes(search.toLowerCase()) && !d.pdf_path?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: docs.length,
    approved: docs.filter(d => d.status?.toLowerCase().includes('approved')).length,
    pending: docs.filter(d => d.status?.toLowerCase().includes('pending')).length,
    failed: docs.filter(d => d.status?.toLowerCase().includes('failed')).length,
  };

  return (
    <>
      <Header title="Documents" subtitle="All uploaded judgment PDFs" />
      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 mb-4 text-sm">{error}</div>
        )}

        {/* Filter bar */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {[
            { key: 'all', label: 'All' },
            { key: 'approved', label: 'Approved' },
            { key: 'pending', label: 'Pending' },
            { key: 'failed', label: 'Failed' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                filter === f.key
                  ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.label} ({counts[f.key]})
            </button>
          ))}
          <div className="flex-1" />
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="border border-gray-200 rounded-md pl-8 pr-3 py-1.5 text-xs w-48 focus:outline-none focus:border-[#1e3a5f]"
              placeholder="Search documents…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-lg">
          {loading ? (
            <div className="p-10 text-center">
              <div className="animate-spin w-5 h-5 border-2 border-gray-300 border-t-[#1e3a5f] rounded-full mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">
              {docs.length === 0 ? 'No documents uploaded yet.' : 'No documents match your filter.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left text-[11px] font-bold uppercase tracking-wide text-gray-400 py-2.5 px-4 bg-gray-50 border-b border-gray-200">Document ID</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-wide text-gray-400 py-2.5 px-4 bg-gray-50 border-b border-gray-200">File</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-wide text-gray-400 py-2.5 px-4 bg-gray-50 border-b border-gray-200">Status</th>
                    <th className="text-right text-[11px] font-bold uppercase tracking-wide text-gray-400 py-2.5 px-4 bg-gray-50 border-b border-gray-200 w-24">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(doc => (
                    <tr key={doc.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-gray-700">{formatDocId(doc.id)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-[#2563eb]" />
                          <span className="text-sm font-medium">{formatFileName(doc.pdf_path) || 'judgment.pdf'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4"><StatusBadge status={doc.status} /></td>
                      <td className="py-3 px-4 text-right">
                        <Link to={`/document/${doc.id}`} className="inline-flex items-center gap-1 bg-white border border-gray-200 text-[#2563eb] px-3 py-1.5 rounded-md text-xs font-bold hover:bg-blue-50 transition-colors shadow-sm">
                          <Eye size={13} /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
