import { Bell, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ title, subtitle }) {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 h-15 flex items-center justify-between sticky top-0 z-40">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2 py-1.5">
          <div className="w-7 h-7 rounded-full bg-[#1e3a5f] flex items-center justify-center">
            <User size={14} className="text-white" />
          </div>
          <div>
            <div className="text-xs font-semibold leading-tight">{user?.email?.split('@')[0] || 'User'}</div>
            <div className="text-[10px] text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
