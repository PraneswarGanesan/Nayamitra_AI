import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Scale, 
  FileText, 
  Activity, 
  ShieldCheck, 
  ArrowRight, 
  BrainCircuit, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Layers, 
  Cpu,
  Lock,
  ExternalLink,
  Target,
  Gavel,
  Sun,
  Moon,
  ChevronRight,
  Shield,
  BarChart3,
  Clock
} from 'lucide-react';

export default function LandingPage() {
  const [isDark, setIsDark] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // High-Performance Dynamic Focus Reveal Logic
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const ratio = entry.intersectionRatio;
        // Faster sharpening: Becomes clear much earlier (at 60% visibility)
        const sharpenFactor = Math.min(1, ratio * 1.6); 
        const blurAmount = Math.max(0, 16 * (1 - sharpenFactor));
        const opacityAmount = Math.min(1, sharpenFactor * 1.1);
        const scaleAmount = 0.97 + (0.03 * sharpenFactor);
        
        entry.target.style.filter = `blur(${blurAmount}px)`;
        entry.target.style.opacity = opacityAmount;
        entry.target.style.transform = `scale(${scaleAmount})`;
        // Add a very small transition to smooth out fast scrolls
        entry.target.style.transition = 'filter 0.3s ease-out, opacity 0.3s ease-out, transform 0.3s ease-out';
      });
    }, { 
      threshold: Array.from({ length: 51 }, (_, i) => i / 50) // Fewer thresholds for better performance with transition
    });

    const elements = document.querySelectorAll('.reveal');
    elements.forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-white text-slate-900'} flex flex-col font-sans selection:bg-blue-500/20 selection:text-blue-800 dark:selection:text-blue-400 transition-colors duration-500 relative scroll-smooth`}>
      
      {/* Ultra-Thin Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-[2px] bg-blue-800 z-[110] transition-all duration-100 ease-out"
        style={{ width: `${(scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100}%` }}
      ></div>

      {/* Multi-Layered Parallax Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Ambient Glows */}
        <div 
          className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-blue-800/[0.03] dark:bg-blue-900/[0.08] blur-[160px] rounded-full transition-transform duration-100 ease-out"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        ></div>
        <div 
          className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-blue-800/[0.03] dark:bg-blue-900/[0.08] blur-[160px] rounded-full transition-transform duration-100 ease-out"
          style={{ transform: `translateY(${scrollY * -0.05}px)` }}
        ></div>
        
        {/* Parallax Icons for filling space */}
        <div 
          className="absolute top-[30%] right-[10%] opacity-[0.03] dark:opacity-[0.06] transition-transform duration-100 ease-out"
          style={{ transform: `translateY(${scrollY * 0.3}px) rotate(${scrollY * 0.02}deg)` }}
        >
          <Scale size={450} className="text-blue-800" />
        </div>
        <div 
          className="absolute top-[60%] left-[5%] opacity-[0.03] dark:opacity-[0.06] transition-transform duration-100 ease-out"
          style={{ transform: `translateY(${scrollY * 0.4}px) rotate(${scrollY * -0.03}deg)` }}
        >
          <Gavel size={380} className="text-blue-800" />
        </div>
        <div 
          className="absolute top-[85%] right-[20%] opacity-[0.03] dark:opacity-[0.06] transition-transform duration-100 ease-out"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        >
          <Shield size={300} className="text-blue-800" />
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex items-center justify-between px-8 py-4 ${scrollY > 20 ? (isDark ? 'bg-black/90' : 'bg-white/95') : (isDark ? 'bg-transparent' : 'bg-white/80')} backdrop-blur-2xl border-b ${isDark ? 'border-white/10' : 'border-slate-200'} sticky top-0 z-[100] transition-all duration-300 w-full`}>
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 bg-blue-800 rounded-xl flex items-center justify-center shadow-lg shadow-blue-800/30 group-hover:scale-110 transition-transform duration-300">
            <Scale size={24} className="text-white" />
          </div>
          <div>
            <h1 className={`text-xl font-black tracking-tighter leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>NyayaMitra</h1>
            <p className="text-[9px] uppercase tracking-[0.2em] text-blue-800 dark:text-blue-400 font-black">AI Judicial Co-Pilot</p>
          </div>
        </div>
        
        <div className={`hidden lg:flex items-center gap-10 px-8 py-2.5 rounded-full border backdrop-blur-md ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100/50 border-slate-200'}`}>
          {['Problem', 'Solution', 'Workflow'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className={`text-[10px] font-black uppercase tracking-widest transition-all relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-blue-800 after:transition-all hover:after:w-full ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-blue-800'}`}>
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsDark(!isDark)}
            className={`p-2.5 rounded-full transition-all border transform active:scale-90 ${isDark ? 'bg-white/10 border-white/20 text-blue-400 hover:bg-white/20' : 'bg-slate-50 border-slate-200 text-yellow-600 hover:bg-slate-100'}`}
            aria-label="Toggle Theme"
          >
            {isDark ? <Moon size={20} className="fill-blue-400" /> : <Sun size={20} className="fill-yellow-500" />}
          </button>
          <Link to={user ? "/app" : "/signup"} className="group flex items-center gap-2 bg-[#1e3a8a] text-white px-6 py-3 rounded-full font-black text-sm hover:bg-[#1e40af] transition-all transform active:scale-95 shadow-lg shadow-blue-800/20">
            {user ? "Go to Dashboard" : "Get Access"} <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center relative z-10 overflow-x-hidden">
        <section className="w-full max-w-7xl mx-auto px-6 pt-24 pb-32 flex flex-col lg:flex-row items-center gap-20">
          <div 
            className="flex-1 text-center lg:text-left space-y-10 animate-fade-in-up transition-all duration-100 ease-out"
            style={{ 
              transform: `translateY(${scrollY * -0.12}px)`,
              opacity: Math.max(0, 1 - scrollY / 700)
            }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-800/10 border border-blue-800/20 text-blue-800 dark:text-blue-400 text-[10px] font-black tracking-[0.2em] uppercase">
              <Zap size={14} className="animate-pulse" />
              <span>Sovereign AI Infrastructure</span>
            </div>
            
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9] mb-4">
              Judgments to <span className="text-blue-800 dark:text-blue-500 drop-shadow-[0_0_15px_rgba(30,64,175,0.2)]">Verified Action.</span>
            </h2>
            
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed font-medium">
              NyayaMitra uses high-precision AI to transform dense judicial judgments into human-verified departmental action plans.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start pt-6">
              <Link to={user ? "/app" : "/login"} className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-blue-800 text-white px-10 py-5 rounded-full font-black text-lg hover:bg-blue-900 hover:shadow-[0_0_30px_rgba(30,64,175,0.4)] transition-all">
                {user ? "Go to Dashboard" : "Enter Dashboard"} <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
          
          <div 
            className="flex-1 relative w-full group transition-all duration-100 ease-out"
            style={{ 
              transform: `translateY(${scrollY * 0.1}px) scale(${1 + scrollY * 0.0002})`,
              opacity: Math.max(0.1, 1 - scrollY / 1000)
            }}
          >
            <div className="absolute -inset-6 bg-blue-800/10 dark:bg-blue-800/20 blur-[80px] rounded-full transition-opacity"></div>
            <div className="relative p-2 bg-white dark:bg-white/5 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-none animate-float overflow-hidden">
              <img 
                src="/assets/hero.png" 
                alt="AI Platform Preview" 
                className="w-full h-auto rounded-[2rem] object-cover opacity-95 dark:opacity-80 group-hover:scale-[1.02] transition-transform duration-700"
              />
            </div>
          </div>
        </section>

        {/* Seamless Section Transition */}
        <div className="w-full h-px bg-slate-200 dark:bg-white/10"></div>

        {/* The Problem Section - Bento Grid */}
        <section id="problem" className="w-full pt-32 pb-24 bg-slate-50 dark:bg-white/[0.02] border-y border-slate-200 dark:border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="reveal text-center mb-24 reveal-delay-100">
              <h3 className="text-blue-800 dark:text-blue-400 font-black uppercase tracking-[0.3em] text-[10px] mb-4">Structural Analysis</h3>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">Eliminating Manual Failure.</h2>
            </div>
            
            <div className="grid md:grid-cols-12 gap-6 h-auto">
              {/* Feature 1 */}
              <div className="reveal md:col-span-8 group relative p-10 bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 hover:border-blue-500/50 transition-all overflow-hidden reveal-delay-200">
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-8">
                    <Clock size={28} />
                  </div>
                  <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Massive Processing Delays</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-xl">
                    A single judgment can occupy a senior officer for 4-6 hours today. NyayaMitra reduces this to under 90 seconds.
                  </p>
                </div>
                <div className="absolute bottom-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Activity size={120} className="text-blue-800" />
                </div>
              </div>
              
              {/* Feature 2 */}
              <div className="reveal md:col-span-4 p-10 bg-blue-800 rounded-3xl text-white shadow-xl shadow-blue-800/20 reveal-delay-300">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
                  <AlertCircle size={28} />
                </div>
                <h4 className="text-2xl font-black mb-4 tracking-tight">Critical Omission Risk</h4>
                <p className="text-blue-50/80 font-medium leading-relaxed">
                  Key directives buried in dense legal text often go unnoticed.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="reveal md:col-span-4 p-10 bg-slate-900 dark:bg-blue-900/40 rounded-3xl border border-slate-800 dark:border-blue-800/20 text-white reveal-delay-400">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8">
                  <Target size={28} />
                </div>
                <h4 className="text-2xl font-black mb-4 tracking-tight">Missed Limitations</h4>
                <p className="text-slate-400 font-medium leading-relaxed">
                  Appeal windows close silently because computation is left to guesswork.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="reveal md:col-span-8 p-10 bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 reveal-delay-500">
                <div className="flex flex-col md:flex-row gap-10 items-center">
                  <div className="flex-1">
                    <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-800 mb-8">
                      <Layers size={28} />
                    </div>
                    <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Institutional Inconsistency</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                      Two officers often reach different conclusions. We provide one truth.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section id="solution" className="w-full py-24 bg-white dark:bg-[#020617] relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-24 items-center">
              <div className="reveal reveal-delay-100">
                <h3 className="text-blue-800 dark:text-blue-400 font-black uppercase tracking-[0.3em] text-[10px] mb-4">The NyayaMitra Standard</h3>
                <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-12">Unwavering Guarantees.</h2>
                <div className="space-y-8">
                  {[
                    { title: "Deterministic Logic", desc: "Deadlines computed by legal rules.", icon: Cpu },
                    { title: "Explainable Traceability", desc: "Linked to specific page coordinates.", icon: ExternalLink },
                    { title: "Audit-Grade Integrity", desc: "RTI-ready cryptographic trail.", icon: Lock }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6 group">
                      <div className="flex-shrink-0 w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-blue-800 dark:text-blue-400 group-hover:bg-blue-800 group-hover:text-white transition-all">
                        <item.icon size={24} />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.title}</h4>
                        <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="reveal relative reveal-delay-300">
                <div className="absolute -inset-10 bg-blue-800/5 blur-[100px] rounded-full"></div>
                <div className="relative p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[3rem] shadow-2xl overflow-hidden transition-transform duration-100 ease-out"
                     style={{ transform: `translateY(${scrollY * 0.05}px)` }}>
                  <img src="/assets/analysis_v2.png" alt="NyayaMitra AI Dashboard" className="rounded-[2.5rem] shadow-inner" />
                </div>
              </div>
            </div>
          </div>
          {/* Blend Gradient to Workflow */}
          <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-b from-transparent to-slate-950 pointer-events-none"></div>
        </section>

        {/* Workflow Section */}
        <section id="workflow" className="w-full py-24 bg-slate-950 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="reveal text-center mb-24 reveal-delay-100">
              <h3 className="text-blue-400 font-black uppercase tracking-[0.3em] text-[10px] mb-4">Core Workflow</h3>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Human-in-the-Loop.</h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
              {[
                { step: "01", icon: Search, title: "Extraction", desc: "Isolates operative portions via OCR." },
                { step: "02", icon: Layers, title: "Mapping", desc: "Generates departmental action plans." },
                { step: "03", icon: Shield, title: "Review", desc: "Mandatory human-in-the-loop audit." },
                { step: "04", icon: BarChart3, title: "Verified", desc: "Trusted data for stakeholders." },
                { step: "05", icon: Cpu, title: "Tech Stack", desc: "React 19, FastAPI, Gemini 1.5, Supabase." }
              ].map((item, i) => (
                <div key={i} className={`reveal reveal-delay-${(i+1)*100} relative p-8 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all text-center md:text-left flex flex-col justify-between`}>
                  <div>
                    <div className="w-14 h-14 bg-blue-800/20 rounded-2xl flex items-center justify-center text-blue-500 mb-8 mx-auto md:mx-0">
                      <item.icon size={28} />
                    </div>
                    <h4 className="text-2xl font-black mb-4 tracking-tight">{item.title}</h4>
                    <p className="text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full py-24 relative">
          <div className="max-w-5xl mx-auto px-6 text-center reveal">
            <div className="p-12 md:p-20 bg-gradient-to-br from-[#1e3a8a] to-[#0f172a] rounded-[3rem] text-white relative overflow-hidden shadow-[0_40px_80px_-20px_rgba(30,58,138,0.3)] transition-all border border-white/5">
              <div className="relative z-10 space-y-12">
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter">Ready to modernize?</h2>
                <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
                  <Link to={user ? "/app" : "/signup"} className="bg-white text-[#1e3a8a] px-10 py-5 rounded-full font-black text-lg hover:bg-slate-100 transition-all shadow-xl shadow-white/10 text-center w-full sm:w-auto">
                    {user ? "Enter Dashboard" : "Get Started Now"}
                  </Link>
                  <Link to="/login" className="bg-white/5 backdrop-blur-md border border-white/10 text-white px-10 py-5 rounded-full font-black text-lg hover:bg-white/10 transition-all text-center w-full sm:w-auto">
                    Institutional Login
                  </Link>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
            </div>
          </div>
        </section>
      </main>
      {/* Footer */}
      <footer className="bg-slate-950 text-slate-500 py-24 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-24">
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-800 rounded-xl flex items-center justify-center shadow-lg shadow-blue-800/20">
                  <Scale size={24} className="text-white" />
                </div>
                <span className="text-3xl font-black text-white tracking-tighter">NyayaMitra</span>
              </div>
              <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
                Empowering the Indian Judiciary with high-precision AI to transform complex judgments into actionable, human-verified departmental plans.
              </p>
              <div className="flex items-center gap-5">
                {['Twitter', 'Github', 'Linkedin'].map((social) => (
                  <a key={social} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-800 hover:text-white transition-all">
                    <span className="sr-only">{social}</span>
                    <div className="w-5 h-5 bg-current opacity-20" /> {/* Placeholder for social icons */}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-black uppercase tracking-[0.2em] text-[11px] mb-8">Platform</h3>
              <ul className="space-y-4 text-sm font-medium">
                {['AI Co-Pilot', 'Audit Trail', 'Case Analysis', 'Security', 'Pricing'].map(item => (
                  <li key={item}><a href="#" className="hover:text-blue-500 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-black uppercase tracking-[0.2em] text-[11px] mb-8">Resources</h3>
              <ul className="space-y-4 text-sm font-medium">
                {['Documentation', 'API Reference', 'GovTech Insights', 'Case Studies', 'Community'].map(item => (
                  <li key={item}><a href="#" className="hover:text-blue-500 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-black uppercase tracking-[0.2em] text-[11px] mb-8">Legal</h3>
              <ul className="space-y-4 text-sm font-medium">
                {['Privacy Policy', 'Terms of Service', 'Security Compliance', 'Ethics Guidelines'].map(item => (
                  <li key={item}><a href="#" className="hover:text-blue-500 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700">
              © {new Date().getFullYear()} NyayaMitra AI • Digital India Initiative
            </div>
            <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
              <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                System Operational
              </span>
              <span>Made with Precision for Bharat</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
