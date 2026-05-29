import { useEffect, useState, useRef, ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Trophy, Flag, Activity, TrendingUp,
  Check, X, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { api } from '../../api/client';
import { messageFromAxiosError } from '../../api/auth';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// ─── Types ─────────────────────────────────────────────────────────────────
interface Stats {
  global: {
    total_users: number;
    active_users: number;
    locked_users: number;
    total_teams: number;
    total_competitions: number;
    active_competitions: number;
    total_challenges: number;
    total_submissions: number;
    correct_submissions: number;
    solve_rate: number;

  };
  users_by_type: Record<string, number>;
  most_solved: { id: number; title: string; points: number; difficulty: string; solved_count: number }[];
  least_solved: {
    category: ReactNode; id: number; title: string; points: number; difficulty: string; solved_count: number 
}[];
  challenges_by_category: Record<string, number>;
  active_competitions: { id: number; title: string; teams: number; max_teams: number | null; ends_at: string; progress: number | null }[];
  recent_submissions: { username: string; challenge: string; is_correct: boolean; created_at: string }[];
  top_competitions: { id: number; title: string; total_score: number; teams: number }[];
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy:   'text-green-400 bg-green-400/10',
  medium: 'text-pirate-gold bg-pirate-gold/10',
  hard:   'text-red-400 bg-red-400/10',
};

// ─── Chart colors ───────────────────────────────────────────────────────────
const ROLE_COLORS   = ['#ff4444', '#ffb703', '#00f2ff'];
const CAT_COLORS    = ['#378ADD', '#534AB7', '#D85A30', '#1D9E75', '#D4537E', '#BA7517'];

export default function AdminDashboard() {
  const [stats, setStats]     = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/admin/stats')
       .then(r => setStats(r.data))
       .catch(err => setError(messageFromAxiosError(err, 'Erreur chargement.')))
       .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-12 min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 font-mono text-pirate-cyan animate-pulse">
          <span className="w-2 h-2 rounded-full bg-pirate-cyan" /> loading stats...
        </div>
      </div>
    );
  }

  const g = stats?.global;

  // ── Cards globales ──────────────────────────────────────────────────────
  const globalCards = [
    { label: 'USERS',        value: g?.total_users ?? 0,        sub: `${g?.locked_users ?? 0} locked`,        icon: Users,    color: 'text-red-400',     bg: 'bg-red-400/10',     border: 'hover:border-red-400/30',     route: '/admin/users'        },
    { label: 'COMPETITIONS', value: g?.total_competitions ?? 0, sub: `${g?.active_competitions ?? 0} active`,  icon: Trophy,   color: 'text-pirate-gold', bg: 'bg-pirate-gold/10', border: 'hover:border-pirate-gold/30', route: '/admin/competitions' },
    { label: 'TEAMS',        value: g?.total_teams ?? 0,        sub: null,                                     icon: Activity, color: 'text-pirate-cyan', bg: 'bg-pirate-cyan/10', border: 'hover:border-pirate-cyan/30', route: '/admin/teams'        },
    { label: 'CHALLENGES',   value: g?.total_challenges ?? 0,   sub: `${g?.solve_rate ?? 0}% solve rate`,      icon: Flag,     color: 'text-purple-400',  bg: 'bg-purple-400/10',  border: 'hover:border-purple-400/30',  route: '/admin/challenges'   },
    { label: 'SUBMISSIONS',  value: g?.total_submissions ?? 0,  sub: `${g?.correct_submissions ?? 0} correct`, icon: Check,    color: 'text-green-400',   bg: 'bg-green-400/10',   border: 'hover:border-green-400/30',   route: null                  },
  ];

  // ── Donut — users par rôle ──────────────────────────────────────────────
  const roleLabels = Object.keys(stats?.users_by_type ?? {});
  const roleValues = Object.values(stats?.users_by_type ?? {});
  const donutData = {
    labels: roleLabels,
    datasets: [{
      data: roleValues,
      backgroundColor: ROLE_COLORS,
      borderWidth: 2,
      borderColor: '#0a1220',
    }]
  };
  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed}` } }
    }
  };

  // ── Bar — challenges par catégorie ─────────────────────────────────────
  const catLabels = Object.keys(stats?.challenges_by_category ?? {});
  const catValues = Object.values(stats?.challenges_by_category ?? {});
  const barData = {
    labels: catLabels,
    datasets: [{
      data: catValues,
      backgroundColor: CAT_COLORS.slice(0, catLabels.length),
      borderWidth: 0,
      borderRadius: 4,
    }]
  };
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        ticks: { color: '#6b7280', font: { size: 11 } },
        grid: { display: false }
      },
      y: {
        ticks: { color: '#6b7280', font: { size: 11 }, stepSize: 1 },
        grid: { color: 'rgba(255,255,255,0.05)' },
        beginAtZero: true,
      }
    }
  };

  return (
    <div className="p-12 min-h-screen">

      {/* Header */}
      <header className="mb-10">
        <div className="font-mono text-xs text-red-400 tracking-[0.3em] mb-3">// COMMAND CENTER</div>
        <h1 className="font-serif text-5xl text-white italic mb-2">Admin Dashboard</h1>
        <p className="text-gray-400 font-sans text-sm">Full control over the ship.</p>
      </header>

      {error && <p className="font-mono text-red-400 text-xs mb-6">{error}</p>}

      {/* ── 1. Stats cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {globalCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => card.route && navigate(card.route)}
            className={`bg-[#111a2e]/40 border border-white/5 rounded-xl p-5 transition-all ${card.route ? `cursor-pointer ${card.border}` : ''}`}
          >
            <div className={`w-9 h-9 rounded-lg ${card.bg} ${card.color} flex items-center justify-center mb-3`}>
              <card.icon size={18} />
            </div>
            <div className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-1">{card.label}</div>
            <div className="text-2xl font-medium text-white mb-1">{card.value}</div>
            {card.sub && (
              <div className={`font-mono text-[10px] flex items-center gap-1 ${card.color}`}>
                <TrendingUp size={9} /> {card.sub}
              </div>
            )}
          </motion.div>
        ))}
      </div>

