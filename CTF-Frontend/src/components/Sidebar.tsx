import { LayoutDashboard, Trophy, Users, Sword, UserCircle, LogOut, Compass } from 'lucide-react';
import { NavLink } from "react-router-dom";
import { logout } from '../api/auth';


 const handleLogout = async () => {
        await logout();
        window.location.href = '/login';
    };

const navItems = [
  { icon: LayoutDashboard, label: 'DASHBOARD', path: '/dashboard' },
  { icon: Compass, label: 'COMPETITIONS', path: '/competitions' },
  { icon: Users, label: 'TEAMS', path: '/teams' },
  { icon: Sword, label: 'SCOREBOARD', path: '/scoreboard' },
  { icon: Trophy, label: 'LEADERBOARD', path: '/leaderboard' },
  { icon: UserCircle, label: 'PROFILE', path: '/profile' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-pirate-dark border-r border-white/5 h-screen flex flex-col fixed left-0 top-0">
      <div className="p-8 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-pirate-gold flex items-center justify-center">
             <span className="text-black font-bold">⚓</span>
        </div>
        <div className="font-serif text-xl tracking-wider">
          PIRATE<span className="text-pirate-cyan">.CYBER</span>
        </div>
      </div>



      <nav className="flex-1 px-4 mt-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `w-full flex items-center gap-4 px-4 py-3 rounded-md text-sm font-mono tracking-widest transition-all ${
                isActive
                  ? 'bg-white/5 text-pirate-cyan'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-8 border-t border-white/5 space-y-6">
        <div className="space-y-1">
          <div className="text-[10px] uppercase font-mono text-gray-500 tracking-[0.2em]">Logged as</div>
          <div className="w-4 h-0.5 bg-pirate-gold mb-2"></div>
        </div>
        
        <button className="flex items-center gap-4 text-gray-400 hover:text-white text-sm font-mono tracking-widest group">
          <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
          <span onClick={handleLogout}>LOGOUT</span>
        
        </button>
      </div>
    </aside>
  );
}
 
                
