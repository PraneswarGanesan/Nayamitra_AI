import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Save, Send, MessageSquare, AlertCircle, Scale, Clock, History, FileText } from 'lucide-react';
import { documentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDocId } from '../utils/formatters';
import PdfHighlighter from '../components/PdfHighlighter';

export default function DocumentDetailPage() {
  const { docId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'chat'
  
  // Edit State
  const [editForm, setEditForm] = useState({});
  const [directivesForm, setDirectivesForm] = useState([]);
  const [activeHighlight, setActiveHighlight] = useState(null);
  
  // Chat State
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await documentService.get(docId);
        setDoc(data);
        
        // Initialize form state
        if (data?.action_plan?.case_metadata) {
          const meta = data.action_plan.case_metadata;
          setEditForm({
            case_title: meta.case_title || { value: '' },
            case_type: meta.case_type || { value: '' },
            case_number: meta.case_number || { value: '' },
            court_name: meta.court_name || { value: '' },
            date_of_order: meta.date_of_order || { value: '' },
            judge_name: meta.judge_name || { value: '' },
            appellant: meta.appellant || { value: '' },
            respondent: meta.respondent || { value: '' },
          });
        }
        if (data?.action_plan?.directives) {
          setDirectivesForm(data.action_plan.directives);
        }
        
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load document.');
      } finally {
        setLoading(false);
      }
    })();
  }, [docId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleVerify = async () => {
    if (!doc?.action_plan) return;
    setVerifying(true);
    
    // Construct updated action plan
    const updatedPlan = { ...doc.action_plan };
    if (updatedPlan.case_metadata) {
      Object.keys(editForm).forEach(key => {
        if (updatedPlan.case_metadata[key]) {
          updatedPlan.case_metadata[key].value = editForm[key].value;
        } else {
          updatedPlan.case_metadata[key] = { value: editForm[key].value, status: 'Manual Entry' };
        }
      });
    }
    updatedPlan.directives = updatedPlan.directives?.map((d, i) => ({
      ...d,
      summary: directivesForm[i].summary
    }));

    try {
      await documentService.verify(docId, updatedPlan);
      setDoc(prev => ({ ...prev, status: 'Approved', action_plan: updatedPlan }));
    } catch (err) {
      setError(err.response?.data?.detail || 'Verification failed.');
    }
    setVerifying(false);
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const userMsg = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);
    
    try {
      const data = await documentService.chat(docId, userMsg.content, chatMessages);
      setChatMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return (<div className="flex h-screen items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-[#2563eb] rounded-full" /></div>);
  if (error && !doc) return (<div className="p-6 text-red-600">{error}</div>);

  // For the hackathon demo, we'll allow any role to see the buttons
  const canVerify = true; 
  const isApproved = doc?.status === 'Approved';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      
      {/* Left Panel: Edit & Chat */}
      <div className="w-1/2 flex flex-col border-r border-gray-200 bg-white shadow-sm z-10">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
          <div>
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-[#2563eb] hover:underline mb-1 cursor-pointer">
              <ArrowLeft size={14} /> Back to Pending
            </button>
            <h1 className="text-lg font-bold text-gray-900">Verify Document</h1>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Document ID:</div>
            <div className="text-sm font-mono font-semibold">{formatDocId(doc?.id) || doc?.id?.substring(0,8)}</div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-200 px-6 mt-2">
          <button 
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${activeTab === 'edit' ? 'border-[#2563eb] text-[#2563eb]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('edit')}
          >
            Verification Data
          </button>
          <button 
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${activeTab === 'chat' ? 'border-[#2563eb] text-[#2563eb]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare size={14} /> AI Assistant
          </button>
        </div>

        {/* Panel Content Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gray-50/50">
          
          {activeTab === 'edit' && (
            <div className="space-y-6">
              
              {/* Metadata Form */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/80">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">Case Information</h3>
                </div>
                <div className="p-4 space-y-3">
                  {Object.entries({
                    case_title: 'Case Title',
                    case_type: 'Case Type',
                    case_number: 'Case Number',
                    court_name: 'Court Name',
                    date_of_order: 'Date of Order',
                    judge_name: 'Judge Name',
                    appellant: 'Appellant',
                    respondent: 'Respondent'
                  }).map(([key, label]) => (
                    <div key={key} className="flex flex-col mb-4">
                      <div className="flex flex-col md:flex-row md:items-center gap-2">
                        <label className="text-xs font-semibold text-gray-700 md:w-1/3">{label}</label>
                        <input 
                          type="text"
                          className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] transition-shadow disabled:bg-gray-50 disabled:text-gray-500"
                          value={editForm[key]?.value || ''}
                          onChange={e => setEditForm({...editForm, [key]: { ...editForm[key], value: e.target.value }})}
                          onFocus={() => {
                            if (editForm[key]?.bbox && editForm[key]?.page_num) {
                              setActiveHighlight({ bbox: editForm[key].bbox, page_num: editForm[key].page_num });
                            }
                          }}
                          disabled={isApproved || !canVerify}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Case Summary Panel */}
              {doc?.action_plan?.case_summary && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/80 flex items-center gap-2">
                    <FileText size={16} className="text-gray-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">Case Summary</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="text-sm"><span className="font-semibold text-gray-700">Context:</span> {doc.action_plan.case_summary.context}</div>
                    <div className="text-sm"><span className="font-semibold text-gray-700">Decision:</span> {doc.action_plan.case_summary.decision}</div>
                    <div className="text-sm"><span className="font-semibold text-gray-700">Impact:</span> {doc.action_plan.case_summary.impact}</div>
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded text-sm text-blue-800">
                      <span className="font-semibold">Primary Reason:</span> {doc.action_plan.case_summary.reasoning?.primary_reason}
                    </div>
                  </div>
                </div>
              )}

              {/* Limitation & Deadlines */}
              {doc?.action_plan?.limitation_data && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/80 flex items-center gap-2">
                    <Clock size={16} className="text-gray-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">Limitation & Deadlines</h3>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${
                        doc.action_plan.limitation_data.urgency_status === 'GREEN' ? 'bg-green-100 text-green-800' :
                        doc.action_plan.limitation_data.urgency_status === 'AMBER' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        Urgency: {doc.action_plan.limitation_data.urgency_status}
                      </span>
                      <span className="text-sm font-medium text-gray-600">
                        Deadline: {doc.action_plan.limitation_data.computed_deadline_date}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-100">
                      <span className="font-semibold">Reasoning:</span> {doc.action_plan.limitation_data.reasoning}
                    </div>
                  </div>
                </div>
              )}

              {/* Directives Form */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/80">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">Key Directives / Summary</h3>
                </div>
                <div className="p-4 space-y-4">
                  {directivesForm.map((dir, idx) => (
                    <div key={idx} className="mb-6 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                      <label className="block text-xs font-semibold text-gray-700 mb-2">Directive #{idx + 1} — <span className="text-gray-500 font-normal">Confidence: {dir.confidence_score * 100}%</span></label>
                      <textarea
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm min-h-[60px] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
                        value={dir.summary || ''}
                        onChange={e => {
                          const newDirs = [...directivesForm];
                          newDirs[idx] = { ...newDirs[idx], summary: e.target.value };
                          setDirectivesForm(newDirs);
                        }}
                        onFocus={() => {
                          if (dir.bbox && dir.page_num) {
                            setActiveHighlight({ bbox: dir.bbox, page_num: dir.page_num });
                          }
                        }}
                        disabled={isApproved || !canVerify}
                      />
                      
                      {/* Historical Precedents Sub-section */}
                      {dir.historical_precedents && dir.historical_precedents.length > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center gap-1 mb-2 text-xs font-semibold text-gray-600">
                            <History size={12} />
                            Historical Precedents
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {dir.historical_precedents.map((prec, pIdx) => (
                              <div key={pIdx} className="bg-indigo-50/50 border border-indigo-100 p-2.5 rounded-md">
                                <div className="flex justify-between items-start mb-1">
                                  <span className="text-xs font-bold text-indigo-900">{prec.case_number}</span>
                                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-semibold">Match: {Math.round(prec.similarity_score * 100)}%</span>
                                </div>
                                <div className="text-[11px] text-gray-600 leading-tight mb-1">"{prec.historical_directive}"</div>
                                <div className="text-[11px] font-medium text-green-700 mt-1">Outcome: {prec.outcome}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {activeTab === 'chat' && (
            <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="text-xs font-bold text-gray-700">Chat with NyayaMitra AI</h3>
                <p className="text-[10px] text-gray-500">Ask questions about this specific document</p>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Scale size={16} className="text-[#2563eb]" />
                  </div>
                  <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl rounded-tl-none text-sm max-w-[85%]">
                    Hello! I've analyzed this document. What would you like to know?
                  </div>
                </div>
                
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-gray-800 text-white' : 'bg-blue-100 text-[#2563eb]'}`}>
                      {msg.role === 'user' ? user?.email?.charAt(0).toUpperCase() : <Scale size={16} />}
                    </div>
                    <div className={`px-4 py-2 rounded-2xl text-sm max-w-[85%] whitespace-pre-wrap ${msg.role === 'user' ? 'bg-[#2563eb] text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <Scale size={16} className="text-[#2563eb]" />
                    </div>
                    <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-2xl rounded-tl-none text-sm flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0.1s'}}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              
              <div className="p-3 border-t border-gray-200 bg-white">
                <form onSubmit={handleChat} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Ask about case details, dates, or directives..."
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#2563eb]"
                    disabled={chatLoading}
                  />
                  <button type="submit" disabled={!chatInput.trim() || chatLoading} className="bg-[#2563eb] text-white p-2.5 rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer">
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Actions Bar */}
        <div className="p-4 border-t border-gray-200 bg-white flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="text-sm font-semibold flex items-center gap-2">
            Status: <span className={`px-2 py-1 rounded text-xs ${isApproved ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{doc?.status}</span>
          </div>
          <div className="flex gap-3">
            {canVerify && !isApproved && (
              <>
                <button className="px-4 py-2 border border-gray-300 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors cursor-pointer">
                  <AlertCircle size={16} /> Reject
                </button>
                <button 
                  onClick={handleVerify}
                  disabled={verifying}
                  className="px-6 py-2 bg-green-600 text-white rounded text-sm font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  {verifying ? 'Saving...' : <><CheckCircle size={16} /> Approve & Save</>}
                </button>
              </>
            )}
            {isApproved && (
              <span className="text-sm text-green-700 font-semibold flex items-center gap-1"><CheckCircle size={16}/> Verified</span>
            )}
          </div>
        </div>

      </div>

      {/* Right Panel: PDF Viewer */}
      <div className="w-1/2 bg-gray-200 flex flex-col relative">
        <div className="absolute top-0 right-0 left-0 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-4 py-2 z-10 flex justify-between items-center">
          <div className="text-xs font-mono text-gray-600 font-semibold">Extracted Document Preview</div>
          <div className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded">Confidence Score: <span className="text-green-600">92%</span></div>
        </div>
        {doc?.pdf_path ? (
          <PdfHighlighter 
            pdfUrl={`http://localhost:8000/${doc.pdf_path.replace(/\\/g, '/')}`} 
            activeHighlight={activeHighlight} 
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">PDF not available</div>
        )}
      </div>

    </div>
  );
}
