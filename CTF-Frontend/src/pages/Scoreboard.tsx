import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Users, Trophy, X, Loader2 } from 'lucide-react';
import { api } from '../api/client';
import { useLocation } from 'react-router-dom';
import { messageFromAxiosError } from '../api/auth';

interface Team {
  id: number;
  name: string;
  score: number;
  avatar?: string;
  leader?: { username: string; country?: string };
  members?: any[];
  competition?: { title: string };
  members_count?: number;
}

const POSITION_STYLE: Record<number, string> = {
  1: 'text-pirate-gold',
  2: 'text-gray-300',
  3: 'text-orange-400/80',
};

export default function Scoreboard() {
  const [teams, setTeams]     = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [selected, setSelected] = useState<Team | null>(null);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    api.get('/scoreboard')
      .then(r => {
        const data = r.data.scoreboard ?? r.data.data ?? r.data;
        setTeams(data);
      })
      .catch(err => setError(messageFromAxiosError(err, 'Erreur chargement.')))
      .finally(() => setLoading(false));
  }, []);

  const openTeam = async (team: Team) => {
    setSelected(team);
    setLoadingTeam(true);
    try {
      const { data } = await api.get('/teams/' + team.id);
      setSelected(data);
    } finally {
      setLoadingTeam(false);
    }
  };

  const top3 = teams.slice(0, 3);
  const rest  = teams.slice(3);

  return (
    <div className={`flex-1 ${isAdmin ? '' : 'ml-64'} p-12 min-h-screen bg-pirate-dark overflow-y-auto`}>

      <header className="mb-12">
        <div className="font-mono text-xs text-pirate-cyan tracking-[0.3em] mb-4">// CREW RANKINGS</div>
        <h1 className="font-serif text-5xl text-pirate-gold mb-6 italic">Scoreboard</h1>
        <p className="text-gray-400 max-w-2xl font-sans leading-relaxed">
          The most feared crews of the digital ocean, ranked by total plunder.
        </p>
      </header>

      {loading && (
        <div className="flex items-center gap-3 font-mono text-pirate-cyan animate-pulse">
          <span className="w-2 h-2 rounded-full bg-pirate-cyan" /> loading crews...
        </div>
      )}
      {error && <p className="font-mono text-red-400 text-sm">{error}</p>}

      {!loading && !error && (
        <>
          {/* Top 3 podium */}
          {top3.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-12">
              {[top3[1], top3[0], top3[2]].filter(Boolean).map((team, idx) => {
                const realPos = team === top3[0] ? 1 : team === top3[1] ? 2 : 3;
                const heights: Record<1|2|3, string> = { 1: 'pt-0', 2: 'pt-6', 3: 'pt-10' };
                return (
                  <motion.div
                    key={team.id}
                    onClick={() => openTeam(team)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`flex flex-col items-center cursor-pointer ${heights[realPos as 1|2|3]}`}
                  >
                    {realPos === 1 && <Crown size={24} className="text-pirate-gold mb-2" />}

                    <div className={`w-16 h-16 rounded-full border-2 overflow-hidden flex items-center justify-center mb-3 hover:scale-105 transition-transform ${
                      realPos === 1 ? 'border-pirate-gold bg-pirate-gold/10' :
                      realPos === 2 ? 'border-gray-300 bg-white/5' :
                      'border-orange-400/60 bg-orange-400/5'
                    }`}>
                      {team.avatar
                        ? <img src={team.avatar} alt={team.name} className="w-full h-full object-cover" />
                        : <span className="font-serif text-2xl text-pirate-gold/60 uppercase">{team.name?.[0]}</span>
                      }
                    </div>

                    <div className={`font-mono text-2xl font-bold mb-1 ${POSITION_STYLE[realPos]}`}>#{realPos}</div>
                    <p className="font-mono text-sm text-white text-center truncate w-full px-2">{team.name}</p>
                    <p className={`font-mono text-xs mt-1 ${POSITION_STYLE[realPos]}`}>{team.score} pts</p>
                    <span className="mt-2 text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border text-pirate-cyan border-pirate-cyan/30 bg-pirate-cyan/10">
                      {team.members_count ?? 0} membres
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Reste du classement */}
          <div className="bg-[#111a2e]/40 border border-white/5 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 px-6 py-3 bg-pirate-cyan/5 border-b border-white/5">
              {['#', 'ÉQUIPE', 'LEADER', 'COMPÉTITION', 'MEMBRES', 'SCORE'].map((h, i) => (
                <div key={h} className={`font-mono text-[10px] text-pirate-cyan uppercase tracking-widest ${
                  i === 0 ? 'col-span-1' : i === 1 ? 'col-span-3' : i === 2 ? 'col-span-2' :
                  i === 3 ? 'col-span-3' : i === 4 ? 'col-span-1' : 'col-span-2 text-right'
                }`}>{h}</div>
              ))}
            </div>

            <div className="divide-y divide-white/5">
              {rest.map((team, i) => (
                <motion.div
                  key={team.id}
                  onClick={() => openTeam(team)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="grid grid-cols-12 px-6 py-4 items-center hover:bg-white/5 transition-all cursor-pointer"
                >
                  <div className="col-span-1 font-mono text-sm text-gray-500">#{i + 4}</div>
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-pirate-gold/10 border border-pirate-gold/20 flex items-center justify-center shrink-0">
                      <span className="font-mono text-xs text-pirate-gold/60 uppercase">{team.name?.[0]}</span>
                    </div>
                    <span className="font-mono text-sm text-white truncate">{team.name}</span>
                  </div>
                  <div className="col-span-2 font-mono text-xs text-pirate-cyan">
                    {team.leader?.username ?? '-'}
                  </div>
                  <div className="col-span-3 font-mono text-xs text-gray-400 truncate">
                    {team.competition?.title ?? 'Aucune'}
                  </div>
                  <div className="col-span-1 font-mono text-xs text-gray-400 flex items-center gap-1">
                    <Users size={11} className="text-pirate-cyan" /> {team.members_count ?? 0}
                  </div>
                  <div className="col-span-2 text-right font-mono text-sm text-pirate-gold font-bold">
                    {team.score} pts
                  </div>
                </motion.div>
              ))}
              {teams.length === 0 && (
                <div className="py-12 text-center font-mono text-sm text-gray-500">
                  No crews yet in these waters.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal détail équipe */}
      <AnimatePresence>
        {selected && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0d1526] border border-white/10 rounded-2xl p-8 w-full max-w-md max-h-[85vh] overflow-y-auto"
            >
              {loadingTeam ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-pirate-gold animate-spin" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full border-2 border-pirate-gold/30 bg-pirate-gold/10 flex items-center justify-center shrink-0">
                      <span className="font-serif text-2xl text-pirate-gold/60 uppercase">{selected.name?.[0]}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-2xl text-white">{selected.name}</h3>
                      <p className="font-mono text-xs text-pirate-cyan mt-1">
                        Leader: {selected.leader?.username ?? '-'}
                      </p>
                    </div>
                    <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white transition-colors">
                      <X size={18} />
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-pirate-gold/5 border border-pirate-gold/10 rounded-xl p-3 text-center">
                      <div className="font-mono text-xl text-pirate-gold">{selected.score}</div>
                      <div className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">pts</div>
                    </div>
                    <div className="bg-pirate-cyan/5 border border-pirate-cyan/10 rounded-xl p-3 text-center">
                      <div className="font-mono text-xl text-pirate-cyan">{selected.members?.length ?? 0}</div>
                      <div className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">membres</div>
                    </div>
                  </div>

                  {/* Competition */}
                  {selected.competition && (
                    <div className="mb-6 p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
                      <Trophy size={16} className="text-pirate-gold" />
                      <span className="font-mono text-sm text-white">{selected.competition.title}</span>
                    </div>
                  )}

                  {/* Membres */}
                  {selected.members && selected.members.length > 0 && (
                    <div>
                      <p className="font-mono text-[10px] text-pirate-cyan tracking-widest uppercase mb-3">
                        Membres ({selected.members.length})
                      </p>
                      <div className="space-y-2">
                        {selected.members.map((m: any) => (
                          <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/3 border border-white/5">
                            <div className="w-8 h-8 rounded-full bg-pirate-gold/10 border border-pirate-gold/20 flex items-center justify-center shrink-0">
                              <span className="font-mono text-xs text-pirate-gold/60 uppercase">{m.username?.[0]}</span>
                            </div>
                            <div className="flex-1">
                              <p className="font-mono text-xs text-white">{m.username}</p>
                              <p className="font-mono text-[10px] text-gray-500">{m.score} pts</p>
                            </div>
                            <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded border ${
                              m.pivot?.role === 'leader'
                                ? 'text-pirate-gold border-pirate-gold/30 bg-pirate-gold/10'
                                : 'text-pirate-cyan border-pirate-cyan/30 bg-pirate-cyan/10'
                            }`}>
                              {m.pivot?.role ?? 'member'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}