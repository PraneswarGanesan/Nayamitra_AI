import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('law_officer');
  const [tenantId, setTenantId] = useState('tenant_1');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(email, password, role, tenantId);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white border border-gray-200 rounded-xl p-10 w-full max-w-md">
        <div className="bg-[#1e3a5f] text-white text-center text-xs font-medium tracking-wide py-1.5 px-3 rounded mb-5">
          Government of India • Court Case Monitoring System
        </div>

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#1e3a5f] rounded-xl flex items-center justify-center mx-auto mb-4">
            <Scale size={28} className="text-amber-500" />
          </div>
          <h1 className="text-xl font-bold font-serif">Create Account</h1>
          <p className="text-xs text-gray-500 mt-1">Register for NyayaMitra access</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md px-4 py-3 mb-5 flex items-center gap-2 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
              placeholder="officer@gov.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Password
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Role
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10 bg-white"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="law_officer">Law Officer (Upload & View)</option>
              <option value="reviewer">Reviewer (Verify Plans)</option>
              <option value="admin">Admin (Full Access)</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Department / Tenant ID
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
              placeholder="e.g. tenant_1"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#1e3a5f] text-white font-semibold py-2.5 rounded-md hover:bg-[#2c5282] transition-colors disabled:opacity-50 cursor-pointer"
            disabled={loading}
          >
            {loading ? 'Creating Account…' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-[#1e3a5f] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
