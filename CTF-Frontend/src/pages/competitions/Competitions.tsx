// src/pages/Competitions.tsx
import { useEffect, useState } from 'react';
import { Map, Calendar, Flag } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCompetitions, Competition } from '../../api/competitions';
import { messageFromAxiosError } from '../../api/auth';

export default function Competitions({ onSelect }: { onSelect: (id: string) => void }) {
    const [items, setItems]     = useState<Competition[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');

    useEffect(() => {
        getCompetitions()
            .then(setItems)
            .catch(err => setError(messageFromAxiosError(err, 'Erreur chargement.')))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="flex-1 ml-64 p-12 min-h-screen bg-pirate-dark overflow-y-auto">
            <header className="mb-12">
                <div className="font-mono text-xs text-pirate-cyan tracking-[0.3em] mb-4">// OPEN SEAS</div>
                <h1 className="font-serif text-5xl text-pirate-gold mb-6 italic">Competitions</h1>
                <p className="text-gray-400 max-w-2xl font-sans leading-relaxed">
                    Choose a saga and set your sails. The ocean of bytes is vast and full of secrets.
                </p>
            </header>

            {loading && (
                <div className="flex items-center gap-3 font-mono text-pirate-cyan animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-pirate-cyan" />
                    decrypting...
                </div>
            )}

            {error && <p className="font-mono text-red-400 text-sm">{error}</p>}

            {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((c, i) => (
                        <motion.div
                            key={c.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => onSelect(c.id)}
                            className="bg-pirate-card border border-white/5 rounded-2xl p-6 group hover:border-pirate-gold/40 transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-pirate-gold/10 flex items-center justify-center text-pirate-gold">
                                    <Map size={20} />
                                </div>
                                <div className={`px-2 py-1 rounded font-mono text-[10px] tracking-widest uppercase ${
                                    c.status === 'active'
                                        ? 'bg-pirate-cyan/10 text-pirate-cyan'
                                        : 'bg-pirate-gold/10 text-pirate-gold'
                                }`}>
                                    {c.status}
                                </div>
                            </div>

                            <h3 className="font-serif text-xl text-white mb-2 group-hover:text-pirate-gold transition-colors">
                                {c.title}
                            </h3>
                            <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed">{c.description}</p>

                            <div className="flex items-center justify-between mt-4 text-xs font-mono text-muted-foreground">
  <span className="flex items-center gap-1.5">
    <Calendar className="h-3 w-3" />
    {/* ✅ starts_at au lieu de start_date */}
    {c.starts_at
      ? new Date(c.starts_at).toLocaleDateString('fr-CA')
      : 'TBA'}
  </span>
  <span className="flex items-center gap-1.5">
    <Flag className="h-3 w-3" />
    {/* ✅ challenges_count ou 0 */}
    {c.challenges_count ?? 0} FLAGS
  </span>
</div>
                        </motion.div>
                    ))}

                    {items.length === 0 && (
                        <p className="font-mono text-sm text-gray-500">No competitions found in these waters.</p>
                    )}
                </div>
            )}
        </div>
    );
}