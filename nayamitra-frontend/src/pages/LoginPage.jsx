import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, AlertCircle, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/app');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative flex flex-col items-center justify-center p-6 overflow-hidden font-['Inter']">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-100/60 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[440px]">
        {/* Institutional Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-bold uppercase tracking-[0.15em] mb-6 shadow-xl shadow-slate-900/20">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
            Government of India • CCMS Portal
          </div>
          
          <div className="w-20 h-20 bg-white border border-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-transform hover:scale-105 duration-500">
            <Scale size={36} className="text-[#1e3a8a]" />
          </div>
          
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter font-['Noto_Serif'] mb-2">NyayaMitra</h1>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Access the Sovereign Judicial Co-Pilot</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/90 backdrop-blur-3xl border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] rounded-[2.5rem] p-10">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-900 rounded-2xl px-5 py-4 mb-8 flex items-start gap-3 text-sm animate-shake">
              <AlertCircle size={18} className="text-red-500 mt-0.5" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] mb-2.5 ml-1" htmlFor="login-email">
                Official Email
              </label>
              <input
                id="login-email"
                type="email"
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-4 focus:ring-[#1e3a8a]/5 transition-all placeholder:text-slate-300"
                placeholder="officer@gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="relative">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] mb-2.5 ml-1" htmlFor="login-password">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-4 focus:ring-[#1e3a8a]/5 transition-all placeholder:text-slate-300"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1e3a8a] transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="group relative w-full bg-[#1e3a8a] text-white font-black py-4.5 rounded-2xl hover:bg-[#1e40af] transition-all transform active:scale-[0.98] shadow-2xl shadow-blue-800/20 mt-4 overflow-hidden"
              disabled={loading}
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Sign In to Portal
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <p className="text-[13px] text-slate-500 font-medium">
              New to the system?{' '}
              <Link to="/signup" className="text-[#1e3a8a] font-bold hover:underline underline-offset-4">
                Register Account
              </Link>
            </p>
          </div>
        </div>
        
        <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-8 opacity-50">
          Secure Access Protocol • 2026 Release
        </p>
      </div>
    </div>
  );
}
