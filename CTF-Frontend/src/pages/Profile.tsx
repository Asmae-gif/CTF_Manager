import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserCircle, Globe,
  Shield, Anchor, Star, Trophy, Medal,
  Loader2, Pencil, X, Check, BookOpen
} from 'lucide-react';
import { api } from '../api/client';
import { getMyProfile, updateMyProfile, UserProfile } from '../api/users';
import { messageFromAxiosError } from '../api/auth';

// Categories will be loaded from the API and used as skill options

const PLACEMENT_CONFIG: Record<number, { label: string; color: string; icon: any; bg: string }> = {
  1: { label: '1st Place', color: 'text-pirate-gold',   icon: Trophy, bg: 'bg-pirate-gold/10 border-pirate-gold/20'  },
  2: { label: '2nd Place', color: 'text-gray-300',      icon: Medal,  bg: 'bg-white/5 border-white/10'               },
  3: { label: '3rd Place', color: 'text-orange-400/80', icon: Medal,  bg: 'bg-orange-400/5 border-orange-400/15'     },
};
  const isAdmin = location.pathname.startsWith('/admin');

export default function Profile() {
  const [profile, setProfile]   = useState<UserProfile | null>(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const [form, setForm] = useState({
    fullname:  '',
    bio:       '',
    country:   '',
    skills:    [] as string[],
    password:  '',
    password_confirmation: '',
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    getMyProfile()
      .then(p => {
        setProfile(p);
        setForm({
          fullname: p.fullname ?? '',
          bio:      p.bio      ?? '',
          country:  p.country  ?? '',
          skills:   p.skills   ?? [],
          password: '',
          password_confirmation: '',
        });
      })
      .catch(err => setError(messageFromAxiosError(err, 'Erreur chargement.')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // load categories to use as skills options
    api.get('/categories').then(res => {
      const data = res.data.data ?? res.data;
      setCategories(data);
    }).catch(() => {
      // ignore errors — keep default empty
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      // If avatarFile exists, build FormData
      if (avatarFile) {
        const fd = new FormData();
        if (form.fullname) fd.append('fullname', form.fullname);
        if (form.bio) fd.append('bio', form.bio);
        if (form.country) fd.append('country', form.country);
        if (form.password) {
          fd.append('password', form.password);
          fd.append('password_confirmation', form.password_confirmation);
        }
        // append skills as skills[] entries
        form.skills.forEach(s => fd.append('skills[]', s));
        fd.append('avatar', avatarFile);

        await updateMyProfile(fd);
      } else {
        const payload: any = {
          fullname: form.fullname || undefined,
          bio:      form.bio      || undefined,
          country:  form.country  || undefined,
          skills:   form.skills.length ? form.skills : undefined,
        };
        if (form.password) {
          payload.password              = form.password;
          payload.password_confirmation = form.password_confirmation;
        }
        await updateMyProfile(payload);
      }
      setSuccess('Profile updated ⚓');
      setEditing(false);
      // Refresh profile
      const updated = await getMyProfile();
      setProfile(updated);
    } catch (err) {
      setError(messageFromAxiosError(err, 'Erreur mise à jour.'));
    } finally {
      setSaving(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter(s => s !== skill)
        : [...f.skills, skill],
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setAvatarFile(f);
  };

  if (loading) {
    return (
      <div className="flex-1 ml-64 p-12 min-h-screen bg-pirate-dark flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-pirate-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className={`flex-1 ${isAdmin ? '' : 'ml-64'} p-12 min-h-screen bg-pirate-dark overflow-y-auto`}>

      {/* Header */}
      <header className="mb-10">
        <div className="font-mono text-xs text-pirate-cyan tracking-[0.3em] mb-3">// CAPTAIN'S QUARTERS</div>
        <h1 className="font-serif text-5xl text-pirate-gold italic mb-2">Your Profile</h1>
        <p className="text-gray-400 font-sans text-sm">Update your pirate identity.</p>
      </header>

      {error   && <p className="font-mono text-red-400 text-xs mb-6 bg-red-400/5 border border-red-400/20 px-4 py-3 rounded-lg">{error}</p>}
      {success && <p className="font-mono text-pirate-cyan text-xs mb-6 bg-pirate-cyan/5 border border-pirate-cyan/20 px-4 py-3 rounded-lg">{success}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Colonne gauche — identité ── */}
        <div className="lg:col-span-1 space-y-6">

          {/* Avatar + infos de base */}
          <div className="bg-[#111a2e]/60 border border-white/5 rounded-2xl p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-pirate-gold/10 border-2 border-pirate-gold/30 flex items-center justify-center mx-auto mb-4 overflow-hidden">
              {profile?.avatar
                ? <img src={profile.avatar} alt={profile.username} className="w-full h-full object-cover" />
                : <span className="font-serif text-3xl text-pirate-gold/60 uppercase">{profile?.username?.[0]}</span>
              }
            </div>
            <h2 className="font-serif text-2xl text-white mb-1">{profile?.username}</h2>
            {profile?.fullname && <p className="font-mono text-xs text-gray-400 mb-2">{profile.fullname}</p>}

            {/* Rank badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-pirate-gold/10 border border-pirate-gold/20 mb-3">
              <Star size={12} className="text-pirate-gold" />
              <span className="font-mono text-xs text-pirate-gold uppercase tracking-widest">{profile?.rank}</span>
            </div>

            {/* Type */}
            <div className="flex justify-center">
              <span className="font-mono text-[10px] text-pirate-cyan bg-pirate-cyan/10 border border-pirate-cyan/20 px-2 py-1 rounded uppercase tracking-widest">
                {profile?.type}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-[#111a2e]/60 border border-white/5 rounded-2xl p-6 space-y-3">
            <p className="font-mono text-[10px] text-pirate-cyan tracking-[0.3em] uppercase mb-4">// Stats</p>
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs text-gray-500 uppercase tracking-widest">Score</span>
              <span className="font-mono text-sm text-pirate-gold">{profile?.score ?? 0} pts</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs text-gray-500 uppercase tracking-widest">Badges</span>
              <span className="font-mono text-sm text-white">{profile?.badges?.length ?? 0}</span>
            </div>
            {profile?.country && (
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs text-gray-500 uppercase tracking-widest">Country</span>
                <span className="font-mono text-sm text-white uppercase">{profile.country}</span>
              </div>
            )}
            {profile?.created_at && (
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs text-gray-500 uppercase tracking-widest">Joined</span>
                <span className="font-mono text-xs text-white">
                  {new Date(profile.created_at).toLocaleDateString('fr-CA')}
                </span>
              </div>
            )}
          </div>

          {/* Skills */}
          {profile?.skills && profile.skills.length > 0 && (
            <div className="bg-[#111a2e]/60 border border-white/5 rounded-2xl p-6">
              <p className="font-mono text-[10px] text-pirate-cyan tracking-[0.3em] uppercase mb-4">// Skills</p>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map(s => (
                  <span key={s} className="font-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded bg-pirate-cyan/5 border border-pirate-cyan/10 text-pirate-cyan">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Colonne droite — edit + badges ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Formulaire modifier */}
          <div className="bg-[#111a2e]/60 border border-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <p className="font-mono text-[10px] text-pirate-cyan tracking-[0.3em] uppercase">// Edit Identity</p>
              <button
                onClick={() => setEditing(!editing)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-[10px] uppercase tracking-widest transition-all border ${
                  editing
                    ? 'border-red-400/20 text-red-400 hover:bg-red-400/5'
                    : 'border-white/10 text-gray-400 hover:text-pirate-gold hover:border-pirate-gold/20'
                }`}
              >
                {editing ? <><X size={12} /> Cancel</> : <><Pencil size={12} /> Edit</>}
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">

              {/* Fullname */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] text-pirate-cyan tracking-[0.2em] uppercase">Full Name</label>
                <div className="relative">
                  <UserCircle size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    type="text"
                    value={form.fullname}
                    onChange={e => setForm(f => ({ ...f, fullname: e.target.value }))}
                    disabled={!editing}
                    placeholder="Edward Teach"
                    className="w-full bg-[#0a1220] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-pirate-cyan/30 transition-all placeholder-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] text-pirate-cyan tracking-[0.2em] uppercase">Bio</label>
                <div className="relative">
                  <BookOpen size={15} className="absolute left-4 top-4 text-white/20" />
                  <textarea
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    disabled={!editing}
                    placeholder="Tell your pirate story..."
                    rows={3}
                    maxLength={500}
                    className="w-full bg-[#0a1220] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-pirate-cyan/30 transition-all placeholder-white/20 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Country */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] text-pirate-cyan tracking-[0.2em] uppercase">Country (2 letters)</label>
                <div className="relative">
                  <Globe size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    type="text"
                    value={form.country}
                    onChange={e => setForm(f => ({ ...f, country: e.target.value.toUpperCase().slice(0, 2) }))}
                    disabled={!editing}
                    placeholder="MA"
                    maxLength={2}
                    className="w-full bg-[#0a1220] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-pirate-cyan/30 transition-all placeholder-white/20 uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Skills */}
              {editing && (
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] text-pirate-cyan tracking-[0.2em] uppercase">Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() => toggleSkill(cat.slug)}
                        className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all ${
                          form.skills.includes(cat.slug)
                            ? 'bg-pirate-cyan/10 border-pirate-cyan/30 text-pirate-cyan'
                            : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Avatar upload */}
              {editing && (
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] text-pirate-cyan tracking-[0.2em] uppercase">Avatar</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="w-full bg-[#0a1220] border border-white/10 rounded-lg px-4 py-2 text-white font-mono text-sm focus:outline-none"
                  />
                </div>
              )}

              {/* Password */}
              {editing && (
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[10px] text-pirate-cyan tracking-[0.2em] uppercase">New Password</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full bg-[#0a1220] border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-pirate-cyan/30 transition-all placeholder-white/20"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[10px] text-pirate-cyan tracking-[0.2em] uppercase">Confirm Password</label>
                    <input
                      type="password"
                      value={form.password_confirmation}
                      onChange={e => setForm(f => ({ ...f, password_confirmation: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full bg-[#0a1220] border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-pirate-cyan/30 transition-all placeholder-white/20"
                    />
                  </div>
                </div>
              )}

              {/* Submit */}
              {editing && (
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-pirate-gold hover:bg-pirate-gold/90 text-black px-6 py-3 rounded-lg font-mono text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </form>
          </div>

          {/* ── Badges ── */}
          <div className="bg-[#111a2e]/60 border border-white/5 rounded-2xl p-6">
            <p className="font-mono text-[10px] text-pirate-cyan tracking-[0.3em] uppercase mb-6">
              // Badges & Achievements ({profile?.badges?.length ?? 0})
            </p>

            {!profile?.badges?.length ? (
              <div className="py-10 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl gap-3">
                <Shield className="w-8 h-8 text-white/10" />
                <p className="font-mono text-xs text-white/30 uppercase tracking-widest">
                  No badges yet. Win a competition to earn one.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {profile.badges.map((badge, i) => {
                  const cfg = PLACEMENT_CONFIG[badge.placement] ?? {
                    label: `#${badge.placement}`,
                    color: 'text-gray-400',
                    icon: Anchor,
                    bg: 'bg-white/5 border-white/10',
                  };
                  const Icon = cfg.icon;

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-center gap-4 p-4 rounded-xl border ${cfg.bg} transition-all`}
                    >
                      {/* Emoji */}
                      <div className="text-2xl w-10 text-center shrink-0">
                        {badge.emoji ?? '🏴'}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm text-white font-bold">{badge.name}</p>
                        {badge.competition && (
                          <p className="font-mono text-xs text-gray-500 truncate mt-0.5">
                            {badge.competition}
                          </p>
                        )}
                        {badge.awarded_at && (
                          <p className="font-mono text-[10px] text-gray-600 mt-0.5">
                            {new Date(badge.awarded_at).toLocaleDateString('fr-CA')}
                          </p>
                        )}
                      </div>

                      {/* Placement */}
                      <div className={`flex items-center gap-1.5 shrink-0 ${cfg.color}`}>
                        <Icon size={14} />
                        <span className="font-mono text-xs uppercase tracking-widest">{cfg.label}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}