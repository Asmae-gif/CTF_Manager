import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Power, Trash2,
  Crown, Anchor, User, Shield,
  Loader2, ChevronDown, Trophy, Flag,
  Pencil, Save, X
} from 'lucide-react';
import { api } from '../../api/client';
import { messageFromAxiosError } from '../../api/auth';

interface UserAdmin {
  id: number;
  username: string;
  fullname?: string;
  email: string;
  avatar?: string;
  country?: string;
  type: 'admin' | 'team_leader' | 'participant';
  score: number;
  is_active: boolean;
  created_at: string;
}

interface PaginatedResponse {
  data: UserAdmin[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

const TYPE_CONFIG = {
  admin:       { label: 'ADMIN',       color: 'text-red-400',     bg: 'bg-red-400/10 border-red-400/20',         icon: Shield  },
  team_leader: { label: 'TEAM_LEADER', color: 'text-pirate-gold', bg: 'bg-pirate-gold/10 border-pirate-gold/20', icon: Crown   },
  participant: { label: 'PARTICIPANT', color: 'text-pirate-cyan', bg: 'bg-pirate-cyan/10 border-pirate-cyan/20', icon: Anchor  },
};

const TypeBadge = ({ type }: { type: UserAdmin['type'] }) => {
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.participant;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded font-mono text-[10px] uppercase tracking-widest border ${cfg.bg} ${cfg.color}`}>
      <Icon size={10} /> {cfg.label}
    </span>
  );
};

const StatusBadge = ({ active }: { active: boolean }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-[10px] uppercase tracking-widest font-bold ${
    active
      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
      : 'bg-red-500/10 text-red-400 border border-red-500/20'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-400' : 'bg-red-400'}`} />
    {active ? 'ACTIVE' : 'LOCKED'}
  </span>
);

export default function AdminUsers() {
  const [users, setUsers]             = useState<UserAdmin[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [typeFilter, setTypeFilter]   = useState<string>('all');
  const [page, setPage]               = useState(1);
  const [lastPage, setLastPage]       = useState(1);
  const [total, setTotal]             = useState(0);
  const [togglingId, setTogglingId]   = useState<number | null>(null);
  const [deletingId, setDeletingId]   = useState<number | null>(null);
  const [expanded, setExpanded]       = useState<number | null>(null);

  // ✅ States edit — DANS le composant
  const [editingUser, setEditingUser] = useState<UserAdmin | null>(null);
  const [editForm, setEditForm]       = useState({ username: '', email: '', type: '' });
  const [editSaving, setEditSaving]   = useState(false);

  const load = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(p));
    if (search)               params.set('search', search);
    if (typeFilter !== 'all') params.set('type', typeFilter);

    api.get(`/users?${params}`)
       .then(r => {
         const d: PaginatedResponse = r.data;
         setUsers(d.data ?? r.data);
         setLastPage(d.last_page ?? 1);
         setTotal(d.total ?? 0);
       })
       .catch(err => setError(messageFromAxiosError(err, 'Erreur chargement.')))
       .finally(() => setLoading(false));
  };

