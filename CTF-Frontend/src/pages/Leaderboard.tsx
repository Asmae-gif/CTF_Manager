import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {  Crown, Star, Globe, Loader2, X } from 'lucide-react';
import { api } from '../api/client';
import { useLocation } from 'react-router-dom';
import { messageFromAxiosError } from '../api/auth';

interface LeaderboardUser {
  id: number;
  username: string;
  avatar?: string;
  country?: string;
  score: number;
  rank: string;
  type: string;
  badges: any[];
}

const RANK_COLORS: Record<string, string> = {
  Elite:        'text-pirate-gold border-pirate-gold/30 bg-pirate-gold/10',
  Expert:       'text-purple-400 border-purple-400/30 bg-purple-400/10',
  Intermediate: 'text-pirate-cyan border-pirate-cyan/30 bg-pirate-cyan/10',
  Beginner:     'text-gray-400 border-white/10 bg-white/5',
};

const POSITION_STYLE: Record<number, string> = {
  1: 'text-pirate-gold',
  2: 'text-gray-300',
  3: 'text-orange-400/80',
};

export default function Leaderboard() {
  const [users, setUsers]             = useState<LeaderboardUser[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  // ✅ Modal states
  const [selectedId, setSelectedId]       = useState<number | null>(null);
  const [publicProfile, setPublicProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    api.get('/leaderboard')
       .then(r => setUsers(r.data.data ?? r.data))
       .catch(err => setError(messageFromAxiosError(err, 'Erreur chargement.')))
       .finally(() => setLoading(false));
  }, []);

  // ✅ Ouvrir modal
  const openProfile = async (id: number) => {
    setSelectedId(id);
    setLoadingProfile(true);
    setPublicProfile(null);
    try {
      const { data } = await api.get(`/users/${id}`);
      setPublicProfile(data);
    } finally {
      setLoadingProfile(false);
    }
  };

  const closeModal = () => {
    setSelectedId(null);
    setPublicProfile(null);
  };

  const top3 = users.slice(0, 3);
  const rest  = users.slice(3);

  return (
    <div className={`flex-1 ${isAdmin ? '' : 'ml-64'} p-12 min-h-screen bg-pirate-dark overflow-y-auto`}>

      <header className="mb-12">
        <div className="font-mono text-xs text-pirate-cyan tracking-[0.3em] mb-4">// HALL OF FAME</div>
        <h1 className="font-serif text-5xl text-pirate-gold mb-6 italic">Leaderboard</h1>
        <p className="text-gray-400 max-w-2xl font-sans leading-relaxed">
          The greatest pirates of the ocean, ranked by their total plunder.
        </p>
      </header>

      {loading && (
        <div className="flex items-center gap-3 font-mono text-pirate-cyan animate-pulse">
          <span className="w-2 h-2 rounded-full bg-pirate-cyan" /> loading pirates...
        </div>
      )}
      {error && <p className="font-mono text-red-400 text-sm">{error}</p>}

      {!loading && !error && (
        <>
          {/* ── Top 3 podium ── */}
          {top3.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-12">
              {[top3[1], top3[0], top3[2]].filter(Boolean).map((u, idx) => {
                const realPos = u === top3[0] ? 1 : u === top3[1] ? 2 : 3;
                const heights: Record<1|2|3, string> = { 1: 'pt-0', 2: 'pt-6', 3: 'pt-10' };
                return (
                  <motion.div
                    key={u.id}
                    onClick={() => openProfile(u.id)}
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
                      {u?.avatar
                        ? <img src={u.avatar} alt={u.username} className="w-full h-full object-cover" />
                           : <span className="font-serif text-3xl text-pirate-gold/60 uppercase">{u.username?.[0]}</span>
                      }
                    </div>

                    <div className={`font-mono text-2xl font-bold mb-1 ${POSITION_STYLE[realPos]}`}>#{realPos}</div>
                    <p className="font-mono text-sm text-white text-center truncate w-full px-2">{u.username}</p>
                    <p className={`font-mono text-xs mt-1 ${POSITION_STYLE[realPos]}`}>{u.score} pts</p>
                    <span className={`mt-2 text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${RANK_COLORS[u.rank] ?? RANK_COLORS.Beginner}`}>
                      {u.rank}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* ── Reste du classement ── */}
          <div className="bg-[#111a2e]/40 border border-white/5 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 px-6 py-3 bg-pirate-cyan/5 border-b border-white/5">
              {['#', 'PIRATE', 'COUNTRY', 'RANK', 'BADGES', 'SCORE'].map((h, i) => (
                <div key={h} className={`font-mono text-[10px] text-pirate-cyan uppercase tracking-widest ${
                  i === 0 ? 'col-span-1' : i === 1 ? 'col-span-4' : i === 2 ? 'col-span-2' :
                  i === 3 ? 'col-span-2' : i === 4 ? 'col-span-1' : 'col-span-2 text-right'
                }`}>{h}</div>
              ))}
            </div>

            <div className="divide-y divide-white/5">
              {rest.map((u, i) => (
                <motion.div
                  key={u.id}
                  onClick={() => openProfile(u.id)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="grid grid-cols-12 px-6 py-4 items-center hover:bg-white/5 transition-all cursor-pointer"
                >
                  <div className="col-span-1 font-mono text-sm text-gray-500">#{i + 4}</div>
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-pirate-gold/10 border border-pirate-gold/20 overflow-hidden flex items-center justify-center shrink-0">
                      {
                         <span className="font-mono text-xs text-pirate-gold/60 uppercase">{u.username?.[0]}</span>
                      }
                    </div>

                     
                    <span className="font-mono text-sm text-white truncate">{u.username}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5 font-mono text-xs text-gray-400">
                    {u.country ? <><Globe size={11} className="text-pirate-cyan" /> {u.country}</> : '—'}
                  </div>
                  <div className="col-span-2">
                    <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${RANK_COLORS[u.rank] ?? RANK_COLORS.Beginner}`}>
                      {u.rank}
                    </span>
                  </div>
                  <div className="col-span-1 font-mono text-xs text-gray-400 flex items-center gap-1">
                    <Star size={11} className="text-pirate-gold" /> {u.badges?.length ?? 0}
                  </div>
                  <div className="col-span-2 text-right font-mono text-sm text-pirate-gold font-bold">
                    {u.score} pts
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ✅ Modal profil public — dans le même fichier */}
      <AnimatePresence>
        {selectedId && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0d1526] border border-white/10 rounded-2xl p-8 w-full max-w-md max-h-[85vh] overflow-y-auto"
            >
              {loadingProfile ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-pirate-gold animate-spin" />
                </div>
              ) : publicProfile && (
                <>
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full border-2 border-pirate-gold/30 bg-pirate-gold/10 overflow-hidden flex items-center justify-center shrink-0">
                      {publicProfile.avatar
                        ? <img src={publicProfile.avatar} alt={publicProfile.username} className="w-full h-full object-cover" />
                        : <span className="font-serif text-2xl text-pirate-gold/60 uppercase">{publicProfile.username[0]}</span>
                      }
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-2xl text-white">{publicProfile.username}</h3>
                      {publicProfile.fullname && (
                        <p className="font-mono text-xs text-gray-400">{publicProfile.fullname}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${RANK_COLORS[publicProfile.rank] ?? RANK_COLORS.Beginner}`}>
                          {publicProfile.rank}
                        </span>
                        {publicProfile.country && (
                          <span className="font-mono text-xs text-gray-400 uppercase">{publicProfile.country}</span>
                        )}
                      </div>
                    </div>
                    <button onClick={closeModal} className="text-gray-500 hover:text-white transition-colors shrink-0">
                      <X size={18} />
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-pirate-gold/5 border border-pirate-gold/10 rounded-xl p-3 text-center">
                      <div className="font-mono text-xl text-pirate-gold">{publicProfile.score}</div>
                      <div className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">pts</div>
                    </div>
                    <div className="bg-pirate-cyan/5 border border-pirate-cyan/10 rounded-xl p-3 text-center">
                      <div className="font-mono text-xl text-pirate-cyan">{publicProfile.badges?.length ?? 0}</div>
                      <div className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">badges</div>
                    </div>
                  </div>

                  {/* Bio */}
                  {publicProfile.bio && (
                    <p className="text-sm text-gray-400 font-sans mb-6 leading-relaxed border-l-2 border-pirate-cyan/20 pl-3">
                      {publicProfile.bio}
                    </p>
                  )}

                  {/* Skills */}
                  {publicProfile.skills?.length > 0 && (
                    <div className="mb-6">
                      <p className="font-mono text-[10px] text-pirate-cyan tracking-widest uppercase mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {publicProfile.skills.map((s: string) => (
                          <span key={s} className="font-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded bg-pirate-cyan/5 border border-pirate-cyan/10 text-pirate-cyan">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Badges */}
                  {publicProfile.badges?.length > 0 ? (
                    <div>
                      <p className="font-mono text-[10px] text-pirate-cyan tracking-widest uppercase mb-3">
                        Badges ({publicProfile.badges.length})
                      </p>
                      <div className="space-y-2">
                        {publicProfile.badges.map((b: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/3 border border-white/5">
                            <span className="text-lg">{b.emoji ?? '🏴'}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-mono text-xs text-white">{b.name}</p>
                              {b.competition && (
                                <p className="font-mono text-[10px] text-gray-500 truncate">{b.competition}</p>
                              )}
                            </div>
                            {b.placement <= 3 && (
                              <span className={`font-mono text-[10px] font-bold ${
                                b.placement === 1 ? 'text-pirate-gold' :
                                b.placement === 2 ? 'text-gray-300' : 'text-orange-400/70'
                              }`}>#{b.placement}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="font-mono text-xs text-gray-500 text-center py-4">No badges yet.</p>
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