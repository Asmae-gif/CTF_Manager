import { useEffect, useState } from "react";
import { Flag, Anchor, ArrowLeft, ShieldCheck, Award, KeyRound, Lightbulb, Paperclip, X,Calendar, Users, User,
    Globe, Trophy, Medal,Download ,Loader2  } from "lucide-react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { getCompetition, getCompetitionChallenges, joinCompetition, Competition, Challenge } from "../../api/competitions";
import { messageFromAxiosError } from "../../api/auth";
import { api } from "../../api/client";


export default function CompetitionDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [competition, setCompetition] = useState<Competition | null>(null);
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState("");
    const [joinMsg, setJoinMsg] = useState("");
    const [selected, setSelected] = useState<Challenge | null>(null);
    const [hints, setHints] = useState<any[]>([]);
    const [flag, setFlag] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState<any>(null);
    const [certAvailable, setCertAvailable] = useState(false);
    const [certLoading, setCertLoading]     = useState(false);

// Vérifie le statut au chargement
useEffect(() => {
  if (!id) return;
  api.get(`/competitions/${id}/certificate/status`)
     .then(r => setCertAvailable(r.data.available))
     .catch(() => {});
}, [id]);

useEffect(() => {
  if (!id) return;
  api.get(`/competitions/${id}/certificate/status`)
     .then(r => setCertAvailable(r.data.available))
     .catch(() => {});
}, [id]);