  useEffect(() => { load(page); }, [page, typeFilter]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleToggle = async (user: UserAdmin) => {
    setTogglingId(user.id);
    try {
      await api.patch(`/users/${user.id}/toggle`);
      setUsers(us => us.map(u =>
        u.id === user.id ? { ...u, is_active: !u.is_active } : u
      ));
    } catch (err) {
      setError(messageFromAxiosError(err, 'Erreur toggle.'));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (user: UserAdmin) => {
    if (!confirm(`Supprimer définitivement "${user.username}" ?`)) return;
    setDeletingId(user.id);
    try {
      await api.delete(`/users/${user.id}`);
      setUsers(us => us.filter(u => u.id !== user.id));
      setTotal(t => t - 1);
    } catch (err) {
      setError(messageFromAxiosError(err, 'Erreur suppression.'));
    } finally {
      setDeletingId(null);
    }
  };

  // ✅ Fonctions edit — DANS le composant
  const openEdit = (user: UserAdmin) => {
    setEditingUser(user);
    setEditForm({ username: user.username, email: user.email, type: user.type });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditSaving(true);
    try {
      await api.put(`/users/${editingUser.id}`, editForm);
      setUsers(us => us.map(u =>
        u.id === editingUser.id
          ? { ...u, username: editForm.username, email: editForm.email, type: editForm.type as UserAdmin['type'] }
          : u
      ));
      setEditingUser(null);
    } catch (err) {
      setError(messageFromAxiosError(err, 'Erreur modification.'));
    } finally {
      setEditSaving(false);
    }
  };

  return (
    // ✅ Fragment pour avoir la modal ET le div principal dans le même return
    <>
      <div className="p-12 min-h-screen">

        <header className="mb-10">
          <div className="font-mono text-xs text-red-400 tracking-[0.3em] mb-3">// ADMIN</div>
          <h1 className="font-serif text-5xl text-white italic mb-2">Users</h1>
          <p className="text-gray-400 font-sans text-sm">Manage the crews of the ocean.</p>
        </header>

        {error && (
          <p className="font-mono text-red-400 text-xs mb-6 bg-red-400/5 border border-red-400/20 px-4 py-3 rounded-lg">
            {error}
          </p>
        )}

        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search username or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#0a1220] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-pirate-cyan/30 transition-all placeholder-white/20"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'admin', 'team_leader', 'participant'] as const).map(f => (
              <button
                key={f}
                onClick={() => { setTypeFilter(f); setPage(1); }}
                className={`px-4 py-2.5 rounded-lg font-mono text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
                  typeFilter === f
                    ? 'bg-pirate-gold text-black font-bold'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {f === 'all' ? 'All' : f === 'team_leader' ? 'Leaders' : f}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#111a2e]/40 border border-white/5 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-pirate-cyan/5 border-b border-white/5">
            {['USERNAME', 'EMAIL', 'TYPE', 'STATUS', 'SCORE', 'ACTIONS'].map((h, i) => (
              <div key={h} className={`font-mono text-[10px] text-pirate-cyan uppercase tracking-widest ${
                i === 0 ? 'col-span-2' : i === 1 ? 'col-span-3' : i === 2 ? 'col-span-2' :
                i === 3 ? 'col-span-2' : i === 4 ? 'col-span-1' : 'col-span-2 text-right'
              }`}>{h}</div>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 font-mono text-pirate-cyan animate-pulse">
              <Loader2 size={16} className="animate-spin" /> loading pirates...
            </div>
          ) : users.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <Users className="w-10 h-10 text-white/10" />
              <p className="font-mono text-sm text-white/30 uppercase tracking-widest">No users found.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {users.map((user, i) => (
                <div key={user.id}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/2 transition-all"
                  >
                    <div className="col-span-2 flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-pirate-gold/10 border border-pirate-gold/20 overflow-hidden flex items-center justify-center shrink-0">
                        {user.avatar
                          ? <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                          : <span className="font-mono text-xs text-pirate-gold/60 uppercase">{user.username[0]}</span>
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono text-sm text-white font-bold truncate">{user.username}</p>
                        {user.fullname && <p className="font-mono text-[10px] text-gray-500 truncate">{user.fullname}</p>}
                      </div>
                    </div>

                    <div className="col-span-3 font-mono text-xs text-gray-400 truncate">{user.email}</div>
                    <div className="col-span-2"><TypeBadge type={user.type} /></div>
                    <div className="col-span-2"><StatusBadge active={user.is_active} /></div>
                    <div className="col-span-1 font-mono text-sm text-pirate-gold">{user.score}</div>

                    {/* ✅ Actions avec bouton Edit */}
                    <div className="col-span-2 flex items-center justify-end gap-1">
                      <button
                        onClick={() => setExpanded(expanded === user.id ? null : user.id)}
                        className="text-gray-500 hover:text-pirate-cyan transition-colors p-2"
                      >
                        <ChevronDown size={14} className={`transition-transform ${expanded === user.id ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => openEdit(user)}
                        title="Modifier"
                        className="p-2 text-gray-500 hover:text-pirate-gold transition-colors"
                      >
                        <Pencil size={13} />
                      </button>

                      {/* Toggle */}
                      <button
                        onClick={() => handleToggle(user)}
                        disabled={togglingId === user.id}
                        className={`p-2 transition-colors ${user.is_active ? 'text-gray-500 hover:text-yellow-400' : 'text-green-400 hover:text-white'}`}
                      >
                        {togglingId === user.id ? <Loader2 size={13} className="animate-spin" /> : <Power size={13} />}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(user)}
                        disabled={deletingId === user.id || user.type === 'admin'}
                        className={`p-2 transition-colors ${user.type === 'admin' ? 'text-gray-400 opacity-30 cursor-not-allowed' : 'text-red-400 hover:text-red-300'}`}
                      >
                        {deletingId === user.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      </button>
                    </div>
                  </motion.div>

                  <AnimatePresence>
                    {expanded === user.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 py-4 bg-white/2 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-pirate-gold/5 border border-pirate-gold/10 rounded-xl p-4 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <Trophy size={13} className="text-pirate-gold" />
                              <span className="font-mono text-[10px] text-pirate-gold uppercase tracking-widest">Score</span>
                            </div>
                            <span className="font-mono text-2xl text-white">{user.score}</span>
                            <span className="font-mono text-[10px] text-gray-500">points</span>
                          </div>
                          <div className="bg-pirate-cyan/5 border border-pirate-cyan/10 rounded-xl p-4 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <Flag size={13} className="text-pirate-cyan" />
                              <span className="font-mono text-[10px] text-pirate-cyan uppercase tracking-widest">Country</span>
                            </div>
                            <span className="font-mono text-xl text-white uppercase">{user.country || '—'}</span>
                            <span className="font-mono text-[10px] text-gray-500">location</span>
                          </div>
                          <div className="bg-white/3 border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <User size={13} className="text-gray-400" />
                              <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">Full Name</span>
                            </div>
                            <span className="font-mono text-sm text-white truncate">{user.fullname || '—'}</span>
                            <span className="font-mono text-[10px] text-gray-500">registered name</span>
                          </div>
                          <div className="bg-white/3 border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <Anchor size={13} className="text-gray-400" />
                              <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">Joined</span>
                            </div>
                            <span className="font-mono text-sm text-white">{new Date(user.created_at).toLocaleDateString('fr-CA')}</span>
                            <span className="font-mono text-[10px] text-gray-500">member since</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>

        {lastPage > 1 && (
          <div className="flex items-center justify-between mt-6">
            <span className="font-mono text-xs text-gray-500">Page {page} of {lastPage} — {total} users total</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-white/10 font-mono text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest">
                ← Prev
              </button>
              {Array.from({ length: Math.min(5, lastPage) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2 + i, lastPage - 4 + i));
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg font-mono text-xs transition-all ${page === p ? 'bg-pirate-gold text-black font-bold' : 'border border-white/10 text-gray-400 hover:text-white hover:bg-white/5'}`}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage}
                className="px-4 py-2 rounded-lg border border-white/10 font-mono text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Modal — DANS le fragment, APRÈS le div principal */}
      <AnimatePresence>
        {editingUser && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setEditingUser(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0d1526] border border-white/10 rounded-2xl p-8 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="font-mono text-[10px] text-red-400 tracking-widest uppercase mb-1">// ADMIN EDIT</p>
                  <h3 className="font-serif text-2xl text-white">Edit {editingUser.username}</h3>
                </div>
                <button onClick={() => setEditingUser(null)} className="text-gray-500 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleEdit} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] text-pirate-cyan tracking-widest uppercase">Username</label>
                  <input type="text" value={editForm.username} onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))}
                    className="bg-[#0a1220] border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-pirate-cyan/30 transition-all" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] text-pirate-cyan tracking-widest uppercase">Email</label>
                  <input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                    className="bg-[#0a1220] border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-pirate-cyan/30 transition-all" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] text-pirate-cyan tracking-widest uppercase">Role</label>
                  <select value={editForm.type} onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))}
                    className="bg-[#0a1220] border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-pirate-cyan/30 transition-all">
                    <option value="participant">Participant</option>
                    <option value="team_leader">Team Leader</option>
                    <option value="admin">Admin</option>
                  </select>
                  <p className="font-mono text-[10px] text-gray-500">⚠️ Changer le rôle a un impact immédiat sur les accès.</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={editSaving}
                    className="flex items-center gap-2 bg-pirate-gold hover:bg-pirate-gold/90 text-black px-6 py-3 rounded-lg font-mono text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50">
                    {editSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {editSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button type="button" onClick={() => setEditingUser(null)}
                    className="px-6 py-3 rounded-lg font-mono text-xs text-gray-500 hover:text-white border border-white/10 hover:bg-white/5 tracking-widest uppercase transition-all">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>  
  );
}