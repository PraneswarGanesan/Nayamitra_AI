import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Scale, 
  ShieldCheck, 
  ArrowRight, 
  Cpu,
  Lock,
  ExternalLink,
  Target,
  Gavel,
  ChevronRight,
  Shield,
  BarChart3,
  Clock,
  Layers,
  Search,
  AlertCircle
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#1e3a8a]/20 selection:text-[#1e3a8a]">
      {/* Tricolor Accent Line */}
      <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]"></div>

      {/* Official Government Header (Dark) */}
      <nav className="bg-[#0a1128] text-white border-b border-white/10 sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 border border-white/20 rounded-sm flex items-center justify-center bg-white/5 shadow-inner">
              <Scale size={24} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-widest uppercase">NyayaMitra</h1>
              <p className="text-[9px] uppercase tracking-[0.3em] text-slate-400 font-bold">Government of India</p>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-8">
            {['Problem', 'Platform', 'Workflow'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-xs font-bold uppercase tracking-[0.15em] text-slate-300 hover:text-white transition-colors relative group">
                {item}
                <span className="absolute -bottom-4 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link to={user ? "/app" : "/login"} className="bg-blue-600 text-white px-5 py-2 rounded-sm font-bold text-xs uppercase tracking-wider hover:bg-blue-500 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)] flex items-center gap-2">
              {user ? "Access Portal" : "Institutional Login"} <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Dark Hero Section */}
        <section className="bg-[#0a1128] relative overflow-hidden border-b border-slate-800">
          {/* Subtle Cyber Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]"></div>
          
          {/* Subtle Top Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-6 pt-24 pb-32 flex flex-col lg:flex-row items-center gap-16 relative z-10">
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-blue-300 text-[10px] font-black tracking-[0.25em] uppercase rounded-sm shadow-inner">
                <ShieldCheck size={14} />
                <span>Central Case Management System</span>
              </div>
              
              <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.1] font-serif">
                Operationalize <br/>
                <span className="text-blue-400 italic">Judicial Directives.</span>
              </h2>
              
              <p className="text-lg text-slate-400 max-w-xl leading-relaxed font-medium mx-auto lg:mx-0">
                NyayaMitra employs deterministic AI to process dense legal judgments, extracting verifiable and actionable departmental mandates within seconds.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-6">
                <Link to={user ? "/app" : "/signup"} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-sm font-bold text-sm uppercase tracking-wider hover:bg-blue-500 transition-colors shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                  {user ? "Open Dashboard" : "Request Access"} <ArrowRight size={18} />
                </Link>
                <a href="#workflow" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-transparent border border-slate-600 text-slate-300 px-8 py-4 rounded-sm font-bold text-sm uppercase tracking-wider hover:bg-white/5 transition-colors">
                  View Protocol
                </a>
              </div>
            </div>
            
            <div className="flex-1 w-full">
              {/* Premium Mockup Frame */}
              <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-700 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative transform hover:-translate-y-2 transition-transform duration-500">
                <div className="absolute top-0 left-0 w-full h-8 bg-slate-800/50 rounded-t-lg flex items-center px-4 gap-1.5 border-b border-slate-700">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                </div>
                {/* CSS Judicial Intelligence Dashboard Mockup */}
                <div className="w-full mt-6 bg-[#050914] rounded shadow-sm border border-slate-800 p-4 font-mono overflow-hidden">
                  <div className="flex gap-4 mb-4">
                     <div className="flex-1 bg-slate-900 border border-slate-800 p-3 rounded">
                        <div className="text-[8px] text-slate-500 uppercase tracking-widest mb-1">Live Extraction Stream</div>
                        <div className="h-1 w-full bg-slate-800 rounded overflow-hidden"><div className="h-full bg-blue-500 w-[60%] animate-pulse"></div></div>
                     </div>
                     <div className="w-24 bg-slate-900 border border-slate-800 p-3 rounded flex flex-col justify-center items-center">
                        <div className="text-[8px] text-slate-500 uppercase tracking-widest mb-1">Confidence</div>
                        <div className="text-sm font-bold text-green-400">98.4%</div>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="w-1/3 space-y-2">
                        <div className="h-2 w-full bg-slate-800 rounded"></div>
                        <div className="h-2 w-5/6 bg-slate-800 rounded"></div>
                        <div className="h-2 w-4/6 bg-slate-800 rounded"></div>
                        <div className="h-16 w-full mt-4 border border-blue-500/30 bg-blue-500/10 rounded relative">
                           <div className="absolute top-0 left-0 bg-blue-500 text-white text-[6px] px-1 font-bold">OPERATIVE PARAGRAPH</div>
                        </div>
                     </div>
                     <div className="flex-1 space-y-2">
                        <div className="bg-slate-900 border border-slate-800 p-2 rounded flex items-center justify-between">
                           <span className="text-[8px] text-slate-400">ENTITY: APPELLANT</span>
                           <span className="text-[8px] text-white font-bold bg-slate-800 px-1 rounded">STATE OF U.P.</span>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-2 rounded flex items-center justify-between">
                           <span className="text-[8px] text-slate-400">COMPLIANCE RISK</span>
                           <span className="text-[8px] text-red-400 font-bold bg-red-400/10 border border-red-400/20 px-1 rounded">HIGH</span>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-2 rounded flex items-center justify-between">
                           <span className="text-[8px] text-slate-400">DEADLINE COMPUTED</span>
                           <span className="text-[8px] text-amber-400 font-bold bg-amber-400/10 border border-amber-400/20 px-1 rounded">14 DAYS</span>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid: The Problem */}
        <section id="problem" className="py-32 bg-slate-50 relative">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="mb-16 flex flex-col md:flex-row justify-between items-end gap-6">
              <div>
                <h3 className="text-blue-600 font-black uppercase tracking-[0.2em] text-[11px] mb-3">Systemic Inefficiencies</h3>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight font-serif">Eliminating Manual Failure.</h2>
              </div>
              <p className="text-slate-500 max-w-md text-sm font-medium">Legacy compliance tracking relies on subjective human interpretation, leading to cascading institutional risks.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 auto-rows-[280px]">
              {/* Bento Box 1 */}
              <div className="md:col-span-2 bg-white rounded-md border border-slate-200 p-8 shadow-sm flex flex-col justify-between group hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                <div>
                  <div className="w-12 h-12 bg-gradient-to-br from-red-50 to-red-100 border border-red-100 text-red-600 rounded-sm flex items-center justify-center mb-6 shadow-inner">
                    <Clock size={24} />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900 mb-3">Processing Delays</h4>
                  <p className="text-slate-600 font-medium leading-relaxed">A single judgment occupies a senior officer for 4-6 hours. NyayaMitra reduces structural extraction to under 90 seconds, clearing institutional backlogs instantly.</p>
                </div>
              </div>
              
              {/* Bento Box 2 */}
              <div className="bg-[#0a1128] rounded-md border border-[#152452] p-8 shadow-lg text-white flex flex-col justify-between group hover:-translate-y-1 hover:shadow-2xl hover:border-blue-500/50 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[40px]"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 text-white rounded-sm flex items-center justify-center mb-6 shadow-inner">
                    <AlertCircle size={24} />
                  </div>
                  <h4 className="text-xl font-bold mb-3">Omission Risk</h4>
                  <p className="text-blue-100/80 font-medium text-sm leading-relaxed">Critical directives buried in dense legal text often go unnoticed by exhausted personnel.</p>
                </div>
              </div>

              {/* Bento Box 3 */}
              <div className="bg-slate-900 rounded-md border border-slate-800 p-8 shadow-lg text-white flex flex-col justify-between group hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
                <div>
                  <div className="w-12 h-12 bg-white/5 border border-white/10 text-white rounded-sm flex items-center justify-center mb-6 shadow-inner">
                    <Target size={24} />
                  </div>
                  <h4 className="text-xl font-bold mb-3">Missed Limitations</h4>
                  <p className="text-slate-400 font-medium text-sm leading-relaxed">Appeal windows close silently because compliance computation is left to guesswork.</p>
                </div>
              </div>

              {/* Bento Box 4 */}
              <div className="md:col-span-2 bg-white rounded-md border border-slate-200 p-8 shadow-sm flex flex-col justify-between group hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                <div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 text-blue-600 rounded-sm flex items-center justify-center mb-6 shadow-inner">
                    <Gavel size={24} />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900 mb-3">Institutional Inconsistency</h4>
                  <p className="text-slate-600 font-medium leading-relaxed">Two officers often reach different subjective conclusions regarding a court's intent. NyayaMitra provides one objective, deterministic truth.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Architecture */}
        <section id="platform" className="py-32 bg-white border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <h3 className="text-blue-600 font-black uppercase tracking-[0.2em] text-[11px] mb-3">The NyayaMitra Standard</h3>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight font-serif mb-10">Unwavering Guarantees.</h2>
                <div className="space-y-8">
                  {[
                    { title: "Deterministic Logic", desc: "Deadlines computed strictly by established legal parameters.", icon: Cpu },
                    { title: "Explainable Traceability", desc: "Every extracted action is linked to specific page coordinates.", icon: ExternalLink },
                    { title: "Audit-Grade Integrity", desc: "RTI-ready cryptographic trail of all human verifications.", icon: Lock }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6 group">
                      <div className="flex-shrink-0 w-14 h-14 bg-slate-50 border border-slate-200 rounded-sm flex items-center justify-center text-blue-600 shadow-inner group-hover:bg-blue-50 transition-colors">
                        <item.icon size={24} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 mb-1">{item.title}</h4>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                 <div className="absolute inset-0 bg-blue-600/5 translate-x-4 translate-y-4 rounded-md border border-slate-200"></div>
                 <div className="bg-white rounded-md border border-slate-200 p-2 shadow-xl relative z-10">
                    <img src="/assets/hero.png" alt="Architecture" className="w-full rounded-sm border border-slate-100" />
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section id="workflow" className="py-32 bg-[#0a1128] text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-20">
              <h3 className="text-blue-400 font-black uppercase tracking-[0.2em] text-[11px] mb-3">Core Workflow</h3>
              <h2 className="text-4xl font-black tracking-tight font-serif">Human-in-the-Loop Protocol.</h2>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6 relative">
              {/* Connecting Line */}
              <div className="hidden md:block absolute top-[52px] left-[10%] right-[10%] h-[2px] bg-slate-800 z-0"></div>

              {[
                { step: "01", icon: Search, title: "Extraction", desc: "Isolates operative portions via OCR." },
                { step: "02", icon: Layers, title: "Mapping", desc: "Generates departmental plans." },
                { step: "03", icon: Shield, title: "Review", desc: "Mandatory human verification." },
                { step: "04", icon: BarChart3, title: "Execution", desc: "Trusted data distributed to stakeholders." }
              ].map((item, i) => (
                <div key={i} className="relative z-10 pt-8">
                  <div className="w-16 h-16 mx-auto bg-[#0a1128] border-2 border-blue-500/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                    <item.icon size={24} className="text-blue-400" />
                  </div>
                  <div className="text-center p-6 bg-slate-900/50 border border-slate-800 rounded-md backdrop-blur-sm">
                    <div className="text-[10px] font-black text-slate-500 mb-3 tracking-[0.2em]">PHASE {item.step}</div>
                    <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                    <p className="text-slate-400 font-medium text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-gradient-to-b from-blue-600 to-blue-800 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="max-w-3xl mx-auto px-6 space-y-8 relative z-10">
            <Scale size={48} className="mx-auto text-blue-300/50" />
            <h2 className="text-4xl font-black tracking-tight font-serif">Deploy Digital Infrastructure</h2>
            <p className="text-blue-100 font-medium text-lg max-w-xl mx-auto">
              Equip your department with sovereign AI capabilities to streamline judicial compliance.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center pt-6">
              <Link to={user ? "/app" : "/signup"} className="bg-white text-blue-900 px-8 py-4 rounded-sm font-bold text-sm uppercase tracking-wider hover:bg-slate-100 transition-colors shadow-xl w-full sm:w-auto">
                {user ? "Access Dashboard" : "Register Department"}
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#050914] text-slate-500 py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Scale size={20} className="text-slate-600" />
            <span className="font-bold text-slate-400 tracking-wider uppercase text-xs">NyayaMitra AI</span>
          </div>
          <div className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">
            © {new Date().getFullYear()} Government of India • CCMS Initiative
          </div>
        </div>
      </footer>
    </div>
  );
}
