import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
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
          <h1 className="text-xl font-bold font-serif">NyayaMitra</h1>
          <p className="text-xs text-gray-500 mt-1">AI Co-Pilot for Judgment Analysis</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md px-4 py-3 mb-5 flex items-center gap-2 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5" htmlFor="login-email">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
              placeholder="officer@gov.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#1e3a5f] text-white font-semibold py-2.5 rounded-md hover:bg-[#2c5282] transition-colors disabled:opacity-50 cursor-pointer"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-5">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#1e3a5f] font-semibold hover:underline">
            Sign up
          </Link>
        </p>
        
        <p className="text-center text-[10px] text-gray-400 mt-4">
          Authorized personnel only. All actions are logged.
        </p>
      </div>
    </div>
  );
}
