import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Upload, CheckSquare, LogOut, Scale, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { path: '/app', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/app/documents', label: 'Documents', icon: FileText },
  { path: '/app/upload', label: 'Upload Judgment', icon: Upload },
  { path: '/app/actions', label: 'Action Plans', icon: FileText },
  { path: '/app/activity', label: 'Audit Trail', icon: Activity },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <div className="w-64 bg-[#111827] text-white flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 mb-2">
        <h1 className="text-2xl font-bold flex items-center gap-2 tracking-tight">
          <Scale size={26} className="text-blue-500" /> NyayaMitra
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-[#2563eb] text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon size={18} />
                {item.label}
              </div>
              {item.badge && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
            <span className="text-sm font-bold">{user?.email?.charAt(0).toUpperCase()}</span>
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-semibold truncate">{user?.email}</div>
            <div className="text-xs text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</div>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            window.location.href = '/';
          }}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
}
