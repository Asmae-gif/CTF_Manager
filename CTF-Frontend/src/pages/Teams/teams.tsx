// src/pages/Teams/Teams.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swords, Users, Trophy, Plus, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { getTeams, messageFromAxiosError } from '../../api/teams';
import { useAuth } from '../../context/AuthContext';
import type { Team } from '../../api/teams';

export default function Teams() {
  const { user } = useAuth();
  const [items, setItems]     = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const currentTeam = user
    ? items.find((team) => team.leader_id === user.id || team.members?.some((member) => member.id === user.id))
    : undefined;
  const currentTeamLocked = Boolean(currentTeam?.competition_id && currentTeam?.competition?.status !== 'ended');
  const filteredTeams = currentTeam ? [currentTeam] : [];

  useEffect(() => {
    getTeams()
      .then(setItems)
      .catch(err => setError(messageFromAxiosError(err, 'Erreur chargement.')))
      .finally(() => setLoading(false));
  }, []);

  return (
    // ✅ flex-1 ml-64 — exactement comme Competitions
    <div className="flex-1 ml-64 p-12 min-h-screen bg-pirate-dark overflow-y-auto">

      {/* Header — copie exacte Competitions */}
      <header className="mb-12">
        <div className="font-mono text-xs text-pirate-cyan tracking-[0.3em] mb-4">// CREW ROSTER</div>
        <h1 className="font-serif text-5xl text-pirate-gold mb-6 italic">Teams</h1>
        <p className="text-gray-400 max-w-2xl font-sans leading-relaxed">
          Forge alliances, build your crew, and sail together toward the flag.
        </p>
      </header>

      {/* Boutons — style pirate, pas cyan basique */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-10">
        {currentTeamLocked ? (
          <button
            disabled
            className="flex items-center gap-2 bg-pirate-gold text-black px-5 py-2.5 rounded-lg font-mono text-xs font-bold tracking-widest opacity-50 cursor-not-allowed"
          >
            <Plus size={14} /> Create Crew
          </button>
        ) : (
          <Link
            to="/teams/create"
            className="flex items-center gap-2 bg-pirate-gold hover:bg-pirate-gold/90 text-black px-5 py-2.5 rounded-lg font-mono text-xs font-bold tracking-widest shadow-[0_0_20px_rgba(255,183,3,0.15)] transition-all uppercase"
          >
            <Plus size={14} /> Create Crew
          </Link>
        )}
        {currentTeamLocked ? (
          <button
            disabled
            className="flex items-center gap-2 bg-white/10 text-white/40 px-5 py-2.5 rounded-lg font-mono text-xs tracking-widest opacity-50 cursor-not-allowed"
          >
            <KeyRound size={14} /> Join Crew
          </button>
        ) : (
          <Link
            to="/teams/join"
            className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white px-5 py-2.5 rounded-lg font-mono text-xs tracking-widest transition-all uppercase"
          >
            <KeyRound size={14} /> Join Crew
          </Link>
        )}
      </div>

      {/* Loading — copie exacte */}
      {loading && (
        <div className="flex items-center gap-3 font-mono text-pirate-cyan animate-pulse">
          <span className="w-2 h-2 rounded-full bg-pirate-cyan" />
          assembling crews...
        </div>
      )}

      {/* Error — copie exacte */}
      {error && <p className="font-mono text-red-400 text-sm">{error}</p>}

      {/* Grid — copie exacte Competitions */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team, i) => (
              <motion.div
              key={team.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={`/teams/${team.id}`}
                className="block bg-pirate-card border border-white/5 rounded-2xl p-6 group hover:border-pirate-gold/40 transition-all cursor-pointer"
              >
                {/* Icon + status — copie exacte */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-pirate-gold/10 flex items-center justify-center text-pirate-gold overflow-hidden">
                    {team.avatar
                      ? <img src={team.avatar} alt={team.name} className="w-full h-full object-cover" />
                      : <Swords size={20} />
                    }
                  </div>
                  <div className={`px-2 py-1 rounded font-mono text-[10px] tracking-widest uppercase ${
                    team.is_active
                      ? 'bg-pirate-cyan/10 text-pirate-cyan'
                      : 'bg-pirate-gold/10 text-pirate-gold'
                  }`}>
                    {team.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>

                {/* Nom — copie exacte */}
                <h3 className="font-serif text-xl text-white mb-2 group-hover:text-pirate-gold transition-colors">
                  {team.name}
                </h3>

                {/* Description — copie exacte */}
                <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed">
                  {team.description || 'No description provided.'}
                </p>

                {/* Footer — copie exacte */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[10px] font-mono text-gray-400 tracking-widest uppercase">
                  <div className="flex items-center gap-2">
                    <Users size={12} className="text-pirate-cyan" />
                    {team.members?.length ?? 0} members
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy size={12} className="text-pirate-gold" />
                    {team.score ?? 0} pts
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          {filteredTeams.length === 0 && (
            <p className="font-mono text-sm text-gray-500">Vous n'êtes dans aucune équipe. Créez une équipe ou rejoignez une équipe existante.</p>
          )}
        </div>
      </>
      )}
    </div>
  );
}