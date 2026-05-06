import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, AlertCircle, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('law_officer');
  const [tenantId, setTenantId] = useState('tenant_1');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(email, password, role, tenantId);
      navigate('/app');
    } catch (err) {
      setError(err.response?.data?.detail || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 font-sans">
      {/* Government Header Strip */}
      <div className="bg-[#1e3a8a] text-white py-2 px-6 flex justify-between items-center shadow-md z-10">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <Scale size={20} className="text-white" />
          <span className="font-bold tracking-wide uppercase text-sm">NyayaMitra Portal</span>
        </Link>
        <div className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
          Government of India
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[500px]">
          
          {/* Main Card */}
          <div className="bg-white border-t-4 border-t-[#1e3a8a] shadow-xl rounded-sm overflow-hidden">
            <div className="p-6 text-center border-b border-gray-100 bg-gray-50">
              <Scale size={42} className="text-[#1e3a8a] mx-auto mb-3" />
              <h1 className="text-xl font-black text-gray-900 tracking-tight uppercase">Central Case Management System</h1>
              <p className="text-xs text-gray-600 font-medium mt-1">Authorized Personnel Registration</p>
            </div>

            <div className="p-8">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-600 text-red-900 p-4 mb-6 flex items-start gap-3 text-sm">
                  <AlertCircle size={18} className="text-red-600 shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Official Email ID
                  </label>
                  <input
                    type="email"
                    className="w-full bg-white border border-gray-300 rounded-sm px-4 py-2 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                    placeholder="officer@gov.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Security Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full bg-white border border-gray-300 rounded-sm px-4 py-2 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1e3a8a]"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      Access Level
                    </label>
                    <select
                      className="w-full bg-white border border-gray-300 rounded-sm px-4 py-2 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] appearance-none"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="law_officer">Officer</option>
                      <option value="reviewer">Reviewer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      Department ID
                    </label>
                    <input
                      type="text"
                      className="w-full bg-white border border-gray-300 rounded-sm px-4 py-2 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                      placeholder="tenant_1"
                      value={tenantId}
                      onChange={(e) => setTenantId(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1e3a8a] text-white font-bold py-3 uppercase tracking-wide text-sm rounded-sm hover:bg-[#152a6a] transition-colors mt-6 flex justify-center items-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>Register Account <ChevronRight size={16} /></>
                  )}
                </button>
              </form>
            </div>
            
            <div className="bg-gray-50 p-4 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-600 font-medium">
                Already authorized?{' '}
                <Link to="/login" className="text-[#1e3a8a] font-bold hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-gray-400">
            <p>Warning: Unauthorized access to this portal is prohibited.</p>
            <p className="mt-1">Version 2026.1</p>
          </div>
        </div>
      </div>
    </div>
  );
}
