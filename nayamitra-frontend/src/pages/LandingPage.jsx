import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Scale, 
  Activity, 
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
      {/* Official Government Header */}
      <nav className="bg-[#1e3a8a] text-white border-b border-[#152a6a] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 border border-white/20 rounded-sm flex items-center justify-center bg-white/5">
              <Scale size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wide uppercase">NyayaMitra</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-blue-200 font-bold">Government of India</p>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-8">
            {['Problem', 'Platform', 'Workflow'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-xs font-bold uppercase tracking-widest text-blue-100 hover:text-white transition-colors relative after:content-[''] after:absolute after:-bottom-3 after:left-0 after:w-0 after:h-1 after:bg-white after:transition-all hover:after:w-full">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link to={user ? "/app" : "/login"} className="bg-white text-[#1e3a8a] px-5 py-2 rounded-sm font-bold text-xs uppercase tracking-wider hover:bg-gray-100 transition-colors shadow-sm flex items-center gap-2">
              {user ? "Access Portal" : "Institutional Login"} <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Structured Hero Section */}
        <section className="bg-white border-b border-gray-200 relative overflow-hidden">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          
          <div className="max-w-7xl mx-auto px-6 pt-24 pb-24 flex flex-col lg:flex-row items-center gap-16 relative z-10">
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-black tracking-[0.2em] uppercase rounded-sm">
                <ShieldCheck size={14} className="text-[#1e3a8a]" />
                <span>Central Case Management System</span>
              </div>
              
              <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[1.1]">
                Operationalize <br/>
                <span className="text-[#1e3a8a]">Judicial Directives.</span>
              </h2>
              
              <p className="text-lg text-slate-600 max-w-xl leading-relaxed font-medium mx-auto lg:mx-0">
                NyayaMitra employs deterministic AI to process dense legal judgments, extracting verifiable and actionable departmental mandates within seconds.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
                <Link to={user ? "/app" : "/signup"} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1e3a8a] text-white px-8 py-4 rounded-sm font-bold text-sm uppercase tracking-wide hover:bg-[#152a6a] transition-colors shadow-lg">
                  {user ? "Open Dashboard" : "Request Access"} <ArrowRight size={18} />
                </Link>
                <a href="#workflow" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 px-8 py-4 rounded-sm font-bold text-sm uppercase tracking-wide hover:bg-slate-50 transition-colors">
                  View Protocol
                </a>
              </div>
            </div>
            
            <div className="flex-1 w-full">
              {/* Premium Mockup Frame */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-2xl relative">
                <div className="absolute top-0 left-0 w-full h-8 bg-slate-200/50 rounded-t-lg flex items-center px-4 gap-1.5 border-b border-slate-200">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                </div>
                <img 
                  src="/assets/analysis_v2.png" 
                  alt="Platform Dashboard" 
                  className="w-full h-auto mt-6 rounded shadow-sm border border-slate-200 object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid: The Problem */}
        <section id="problem" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16">
              <h3 className="text-[#1e3a8a] font-black uppercase tracking-[0.2em] text-[11px] mb-2">Systemic Inefficiencies</h3>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Eliminating Manual Failure.</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 auto-rows-[280px]">
              {/* Bento Box 1 */}
              <div className="md:col-span-2 bg-white rounded-lg border border-slate-200 p-8 shadow-sm flex flex-col justify-between group hover:border-[#1e3a8a]/30 transition-colors">
                <div>
                  <div className="w-12 h-12 bg-red-50 text-red-600 rounded-sm flex items-center justify-center mb-6">
                    <Clock size={24} />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900 mb-3">Processing Delays</h4>
                  <p className="text-slate-600 font-medium">A single judgment occupies a senior officer for 4-6 hours. NyayaMitra reduces structural extraction to under 90 seconds, clearing institutional backlogs.</p>
                </div>
              </div>
              
              {/* Bento Box 2 */}
              <div className="bg-[#1e3a8a] rounded-lg p-8 shadow-sm text-white flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-white/10 text-white rounded-sm flex items-center justify-center mb-6">
                    <AlertCircle size={24} />
                  </div>
                  <h4 className="text-xl font-bold mb-3">Omission Risk</h4>
                  <p className="text-blue-100 font-medium text-sm">Critical directives buried in dense legal text often go unnoticed by exhausted personnel.</p>
                </div>
              </div>

              {/* Bento Box 3 */}
              <div className="bg-slate-900 rounded-lg p-8 shadow-sm text-white flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-white/10 text-white rounded-sm flex items-center justify-center mb-6">
                    <Target size={24} />
                  </div>
                  <h4 className="text-xl font-bold mb-3">Missed Limitations</h4>
                  <p className="text-slate-400 font-medium text-sm">Appeal windows close silently because compliance computation is left to guesswork.</p>
                </div>
              </div>

              {/* Bento Box 4 */}
              <div className="md:col-span-2 bg-white rounded-lg border border-slate-200 p-8 shadow-sm flex flex-col justify-between group hover:border-[#1e3a8a]/30 transition-colors">
                <div>
                  <div className="w-12 h-12 bg-blue-50 text-[#1e3a8a] rounded-sm flex items-center justify-center mb-6">
                    <Gavel size={24} />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900 mb-3">Institutional Inconsistency</h4>
                  <p className="text-slate-600 font-medium">Two officers often reach different subjective conclusions regarding a court's intent. NyayaMitra provides one objective, deterministic truth.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Architecture */}
        <section id="platform" className="py-24 bg-white border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h3 className="text-[#1e3a8a] font-black uppercase tracking-[0.2em] text-[11px] mb-2">The NyayaMitra Standard</h3>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-10">Unwavering Guarantees.</h2>
                <div className="space-y-6">
                  {[
                    { title: "Deterministic Logic", desc: "Deadlines computed strictly by established legal parameters.", icon: Cpu },
                    { title: "Explainable Traceability", desc: "Every extracted action is linked to specific page coordinates.", icon: ExternalLink },
                    { title: "Audit-Grade Integrity", desc: "RTI-ready cryptographic trail of all human verifications.", icon: Lock }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-5">
                      <div className="flex-shrink-0 w-12 h-12 bg-slate-100 border border-slate-200 rounded-sm flex items-center justify-center text-[#1e3a8a]">
                        <item.icon size={20} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">{item.title}</h4>
                        <p className="text-slate-600 font-medium text-sm mt-1">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-100 rounded-lg border border-slate-200 p-2 shadow-inner">
                 <img src="/assets/hero.png" alt="Architecture" className="w-full rounded border border-slate-200 shadow-sm" />
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section id="workflow" className="py-24 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16">
              <h3 className="text-blue-400 font-black uppercase tracking-[0.2em] text-[11px] mb-2">Core Workflow</h3>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">Human-in-the-Loop Protocol.</h2>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { step: "01", icon: Search, title: "Extraction", desc: "Isolates operative portions via OCR." },
                { step: "02", icon: Layers, title: "Mapping", desc: "Generates departmental plans." },
                { step: "03", icon: Shield, title: "Review", desc: "Mandatory human verification." },
                { step: "04", icon: BarChart3, title: "Execution", desc: "Trusted data distributed to stakeholders." }
              ].map((item, i) => (
                <div key={i} className="p-6 bg-slate-800 border border-slate-700 rounded-sm">
                  <div className="text-xs font-black text-slate-500 mb-4 tracking-widest">STEP {item.step}</div>
                  <item.icon size={28} className="text-blue-400 mb-4" />
                  <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                  <p className="text-slate-400 font-medium text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-[#1e3a8a] text-white text-center">
          <div className="max-w-3xl mx-auto px-6 space-y-8">
            <Scale size={48} className="mx-auto text-blue-300 opacity-50" />
            <h2 className="text-4xl font-black tracking-tight">Deploy Digital Infrastructure</h2>
            <p className="text-blue-100 font-medium text-lg max-w-xl mx-auto">
              Equip your department with sovereign AI capabilities to streamline judicial compliance.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center pt-4">
              <Link to={user ? "/app" : "/signup"} className="bg-white text-[#1e3a8a] px-8 py-4 rounded-sm font-bold text-sm uppercase tracking-wide hover:bg-slate-100 transition-colors shadow-lg w-full sm:w-auto">
                {user ? "Access Dashboard" : "Register Department"}
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-500 py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Scale size={20} className="text-slate-600" />
            <span className="font-bold text-slate-400 tracking-wide uppercase text-sm">NyayaMitra AI</span>
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} Government of India • CCMS Initiative
          </div>
        </div>
      </footer>
    </div>
  );
}
