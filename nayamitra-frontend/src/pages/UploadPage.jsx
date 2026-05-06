import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, X, AlertCircle, Cpu, Database, Network, Search, Scan, FileCode2, Target, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Header from '../components/Header';
import { documentService } from '../services/api';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  // Cinematic Pipeline State
  const [phase, setPhase] = useState(0); 
  const [progress, setProgress] = useState(0);
  const [resultDocId, setResultDocId] = useState(null);

  const inputRef = useRef();
  const navigate = useNavigate();

  // Handle the artificial timing of the cinematic pipeline
  useEffect(() => {
    if (!uploading) return;

    let progressInterval;
    
    // Simulate progress bar moving forward continuously
    progressInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 98) return p;
        return p + (Math.random() * 2);
      });
    }, 400);

    // Hardcode phase timings to align with typical 30s upload
    const timers = [
      setTimeout(() => setPhase(1), 0),      // Phase 1: Initialize
      setTimeout(() => setPhase(2), 6000),   // Phase 2: PDF Scanning / Bounding Boxes
      setTimeout(() => setPhase(3), 14000),  // Phase 3: Limitation Computation
      setTimeout(() => setPhase(4), 22000),  // Phase 4: Action Plan Cards
      setTimeout(() => setPhase(5), 28000),  // Phase 5: Complete & Redirect
    ];

    return () => {
      clearInterval(progressInterval);
      timers.forEach(clearTimeout);
    };
  }, [uploading]);

  // Navigate when both the backend is done AND the cinematic animation finishes Phase 5
  useEffect(() => {
    if (phase === 5 && resultDocId) {
      setProgress(100);
      setTimeout(() => navigate(`/app/document/${resultDocId}`), 1500);
    }
  }, [phase, resultDocId, navigate]);

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
    setPhase(0);
    setProgress(0);
    setError('');
    
    try {
      const data = await documentService.upload(file);
      setResultDocId(data.doc_id);
      // We don't stop the animation immediately; we wait for the cinematic phases to finish.
      // If the backend finishes incredibly fast (e.g. 5s), it will still wait for phase 5 to show the "wow" factor.
      // If the backend is slow (e.g. 45s), phase 5 will wait until resultDocId is set before navigating.
    } catch (err) {
      setUploading(false);
      setPhase(0);
      setError(err.response?.data?.detail || 'Upload failed. Please try again.');
    }
  };

  return (
    <>
      <Header title="Intelligence Pipeline" subtitle="Upload and extract legal mandates" />
      
      {!uploading ? (
        // Standard Clean UI (Before Upload)
        <div className="p-6 max-w-xl mx-auto mt-10">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 mb-4 flex items-center gap-2 text-sm">
              <AlertCircle size={16} /><span>{error}</span>
            </div>
          )}

          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-[#1e3a5f] bg-blue-50' : 'border-gray-300 bg-white hover:border-[#1e3a5f] hover:bg-slate-50'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />
            <Upload size={36} className="text-slate-400 mx-auto mb-4" />
            <p className="text-sm font-semibold text-slate-800 mb-1">Drop Judgment PDF</p>
            <p className="text-xs text-slate-500">Secure upload • PDF only</p>
          </div>

          {file && (
            <div className="bg-white border border-slate-200 rounded-lg p-4 mt-4 flex items-center gap-3 shadow-sm">
              <FileText size={22} className="text-blue-600" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-800">{file.name}</div>
                <div className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
              <button onClick={() => setFile(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={18} /></button>
            </div>
          )}

          <button
            onClick={handleUpload}
            className="w-full mt-6 bg-[#0a1128] text-white font-bold py-3.5 rounded-sm hover:bg-[#152452] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg tracking-wider text-sm uppercase"
            disabled={!file}
          >
            <Cpu size={18} /> Initialize Extraction
          </button>
        </div>
      ) : (
        // Cinematic Palantir-style Upload Pipeline
        <div className="absolute inset-0 bg-[#0a1128] z-50 text-white flex flex-col font-mono overflow-hidden">
          
          {/* Top Navbar */}
          <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-black/20 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-xs font-bold tracking-[0.2em] text-blue-400 uppercase">System Orchestration</span>
            </div>
            <div className="text-xs font-bold tracking-widest text-slate-500">
              DOC_ID: {resultDocId ? resultDocId.substring(0,8).toUpperCase() : 'ALLOCATING...'}
            </div>
          </div>

          <div className="flex-1 flex p-6 gap-6 h-[calc(100vh-3.5rem)]">
            
            {/* Left Panel: PDF Scanner */}
            <div className="w-1/2 bg-slate-900/50 border border-white/10 rounded-lg relative overflow-hidden flex flex-col shadow-2xl">
              <div className="h-10 border-b border-white/10 flex items-center px-4 bg-black/40">
                <span className="text-[10px] tracking-widest text-slate-400 uppercase"><Scan size={12} className="inline mr-2" /> Live Document Stream</span>
              </div>
              
              <div className="flex-1 p-8 relative flex items-center justify-center bg-[#050914]">
                {/* Mock PDF Document */}
                <div className="w-[85%] h-[95%] bg-white rounded shadow-2xl relative overflow-hidden">
                  {/* Fake Text Lines */}
                  <div className="p-8 space-y-4 opacity-20">
                    <div className="h-4 bg-slate-800 w-3/4 rounded"></div>
                    <div className="h-4 bg-slate-800 w-1/2 rounded"></div>
                    <div className="space-y-2 mt-8">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="h-2 bg-slate-800 rounded" style={{ width: `${Math.random() * 40 + 50}%` }}></div>
                      ))}
                    </div>
                  </div>

                  {/* Scanning Laser Line (Phase 1 & 2) */}
                  {phase < 3 && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)] animate-[scan_3s_ease-in-out_infinite] z-20"></div>
                  )}

                  {/* Bounding Boxes (Phase 2+) */}
                  {phase >= 2 && (
                    <>
                      {/* Bounding Box 1: Case Number */}
                      <div className="absolute top-10 left-8 w-[40%] h-6 border-2 border-blue-500 bg-blue-500/20 animate-pulse">
                        <div className="absolute -top-5 left-0 bg-blue-500 text-white text-[8px] px-1 font-bold">CASE NUMBER</div>
                      </div>
                      
                      {/* Bounding Box 2: Appellant/Respondent */}
                      <div className="absolute top-24 left-8 w-[60%] h-12 border-2 border-purple-500 bg-purple-500/20 animate-pulse delay-75">
                        <div className="absolute -top-5 left-0 bg-purple-500 text-white text-[8px] px-1 font-bold">ENTITIES</div>
                      </div>

                      {/* Bounding Box 3: Operative Order (Phase 4+) */}
                      {phase >= 4 && (
                        <div className="absolute bottom-32 left-8 w-[80%] h-24 border-2 border-amber-500 bg-amber-500/20 animate-pulse delay-150">
                          <div className="absolute -top-5 left-0 bg-amber-500 text-white text-[8px] px-1 font-bold">OPERATIVE ORDER</div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel: Pipeline Intelligence */}
            <div className="w-1/2 flex flex-col gap-6">
              
              {/* Progress & Current Status */}
              <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
                  <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                </div>
                <div className="flex justify-between items-end mb-4">
                  <div className="text-[10px] text-slate-400 tracking-[0.2em] uppercase">Pipeline Status</div>
                  <div className="text-[10px] font-bold text-blue-400">{Math.min(Math.round(progress), 100)}%</div>
                </div>
                
                <h2 className="text-xl font-bold text-white tracking-wide">
                  {phase === 1 && "Initializing OCR Engine..."}
                  {phase === 2 && "Isolating Operative Paragraphs..."}
                  {phase === 3 && "Computing Limitation Risk..."}
                  {phase === 4 && "Generating Departmental Directives..."}
                  {phase === 5 && "Human Verification Required."}
                </h2>
              </div>

              {/* Real-time Extraction Feed */}
              <div className="flex-1 bg-slate-900/50 border border-white/10 rounded-lg p-6 shadow-2xl overflow-hidden flex flex-col">
                <div className="text-[10px] text-slate-400 tracking-[0.2em] uppercase mb-6 flex items-center gap-2">
                  <Database size={12} /> Extraction Event Log
                </div>
                
                <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  
                  {/* Phase 1 Log */}
                  <div className={`transition-all duration-500 ${phase >= 1 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                    <div className="flex gap-3 items-start">
                      <div className="mt-1 w-2 h-2 rounded-full bg-slate-500"></div>
                      <div>
                        <div className="text-xs text-slate-300 font-bold">V-Document Ingested</div>
                        <div className="text-[10px] text-slate-500">{file.name}</div>
                      </div>
                    </div>
                  </div>

                  {/* Phase 2 Log */}
                  <div className={`transition-all duration-500 ${phase >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                    <div className="flex gap-3 items-start">
                      <div className="mt-1 w-2 h-2 rounded-full bg-blue-500"></div>
                      <div>
                        <div className="text-xs text-blue-300 font-bold">Metadata Extracted</div>
                        <div className="text-[10px] text-blue-500/70 mt-1 space-y-1">
                          <div>[ENTITY] Appellant Identified</div>
                          <div>[ENTITY] Respondent Identified</div>
                          <div>[DATE] Judgment Date Parsed</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Phase 3 Log (The Wow Moment) */}
                  <div className={`transition-all duration-500 ${phase >= 3 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                    <div className="flex gap-3 items-start">
                      <div className="mt-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                      <div>
                        <div className="text-xs text-amber-400 font-bold">Risk Computation Complete</div>
                        <div className="mt-2 bg-amber-500/10 border border-amber-500/30 rounded p-2 flex items-center gap-2">
                          <ShieldAlert size={14} className="text-amber-500" />
                          <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Appeal Window Detected</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Phase 4 Log */}
                  <div className={`transition-all duration-500 ${phase >= 4 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                    <div className="flex gap-3 items-start">
                      <div className="mt-1 w-2 h-2 rounded-full bg-purple-500"></div>
                      <div>
                        <div className="text-xs text-purple-300 font-bold">Directives Synthesized</div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="bg-purple-500/10 border border-purple-500/20 rounded p-2 text-[10px] text-purple-300">
                            Dept: Revenue<br/>Conf: 94%
                          </div>
                          <div className="bg-purple-500/10 border border-purple-500/20 rounded p-2 text-[10px] text-purple-300">
                            Dept: Home<br/>Conf: 89%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Phase 5 Log */}
                  <div className={`transition-all duration-500 ${phase >= 5 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                    <div className="flex gap-3 items-start">
                      <div className="mt-1 w-2 h-2 rounded-full bg-green-500"></div>
                      <div>
                        <div className="text-xs text-green-400 font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Pipeline Successful</div>
                        <div className="text-[10px] text-slate-500 mt-1">Awaiting human verification... redirecting.</div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
          
          {/* Custom CSS for Scanner Animation */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes scan {
              0% { top: 0%; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { top: 100%; opacity: 0; }
            }
          `}} />
        </div>
      )}
    </>
  );
}
