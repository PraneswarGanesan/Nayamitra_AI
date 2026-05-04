import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Upload, FileCheck, Scale, LogOut, Shield } from 'lucide-react';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('nayamitra_user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('nayamitra_token');
    localStorage.removeItem('nayamitra_user');
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/upload', icon: Upload, label: 'Upload Document' },
    { to: '/documents', icon: FileCheck, label: 'Documents' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white flex flex-col shrink-0">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
              <Scale size={20} />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight leading-tight">NyayaMitra</h1>
              <p className="text-xs text-white/50 leading-tight">Court Case Monitoring</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/8'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Info */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
              <Shield size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.email || 'User'}</p>
              <p className="text-xs text-white/40 capitalize">{user.role?.replace('_', ' ') || 'Officer'}</p>
            </div>
            <button onClick={handleLogout} className="text-white/40 hover:text-white transition-colors cursor-pointer">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