{/* ── 2. Graphiques — Top Competitions + Least Solved ── */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

  {/* Bar — Compétitions avec le plus grand score */}
  <div className="bg-[#111a2e]/40 border border-white/5 rounded-2xl p-6">
    <h2 className="font-serif text-xl text-white mb-1">Top Competitions by Score</h2>
    <p className="font-mono text-[10px] text-gray-500 mb-4 tracking-widest">Total score earned by all teams</p>
    <div className="relative h-52">
      {(stats?.top_competitions?.length ?? 0) > 0 ? (
        <Bar
          data={{
            labels: stats!.top_competitions.map(c => c.title.length > 12 ? c.title.slice(0, 12) + '…' : c.title),
            datasets: [{
              data: stats!.top_competitions.map(c => c.total_score),
              backgroundColor: CAT_COLORS,
              borderWidth: 0,
              borderRadius: 4,
            }]
          }}
          options={barOptions}
        />
      ) : (
        <p className="font-mono text-xs text-gray-500">No data yet.</p>
      )}
    </div>
    {/* Légende */}
    <div className="flex flex-wrap gap-3 mt-4">
      {stats?.top_competitions?.map((c, i) => (
        <span key={c.id} className="flex items-center gap-1.5 font-mono text-[10px] text-gray-400">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: CAT_COLORS[i % CAT_COLORS.length], display: 'inline-block' }} />
          {c.title} — {c.total_score} pts
        </span>
      ))}
    </div>
  </div>

  {/* Bar — Challenges les moins résolus */}
  <div className="bg-[#111a2e]/40 border border-white/5 rounded-2xl p-6">
    <h2 className="font-serif text-xl text-white mb-1">Hardest Challenges</h2>
    <p className="font-mono text-[10px] text-gray-500 mb-4 tracking-widest">Least solved across all competitions</p>
    <div className="space-y-3">
      {(stats?.least_solved?.length ?? 0) === 0 && (
        <p className="font-mono text-xs text-gray-500">No data yet.</p>
      )}
      {stats?.least_solved?.map((ch, i) => (
        <div key={ch.id} className="flex items-center gap-3">
          <span className="font-mono text-xs text-gray-600 w-4">#{i + 1}</span>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-xs text-white truncate">{ch.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${DIFFICULTY_COLORS[ch.difficulty] ?? 'text-gray-400 bg-white/5'}`}>
                {ch.difficulty}
              </span>
              <span className="font-mono text-[9px] text-pirate-cyan">{ch.category}</span>
              <span className="font-mono text-[9px] text-pirate-gold">{ch.points} pts</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-16 bg-white/5 rounded-full h-1.5">
              <div
                className="bg-red-400/50 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, ch.solved_count * 10)}%` }}
              />
            </div>
            <span className="font-mono text-[10px] text-red-400 w-4 text-right">
              {ch.solved_count}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

      
      </div>

  
  );
}