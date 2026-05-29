import { useEffect, useState } from 'react';
import { Trophy, Compass, Users, Flag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getCompetitions, Competition } from '../api/competitions';
import { api } from '../api/client';
import { messageFromAxiosError } from '../api/auth';

export default function Dashboard() {
    const { user } = useAuth();
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loadingData, setLoadingData]   = useState(true);
    const [error, setError]               = useState('');

    // Données diagramme 1 — catégories + solves
    const [categoryStats, setCategoryStats] = useState<{ name: string; icon: string; color: string; solves: number }[]>([]);

    // Données diagramme 2 — score par compétition
    const [scoreStats, setScoreStats] = useState<{ competition: string; score: number }[]>([]);

    useEffect(() => {
        Promise.all([
            getCompetitions(),
            api.get('/categories'),
        ])
        .then(async ([comps, catsRes]) => {
            const allComps = comps as any[];
            setCompetitions(allComps.slice(0, 3));

            // Compétitions actives où le participant est inscrit
            const activeComps = allComps.filter((c: any) => c.status === 'active');
            const categories  = catsRes.data;

            // Pour chaque compétition active → récupère les challenges
            const challengesByComp = await Promise.all(
                activeComps.map((c: any) =>
                    api.get('/competitions/' + c.id + '/challenges')
                       .then(r => ({ comp: c, challenges: r.data.data ?? r.data }))
                       .catch(() => ({ comp: c, challenges: [] }))
                )
            );

            // Compter les solves par catégorie
            const solvesMap: Record<string, number> = {};
            challengesByComp.forEach(({ challenges }) => {
                (challenges as any[]).forEach((ch: any) => {
                    const catName = ch.category?.name ?? ch.category ?? 'Unknown';
                    if (ch.solved) {
                        solvesMap[catName] = (solvesMap[catName] || 0) + 1;
                    }
                });
            });

            // Mapper avec les catégories existantes
            const catStats = categories.map((cat: any) => ({
                name:   cat.name,
                icon:   cat.icon ?? '🔒',
                color:  cat.color ?? '#00CC66',
                solves: solvesMap[cat.name] ?? 0,
            })).sort((a: any, b: any) => b.solves - a.solves);

            setCategoryStats(catStats);

            // Diagramme 2 — score par compétition
            const scorePerComp = await Promise.all(
                allComps.map((c: any) =>
                    api.get('/competitions/' + c.id + '/challenges')
                       .then(r => {
                           const chs = r.data.data ?? r.data;
                           const earned = (chs as any[])
                               .filter((ch: any) => ch.solved)
                               .reduce((sum: number, ch: any) => sum + (ch.points ?? 0), 0);
                           return { competition: c.title ?? c.name, score: earned };
                       })
                       .catch(() => ({ competition: c.title ?? c.name, score: 0 }))
                )
            );

            setScoreStats(scorePerComp.filter(s => s.score > 0).sort((a, b) => b.score - a.score));
        })
        .catch(err => setError(messageFromAxiosError(err, 'Loading error.')))
        .finally(() => setLoadingData(false));
    }, []);

    const stats = [
        { label: 'SCORE',        value: user?.score ?? 0,           icon: Trophy,  color: 'text-pirate-cyan' },
        { label: 'COMPETITIONS', value: competitions.length,         icon: Compass, color: 'text-pirate-cyan' },
        { label: 'ROLE',         value: user?.type ?? 'Participant', icon: Users,   color: 'text-pirate-cyan' },
        { label: 'STATUS',       value: 'Active',                    icon: Flag,    color: 'text-pirate-gold' },
    ];

    const maxSolves = Math.max(...categoryStats.map(c => c.solves), 1);
    const maxScore  = Math.max(...scoreStats.map(s => s.score), 1);

    return (
        <div className="flex-1 ml-64 p-12 min-h-screen bg-pirate-dark">

            {/* Header */}
            <header className="mb-12">
                <div className="font-mono text-xs text-pirate-cyan tracking-[0.3em] mb-4">
                    // {user?.type?.toUpperCase()}
                </div>
                <h1 className="font-serif text-5xl text-pirate-gold mb-6 italic">
                    Welcome aboard, {user?.username}
                </h1>
                <p className="text-gray-400 max-w-2xl font-sans leading-relaxed">
                    The horizon is yours. Pick a quest, sail the ocean of bytes, and capture the flag.
                </p>
            </header>

            {error && <p className="font-mono text-red-400 text-xs mb-6">{error}</p>}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-pirate-card border border-white/5 rounded-xl p-6 flex items-center gap-6 group hover:border-pirate-cyan/20 transition-all"
                    >
                        <div className={`p-4 rounded-lg bg-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <div className="text-[10px] font-mono text-gray-500 tracking-[0.2em] mb-1">{stat.label}</div>
                            <div className={`text-2xl font-medium ${stat.label === 'STATUS' ? 'text-pirate-gold font-serif italic' : 'text-white'}`}>
                                {stat.value}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {loadingData ? (
                <p className="font-mono text-pirate-cyan text-xs animate-pulse tracking-widest">Loading charts...</p>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Diagramme 1 — Solves par catégorie */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-pirate-card/50 border border-white/5 rounded-2xl p-8"
                    >
                        <div className="mb-6">
                            <p className="font-mono text-[10px] text-pirate-cyan tracking-[0.3em] mb-2">// ACTIVE COMPETITION</p>
                            <h2 className="font-serif text-2xl text-white">Solves by Category</h2>
                            <p className="text-gray-500 text-xs font-mono mt-1">Your solved challenges per category</p>
                        </div>

                        {categoryStats.length === 0 ? (
                            <div className="py-12 flex items-center justify-center border border-dashed border-white/10 rounded-xl">
                                <p className="font-mono text-sm text-gray-500 uppercase">No data yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {categoryStats.map((cat, i) => (
                                    <motion.div
                                        key={cat.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + i * 0.08 }}
                                    >
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-base">{cat.icon}</span>
                                                <span className="font-mono text-xs text-white uppercase tracking-widest">{cat.name}</span>
                                            </div>
                                            <span className="font-mono text-xs" style={{ color: cat.color }}>
                                                {cat.solves} solve{cat.solves !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(cat.solves / maxSolves) * 100}%` }}
                                                transition={{ duration: 0.8, delay: 0.5 + i * 0.08 }}
                                                className="h-full rounded-full"
                                                style={{ background: cat.color }}
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Diagramme 2 — Score par compétition */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-pirate-card/50 border border-white/5 rounded-2xl p-8"
                    >
                        <div className="mb-6">
                            <p className="font-mono text-[10px] text-pirate-cyan tracking-[0.3em] mb-2">// ALL COMPETITIONS</p>
                            <h2 className="font-serif text-2xl text-white">Score per Competition</h2>
                            <p className="text-gray-500 text-xs font-mono mt-1">Points earned in each competition</p>
                        </div>

                        {scoreStats.length === 0 ? (
                            <div className="py-12 flex items-center justify-center border border-dashed border-white/10 rounded-xl">
                                <p className="font-mono text-sm text-gray-500 uppercase">No scores yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {scoreStats.map((s, i) => (
                                    <motion.div
                                        key={s.competition}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + i * 0.08 }}
                                    >
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-[10px] text-pirate-gold">#{i + 1}</span>
                                                <span className="font-mono text-xs text-white uppercase tracking-widest truncate max-w-[180px]">
                                                    {s.competition}
                                                </span>
                                            </div>
                                            <span className="font-mono text-xs text-pirate-gold font-bold">
                                                {s.score} pts
                                            </span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(s.score / maxScore) * 100}%` }}
                                                transition={{ duration: 0.8, delay: 0.6 + i * 0.08 }}
                                                className="h-full rounded-full"
                                                style={{
                                                    background: `linear-gradient(90deg, #F0B429, #00D4FF)`,
                                                }}
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                </div>
            )}
        </div>
    );
}