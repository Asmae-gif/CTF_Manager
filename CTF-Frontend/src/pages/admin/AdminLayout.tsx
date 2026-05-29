import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Trophy, Flag,
  Settings, LogOut, ShieldAlert, Tags, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin/dashboard',    icon: LayoutDashboard, label: 'DASHBOARD'    },
  { to: '/admin/users',        icon: Users,           label: 'USERS'        },
  { to: '/admin/competitions', icon: Trophy,          label: 'COMPETITIONS' },
  { to: '/admin/challenges',   icon: Flag,            label: 'CHALLENGES'   },
  { to: '/admin/categories',   icon: Tags,            label: 'CATEGORIES'   },
  { to: '/admin/teams',        icon: ShieldCheck,     label: 'TEAMS'        },
  { to: '/admin/leaderboard',  icon: ShieldAlert,     label: 'LEADERBOARD'  },
  { to: '/admin/scoreboard', icon: Trophy, label: 'SCOREBOARD' },
  {to: '/admin/profile', icon: Settings, label: 'PROFILE'},
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    
    <div className="flex h-screen bg-pirate-dark overflow-hidden">

      {/* Sidebar Admin — même style que participant */}
      <aside className="w-64 bg-pirate-dark border-r border-white/5 h-screen flex flex-col fixed left-0 top-0 z-50">
        {/* Logo */}
        <div className="p-8 flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded bg-pirate-gold flex items-center justify-center">
            <ShieldAlert size={16} className="text-black" />
          </div>
          <div className="font-serif text-xl tracking-wider">
            ADMIN<span className="text-pirate-cyan">.CYBER</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 mt-4 space-y-2 overflow-y-auto bg-pirate-dark border-r border-white/5 min-h-0">
    {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `w-full flex items-center gap-4 px-4 py-3 rounded-md text-sm font-mono tracking-widest transition-all ${
                  isActive
                    ? 'bg-white/5 text-pirate-cyan'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-8 border-t border-white/5 space-y-6">
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-mono text-gray-500 tracking-[0.2em]">Logged as</div>
            <div className="w-4 h-0.5 bg-pirate-gold mb-2"></div>
            <p className="font-mono text-xs text-pirate-cyan truncate">{user?.username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 text-gray-400 hover:text-white text-sm font-mono tracking-widest group"
          >
            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
            LOGOUT
          </button>
        </div>
      </aside>

      {/* Content */}
      
      <main className="flex-1 ml-64 h-screen overflow-x-hidden overflow-y-auto">
  <Outlet />
</main>
    </div>
  );
}