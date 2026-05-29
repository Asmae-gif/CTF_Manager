import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown, Skull, Copy, Check, UserMinus, Anchor,
  Trophy, Shield, Users, Swords, Loader2, Trash2, ArrowLeft
} from 'lucide-react';
import { getTeam, removeMember, deleteTeam, inviteMemberByUsername, messageFromAxiosError } from '../../api/teams';
import type { Team, TeamMember } from '../../api/teams';
import { me } from '../../api/auth';

type CurrentUser = { id: number; type?: string; username?: string; email?: string };

export default function TeamDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    me().then((u: any) => setUser(u ?? null)).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getTeam(Number(id))
      .then(setTeam)
      .catch((err) => setError(messageFromAxiosError(err, 'Équipe introuvable.')))
      .finally(() => setLoading(false));
  }, [id]);

  const isLeader = !!(user && team && user.id === team.leader_id);
  const isAdmin = user?.type?.toLowerCase() === 'admin';
  const canManage = isLeader || isAdmin;

  async function handleCopyCode() {
    if (!team?.invite_code) return;
    await navigator.clipboard.writeText(team.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRemove(member: TeamMember) {
    if (!team) return;
    if (!confirm(`Retirer ${member.name} de l'équipe ?`)) return;
    try {
      await removeMember(team.id, member.id);
      setTeam((t) => t ? { ...t, members: (t.members ?? []).filter((m) => m.id !== member.id) } : t);
    } catch (err) {
      alert(messageFromAxiosError(err, 'Erreur lors du retrait.'));
    }
  }

  async function handleDelete() {
    if (!team) return;
    if (!confirm(`Supprimer définitivement l'équipe "${team.name}" ?`)) return;
    try {
      await deleteTeam(team.id);
      navigate('/dashboard');
    } catch (err) {
      alert(messageFromAxiosError(err, 'Erreur lors de la suppression.'));
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!team || !inviteUsername) return;
    setInviteLoading(true);
    setInviteMsg(null);
    try {
      const res: any = await inviteMemberByUsername(team.id, inviteUsername.trim());
      setInviteMsg(res?.message ?? 'Membre ajouté.');
      setInviteUsername('');
      const updated = await getTeam(team.id);
      setTeam(updated);
    } catch (err) {
      setInviteMsg(messageFromAxiosError(err, "Impossible d'inviter ce membre."));
    } finally {
      setInviteLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-pirate-gold animate-spin" />
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Skull className="w-16 h-16 text-red-400" />
        <p className="font-mono text-red-400">{error ?? 'Équipe introuvable.'}</p>
        <button className="pirate-btn" onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/teams')}
            className="flex items-center gap-2 text-gray-400 hover:text-pirate-cyan font-mono text-xs uppercase tracking-widest transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to crews
          </button>
        </div>

        <div className="pirate-card p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full border-2 border-pirate-gold/40 overflow-hidden bg-white/5 flex items-center justify-center shrink-0">
            {team.avatar ? (
              <img src={team.avatar} alt={team.name} className="w-full h-full object-cover" />
            ) : (
              <Swords className="w-10 h-10 text-pirate-gold/60" />
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="pirate-header mb-1">{team.name}</h1>
            {team.description && (
              <p className="font-mono text-sm text-white/50 mb-3">{team.description}</p>
            )}

            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-mono">
              <span className="flex items-center gap-1 text-pirate-gold">
                <Trophy className="w-4 h-4" /> {team.score} pts
              </span>
              <span className="flex items-center gap-1 text-pirate-cyan">
                <Users className="w-4 h-4" /> {team.members?.length ?? 0} members
              </span>
              {team.competition && (
                <span className="flex items-center gap-1 text-white/50">
                  <Shield className="w-4 h-4" /> {team.competition.name}
                </span>
              )}
              <span className={`flex items-center gap-1 ${team.is_active ? 'text-green-400' : 'text-red-400'}`}>
                <Anchor className="w-4 h-4" /> {team.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {canManage && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-400 font-mono text-sm rounded hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Disband
            </button>
          )}
        </div>

        {/* Invite Code — Leader only */}
        {isLeader && team.invite_code && (
          <div className="pirate-card p-6">
            <p className="pirate-label mb-3">Crew Invite Code</p>
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl tracking-[0.3em] text-pirate-gold flex-1">
                {team.invite_code}
              </span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-2 px-4 py-2 border border-pirate-gold/30 text-pirate-gold font-mono text-sm rounded hover:bg-pirate-gold/10 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs font-mono text-white/30 mt-2">
              Share this code with pirates you want to recruit
            </p>
          </div>
        )}

        {/* Members */}
        <div className="pirate-card p-6">
          <h3 className="pirate-label mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" /> Crew Members
          </h3>
          <div className="space-y-3">
            <AnimatePresence>
              {(team.members ?? []).map((member) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-4 p-3 rounded border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                    <span className="font-mono text-sm text-white/40">
                      {member.name?.[0]?.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1">
                    <p className="font-mono text-sm text-white/90">{member.name}</p>
                    <p className="font-mono text-xs text-white/30">{member.email}</p>
                  </div>

                  {member.pivot?.role === 'leader' ? (
                    <span className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono bg-pirate-gold/10 text-pirate-gold border border-pirate-gold/20">
                      <Crown className="w-3 h-3" /> Captain
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono bg-white/5 text-white/40 border border-white/10">
                      <Anchor className="w-3 h-3" /> Crew
                    </span>
                  )}

                  {canManage && member.pivot?.role !== 'leader' && (
                    <button
                      onClick={() => handleRemove(member)}
                      className="ml-2 p-1.5 text-red-400/50 hover:text-red-400 transition-colors rounded hover:bg-red-400/10"
                      title="Remove member"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Invite par username */}
        {canManage && (
          <div className="pirate-card p-6">
            <h3 className="pirate-label mb-4 flex items-center gap-2">
              <Skull className="w-4 h-4" /> Recruit by Username
            </h3>
            <form onSubmit={handleInvite} className="flex gap-3">
              <input
                type="text"
                placeholder="Username"
                className="pirate-input flex-1"
                value={inviteUsername}
                onChange={(e) => setInviteUsername(e.target.value)}
                required
              />
              <button
                type="submit"
                className="pirate-btn w-auto! px-6"
                disabled={inviteLoading}
              >
                {inviteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Invite'}
              </button>
            </form>
            {inviteMsg && (
              <p className="mt-3 text-sm font-mono text-pirate-cyan">{inviteMsg}</p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}