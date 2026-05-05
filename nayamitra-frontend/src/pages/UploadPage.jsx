import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import Header from '../components/Header';
import { documentService } from '../services/api';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef();
  const navigate = useNavigate();

  const handleFile = (f) => {
    setError('');
    if (!f.name.endsWith('.pdf')) { setError('Only PDF files are accepted.'); return; }
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const data = await documentService.upload(file);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Header title="Upload Judgment" subtitle="Upload a High Court judgment PDF for AI analysis" />
      <div className="p-6 max-w-xl mx-auto">
        {result ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-green-700" />
            </div>
            <h2 className="text-lg font-bold mb-2">Extraction Complete</h2>
            <p className="text-sm text-gray-500 mb-5">{result.message}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate(`/document/${result.doc_id}`)} className="bg-[#1e3a5f] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#2c5282] cursor-pointer">
                View Action Plan
              </button>
              <button onClick={() => { setFile(null); setResult(null); }} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-50 cursor-pointer">
                Upload Another
              </button>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 mb-4 flex items-center gap-2 text-sm">
                <AlertCircle size={16} /><span>{error}</span>
              </div>
            )}

            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                dragOver ? 'border-[#1e3a5f] bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-[#1e3a5f] hover:bg-blue-50/50'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />
              <Upload size={36} className="text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-semibold mb-1">Drop your judgment PDF here</p>
              <p className="text-xs text-gray-400">or click to browse • PDF files only</p>
            </div>

            {file && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4 flex items-center gap-3">
                <FileText size={22} className="text-[#1e3a5f]" />
                <div className="flex-1">
                  <div className="text-sm font-semibold">{file.name}</div>
                  <div className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
                <button onClick={() => setFile(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X size={18} /></button>
              </div>
            )}

            <button
              onClick={handleUpload}
              className="w-full mt-5 bg-[#1e3a5f] text-white font-semibold py-2.5 rounded-md hover:bg-[#2c5282] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              disabled={!file || uploading}
            >
              {uploading ? (
                <><div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> Processing…</>
              ) : (
                <><Upload size={16} /> Upload & Analyze</>
              )}
            </button>

            {uploading && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-md px-4 py-3 mt-4 text-sm flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-blue-300 border-t-blue-700 rounded-full" />
                The AI pipeline is analyzing the judgment. This may take 30–60 seconds…
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