const handleDownload = async () => {
  setCertLoading(true);
  try {
    const res = await api.get(`/competitions/${id}/certificate/pdf`, {
      responseType: 'blob',
    });
    const url  = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href  = url;
    link.download = `certificat-${competition?.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch {
    setError('Certificat non disponible.');
  } finally {
    setCertLoading(false);
  }
};
    if (!id) return <div className="text-red-400">Invalid competition ID</div>;

    const load = () => {
        getCompetition(id)
            .then((comp) => {
                setCompetition(comp);
                if (comp.status === 'active') {
                    return getCompetitionChallenges(id).then((chals) => setChallenges(chals));
                } else {
                    setChallenges([]);
                    return Promise.resolve();
                }
            })
            .catch(err => setError(messageFromAxiosError(err, "Erreur chargement.")))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [id]);

    const handleJoin = async () => {
        setJoining(true);
        setError("");
        try {
            await joinCompetition(id);
            setJoinMsg("You have boarded the ship!");
            setCompetition(prev => prev ? { ...prev, team_registered_here: true, can_join: false } : prev);
        } catch (err) {
            setError(messageFromAxiosError(err, "Could not join."));
        } finally {
            setJoining(false);
        }
    };

    const openChallenge = async (ch: Challenge) => {
        setSelected(ch);
        setFlag("");
        setSubmitResult(null);
        try {
            const res = await api.get("/challenges/" + ch.id + "/hints");
            setHints(res.data);
        } catch { setHints([]); }
    };

    const submitFlag = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!flag.trim() || !selected) return;
        setSubmitting(true);
        try {
            const res = await api.post("/challenges/" + selected.id + "/submit", { flag: flag.trim() });
            setSubmitResult(res.data);
            if (res.data.correct) load();
        } catch (err: any) {
            setSubmitResult({ correct: false, message: err?.response?.data?.message || "Erreur." });
        } finally { setSubmitting(false); }
    };

    const useHint = async (hintId: number) => {
        if (!window.confirm("Utiliser ce hint ? Les points seront deduits.")) return;
        try {
            const res = await api.post("/hints/" + hintId + "/use");
            setHints(prev => prev.map(h => h.id === hintId ? { ...h, used: true, content: res.data.content } : h));
        } catch (err: any) {
            alert(err?.response?.data?.message || "Erreur");
        }
    };

    const filePath = selected ? (selected as any).file_path : null;

    return (
        <div className="flex-1 ml-64 p-12 min-h-screen bg-pirate-dark overflow-y-auto">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-pirate-cyan font-mono text-xs tracking-widest uppercase mb-8 transition-colors">
                <ArrowLeft size={14} /> Back to seas
            </button>

            {error && <p className="font-mono text-red-400 text-sm mb-4">{error}</p>}
            {joinMsg && <p className="font-mono text-pirate-cyan text-sm mb-4">{joinMsg}</p>}

            {loading ? (
                <div className="font-mono text-pirate-cyan text-sm animate-pulse uppercase tracking-widest">Scanning horizon...</div>
            ) : (
                <>
                    <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
    <div>
        <div className="font-mono text-xs text-pirate-cyan tracking-[0.3em] mb-4">// QUEST ACTIVE</div>
        <h1 className="font-serif text-5xl text-pirate-gold mb-2 italic">
            {competition?.title}  {/* ✅ title */}
        </h1>
        <p className="text-gray-400 font-sans mb-6">
            {competition?.description} — Status:{' '}
            <span className="text-pirate-cyan">{competition?.status}</span>
        </p>

        {/* ✅ Infos supplémentaires */}
        <div className="flex flex-wrap gap-4 text-xs font-mono text-gray-500">

            {/* Dates */}
            {competition?.starts_at && (
                <span className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-pirate-cyan" />
                    {new Date(competition.starts_at).toLocaleDateString('fr-CA')}
                    {competition.ends_at && (
                        <> → {new Date(competition.ends_at).toLocaleDateString('fr-CA')}</>
                    )}
                </span>
            )}

            {/* Max teams */}
            {competition?.max_teams && (
                <span className="flex items-center gap-1.5">
                    <Users size={12} className="text-pirate-cyan" />
                    Max {competition.max_teams} teams
                </span>
            )}

            {/* Max membres par équipe */}
            {competition?.max_team_members && (
                <span className="flex items-center gap-1.5">
                    <User size={12} className="text-pirate-cyan" />
                    {competition.max_team_members} members/team
                </span>
            )}

            {/* Organisateur */}
            {competition?.organizer_name && (
                <span className="flex items-center gap-1.5">
                    <Globe size={12} className="text-pirate-cyan" />
                    {competition.organizer_name}
                </span>
            )}
        </div>

        {/* ✅ Prizes — seulement si définis */}
        {(competition?.first_place_prize || competition?.second_place_prize || competition?.third_place_prize) && (
            <div className="flex flex-wrap gap-3 mt-4">
                {competition.first_place_prize && (
                    <div className="flex items-center gap-2 bg-pirate-gold/10 border border-pirate-gold/20 px-3 py-1.5 rounded-lg">
                        <Trophy size={13} className="text-pirate-gold" />
                        <span className="font-mono text-xs text-pirate-gold">
                            1st — {competition.first_place_prize}
                        </span>
                    </div>
                )}
                {competition.second_place_prize && (
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                        <Medal size={13} className="text-gray-300" />
                        <span className="font-mono text-xs text-gray-300">
                            2nd — {competition.second_place_prize}
                        </span>
                    </div>
                )}
                {competition.third_place_prize && (
                    <div className="flex items-center gap-2 bg-orange-500/5 border border-orange-400/20 px-3 py-1.5 rounded-lg">
                        <Medal size={13} className="text-orange-400/70" />
                        <span className="font-mono text-xs text-orange-400/70">
                            3rd — {competition.third_place_prize}
                        </span>
                    </div>
                )}
            </div>
        )}
    </div>

    {/* Boutons JOIN + CERTIFICATE */}
        <div className="flex gap-4 shrink-0">
        {competition?.team_registered_here ? (
            <div className="bg-white/5 border border-white/10 text-pirate-cyan px-6 py-3 rounded-lg font-mono text-xs font-bold tracking-widest flex items-center gap-2">
                <Anchor size={16} />
                 Already Registered
            </div>
        ) : competition?.can_join ? (
            <button
                onClick={handleJoin}
                disabled={joining}
                className="bg-pirate-gold hover:bg-pirate-gold/90 text-black px-6 py-3 rounded-lg font-mono text-xs font-bold tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(255,183,3,0.2)] transition-all disabled:opacity-50"
            >
                <Anchor size={16} />
                {joining ? 'Boarding...' : 'JOIN CREW'}
            </button>
        ) : (
            <button
                disabled
                className="bg-white/10 border border-white/20 text-gray-400 px-6 py-3 rounded-lg font-mono text-xs font-bold tracking-widest flex items-center gap-2 transition-all"
            >
                <Anchor size={16} />
                {competition?.status === 'upcoming' ? 'JOIN DISABLED' : 'CANNOT JOIN'}
            </button>
        )}
        {(competition?.status === 'ended' || competition?.finalized_at) && certAvailable && (
  <button
    onClick={handleDownload}
    disabled={certLoading}
    className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-6 py-3 rounded-lg font-mono text-xs tracking-widest flex items-center gap-2 transition-all disabled:opacity-50"
  >
    {certLoading
      ? <Loader2 size={16} className="animate-spin" />
      : <Download size={16} />
    }
    LOOT CERTIFICATE
  </button>
)}
    </div>
</header>

                    {competition?.status === 'active' ? (
                        <>
                            <div className="mb-8 flex items-center gap-3">
                                <Flag className="text-pirate-cyan" size={20} />
                                <h2 className="font-serif text-2xl text-white">Challenges ({challenges.length})</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {challenges.map((ch: any, i: number) => (
                                    <motion.div key={ch.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                        onClick={() => openChallenge(ch)}
                                        className={"cursor-pointer bg-pirate-card/50 border rounded-xl p-5 group hover:-translate-y-1 transition-all " + (ch.solved ? "border-pirate-cyan/20" : "border-white/5 hover:border-pirate-gold/20")}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-pirate-cyan bg-pirate-cyan/5 px-2 py-0.5 rounded">
                                                {ch.category?.name ?? ch.category}
                                            </span>
                                            <span className="font-serif text-pirate-gold italic">{ch.points} pts</span>
                                        </div>
                                        <h3 className="font-serif text-lg text-white mb-1 group-hover:text-pirate-gold transition-colors">{ch.title}</h3>
                                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-4 inline-flex items-center gap-1.5">
                                            <ShieldCheck size={10} /> {ch.difficulty}
                                        </p>
                                        {ch.solved && (
                                            <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-pirate-cyan uppercase tracking-widest bg-pirate-cyan/10 p-2 rounded">
                                                <Award size={12} /> Captured by your crew
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                                {challenges.length === 0 && (
                                    <p className="font-mono text-sm text-gray-500 col-span-3">No challenges yet in these waters.</p>
                                )}
                            </div>
                        </>
                    ) : null}
                </>
            )}

            {selected && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0d1117] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-8"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="font-mono text-xs text-pirate-cyan tracking-widest uppercase mb-2">
                                    // challenge · {(selected as any).category?.name ?? (selected as any).category}
                                </p>
                                <h2 className="font-serif text-3xl text-pirate-gold">{selected.title}</h2>
                                <p className="text-gray-400 text-sm mt-1">{(selected as any).description}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-serif text-2xl text-pirate-gold">{selected.points} pts</span>
                                <button onClick={() => { setSelected(null); setSubmitResult(null); }} className="text-gray-500 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {filePath && (
                            <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
                                <Paperclip size={16} className="text-pirate-cyan" />
                                <span className="font-mono text-sm text-gray-300">Fichier joint :</span>
                                <a href={"http://127.0.0.1:8000/storage/" + filePath} target="_blank" rel="noreferrer" className="font-mono text-sm text-pirate-cyan hover:underline">
                                    Download file
                                </a>
                            </div>
                        )}

                        <form onSubmit={submitFlag} className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                            <h3 className="font-serif text-lg text-white flex items-center gap-2 mb-4">
                                <Flag size={18} className="text-pirate-cyan" /> Submit Flag
                            </h3>
                            <div className="relative mb-4">
                                <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input type="text" placeholder="CTF{...}" value={flag} onChange={e => setFlag(e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg pl-11 pr-4 py-3 font-mono text-sm text-white placeholder-gray-600 focus:outline-none focus:border-pirate-cyan/50"
                                />
                            </div>
                            <button type="submit" disabled={submitting} className="bg-pirate-gold hover:bg-pirate-gold/90 text-black px-6 py-2.5 rounded-lg font-mono text-xs font-bold tracking-widest uppercase transition-all disabled:opacity-50">
                                {submitting ? "Decrypting..." : "Capture Flag"}
                            </button>
                            {submitResult && (
                                <div className={"mt-4 p-3 rounded-lg font-mono text-sm border " + (submitResult.correct ? "bg-pirate-cyan/10 border-pirate-cyan/30 text-pirate-cyan" : "bg-red-500/10 border-red-500/30 text-red-400")}>
                                    {submitResult.message}
                                    {submitResult.attempts_left !== undefined && !submitResult.correct && (
                                        <span className="text-gray-500 ml-2">({submitResult.attempts_left} tentatives restantes)</span>
                                    )}
                                </div>
                            )}
                        </form>

                        {hints.length > 0 && (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                <h3 className="font-serif text-lg text-white flex items-center gap-2 mb-4">
                                    <Lightbulb size={18} className="text-pirate-gold" /> Hints
                                </h3>
                                <ul className="space-y-3">
                                    {hints.map((h: any) => (
                                        <li key={h.id} className="p-3 rounded-lg border border-white/5">
                                            <p className="text-xs font-mono text-gray-500 mb-1">cost: {h.cost} pts</p>
                                            {h.used || h.content ? (
                                                <p className="text-sm text-gray-300">{h.content}</p>
                                            ) : (
                                                <button onClick={() => useHint(h.id)} className="font-mono text-xs uppercase tracking-widest text-pirate-cyan hover:text-pirate-gold transition-colors">
                                                    Unlock hint #{h.order}
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
}
