import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map, Plus, Trash2, Pencil, X, Check, Search,
  Trophy, Calendar, Users, Globe, Medal,
  Loader2, Flag
} from 'lucide-react';
import { api } from '../../api/client';
import { messageFromAxiosError } from '../../api/auth';

interface Competition {
  id: number;
  title: string;
  description?: string;
  status: string;
  starts_at: string;
  ends_at: string;
  max_teams?: number;
  max_team_members?: number;
  is_public: boolean;
  organizer_name?: string;
  first_place_prize?: string;
  second_place_prize?: string;
  third_place_prize?: string;
  created_at: string;
  finalized_at?: string;
}

const EMPTY_FORM = {
  title: '',
  description: '',
  starts_at: '',
  ends_at: '',
  max_teams: '',
  max_team_members: '5',
  is_public: true,
  organizer_name: '',
  first_place_prize: '',
  second_place_prize: '',
  third_place_prize: '',
  status: 'draft',
};

const STATUS_COLORS: Record<string, string> = {
  draft:    'bg-white/10 text-white/50 border border-white/10',
  upcoming: 'bg-pirate-gold/10 text-pirate-gold border border-pirate-gold/20',
  active:   'bg-pirate-cyan/10 text-pirate-cyan border border-pirate-cyan/20',
  ended:    'bg-red-500/10 text-red-400 border border-red-400/20',
};

// ✅ Toutes les transitions possibles — utilisé dans le select
const ALL_STATUSES = ['draft', 'upcoming', 'active', 'ended'];

const STATUS_TRANSITIONS: Record<string, string[]> = {
  draft:    ['upcoming'],
  upcoming: ['active', 'draft'],
  active:   ['ended'],
  ended:    [],
};

function Field({
  label, name, value, onChange, type = 'text', placeholder = '', colSpan = 1
}: {
  label: string; name: string; value: string | boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string; placeholder?: string; colSpan?: number;
}) {
  const span = colSpan === 2 ? 'md:col-span-2' : '';
  if (type === 'checkbox') {
    return (
      <label className={`flex items-center gap-3 cursor-pointer ${span}`}>
        <input type="checkbox" name={name} checked={value as boolean} onChange={onChange} className="w-4 h-4 accent-pirate-cyan" />
        <span className="font-mono text-xs text-pirate-cyan tracking-widest uppercase">{label}</span>
      </label>
    );
  }
  if (type === 'textarea') {
    return (
      <div className={`flex flex-col gap-1.5 ${span}`}>
        <label className="font-mono text-[10px] text-pirate-cyan tracking-[0.2em] uppercase">{label}</label>
        <textarea name={name} value={value as string} onChange={onChange} placeholder={placeholder} rows={3}
          className="bg-[#0a1220] border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-pirate-cyan/40 resize-none transition-all placeholder-white/20" />
      </div>
    );
  }
  return (
    <div className={`flex flex-col gap-1.5 ${span}`}>
      <label className="font-mono text-[10px] text-pirate-cyan tracking-[0.2em] uppercase">{label}</label>
      <input type={type} name={name} value={value as string} onChange={onChange} placeholder={placeholder}
        className="bg-[#0a1220] border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-pirate-cyan/40 transition-all placeholder-white/20" />
    </div>
  );
}

export default function AdminCompetitions() {
  const [items, setItems]             = useState<Competition[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [finalizing, setFinalizing]   = useState(false);
  const [editId, setEditId]           = useState<number | null>(null);
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState({ ...EMPTY_FORM });
  const [editingComp, setEditingComp] = useState<Competition | null>(null);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    const url = params.toString() ? `/competitions?${params}` : '/competitions';
    api.get(url)
       .then(r => setItems(r.data.data ?? r.data))
       .catch(err => setError(messageFromAxiosError(err, 'Erreur chargement.')))
       .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const searchFirstRun = useRef(true);
  useEffect(() => {
    if (searchFirstRun.current) { searchFirstRun.current = false; return; }
    const t = setTimeout(() => load(), 400);
    return () => clearTimeout(t);
  }, [search]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    setForm(f => ({
      ...f,
      [target.name]: target.type === 'checkbox' ? target.checked : target.value,
    }));
  };

  const openCreate = () => {
    setForm({ ...EMPTY_FORM });
    setEditId(null);
    setEditingComp(null);
    setShowForm(true);
  };

  const openEdit = (c: Competition) => {
    setForm({
      title:              c.title,
      description:        c.description        ?? '',
      starts_at:          c.starts_at?.slice(0, 16) ?? '',
      ends_at:            c.ends_at?.slice(0, 16)   ?? '',
      max_teams:          String(c.max_teams        ?? ''),
      max_team_members:   String(c.max_team_members ?? '5'),
      is_public:          c.is_public,
      organizer_name:     c.organizer_name     ?? '',
      first_place_prize:  c.first_place_prize  ?? '',
      second_place_prize: c.second_place_prize ?? '',
      third_place_prize:  c.third_place_prize  ?? '',
      status:             c.status,
    });
    setEditId(c.id);
    setEditingComp(c);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setError('');
    setEditingComp(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const payload = {
      ...form,
      max_teams:        form.max_teams ? Number(form.max_teams) : undefined,
      max_team_members: form.max_team_members ? Number(form.max_team_members) : 5,
    };
    try {
      if (editId) {
        await api.put(`/competitions/${editId}`, payload);
        // ✅ Si le status a changé → appelle aussi /status
        if (editingComp && form.status !== editingComp.status) {
          const allowed = STATUS_TRANSITIONS[editingComp.status] ?? [];
          if (allowed.includes(form.status)) {
            await api.patch(`/competitions/${editId}/status`, { status: form.status });
          }
        }
      } else {
        await api.post('/competitions', payload);
      }
      closeForm();
      load();
    } catch (err) {
      setError(messageFromAxiosError(err, 'Erreur lors de la sauvegarde.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Supprimer "${title}" définitivement ?`)) return;
    try {
      await api.delete(`/competitions/${id}`);
      load();
    } catch (err) {
      setError(messageFromAxiosError(err, 'Erreur suppression.'));
    }
  };

  // ✅ Finalize — bouton dédié dans le formulaire
  const handleFinalize = async () => {
    if (!editId) return;
    if (!confirm('Finaliser cette compétition ? Cela attribuera les badges aux équipes gagnantes.')) return;
    setFinalizing(true);
    try {
      await api.patch(`/competitions/${editId}/status`, { status: 'ended' });
      closeForm();
      load();
    } catch (err) {
      setError(messageFromAxiosError(err, 'Erreur finalisation.'));
    } finally {
      setFinalizing(false);
    }
  };

  return (
    <div className="p-12 min-h-screen">

      <header className="mb-10 flex items-end justify-between">
        <div>
          <div className="font-mono text-xs text-red-400 tracking-[0.3em] mb-3">// ADMIN</div>
          <h1 className="font-serif text-5xl text-white italic">Competitions</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" placeholder="Search title..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-64 bg-[#0a1220] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-pirate-cyan/30 transition-all placeholder-white/20" />
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-pirate-gold hover:bg-pirate-gold/90 text-black px-5 py-3 rounded-lg font-mono text-xs font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(255,183,3,0.15)] transition-all">
            <Plus size={15} /> New Competition
          </button>
        </div>
      </header>

      {error && (
        <p className="font-mono text-red-400 text-xs mb-6 bg-red-400/5 border border-red-400/20 px-4 py-3 rounded-lg">{error}</p>
      )}

      {/* ── Formulaire ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-[#111a2e]/60 border border-white/10 rounded-2xl p-8 mb-10 backdrop-blur-sm"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-serif text-2xl text-pirate-gold">
                {editId ? '✎ Edit Competition' : '+ New Competition'}
              </h2>
              <button onClick={closeForm} className="text-gray-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* General Info */}
              <div>
                <p className="font-mono text-[10px] text-pirate-cyan tracking-[0.3em] uppercase mb-4">// General Info</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Title *" name="title" value={form.title} onChange={onChange} placeholder="The Kraken's Code" colSpan={2} />
                  <Field label="Description" name="description" value={form.description} onChange={onChange} type="textarea" placeholder="Describe the competition..." colSpan={2} />
                  <Field label="Organizer Name" name="organizer_name" value={form.organizer_name} onChange={onChange} placeholder="Pirate Cyber HQ" />
                  <div className="flex items-center gap-3 pt-6">
                    <Field label="Public" name="is_public" value={form.is_public} onChange={onChange} type="checkbox" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-[10px] text-pirate-cyan tracking-[0.2em] uppercase">Competition Status</label>
                      <select
                        name="status"
                        value={form.status}
                        onChange={onChange}
                        disabled={form.status === 'ended'}
                        className="bg-[#0a1220] border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-pirate-cyan/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {ALL_STATUSES.map(s => {
                          const allowed = STATUS_TRANSITIONS[form.status] ?? [];
                          const isDisabled = s !== form.status && !allowed.includes(s);
                          return (
                            <option key={s} value={s} disabled={isDisabled}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                              {isDisabled ? ' (unavailable)' : ''}
                            </option>
                          );
                        })}
                      </select>
                      {form.status === 'ended' && (
                        <p className="font-mono text-[10px] text-gray-500">Competition already ended — status locked.</p>
                      )}
                    </div>

              {/* Dates */}
              <div>
                <p className="font-mono text-[10px] text-pirate-cyan tracking-[0.3em] uppercase mb-4">// Dates & Limits</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Starts At *" name="starts_at" value={form.starts_at} onChange={onChange} type="datetime-local" />
                  <Field label="Ends At *" name="ends_at" value={form.ends_at} onChange={onChange} type="datetime-local" />
                  <Field label="Max Teams" name="max_teams" value={form.max_teams} onChange={onChange} type="number" placeholder="Unlimited" />
                  <Field label="Max Team Members" name="max_team_members" value={form.max_team_members} onChange={onChange} type="number" placeholder="5" />
                </div>
              </div>

              {/* ✅ Status — select dans le formulaire d'édition seulement */}
              {editId && editingComp && (
                <div>
                  <p className="font-mono text-[10px] text-pirate-cyan tracking-[0.3em] uppercase mb-4">// Status</p>
                  <div className="grid md:grid-cols-2 gap-4 items-end">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-[10px] text-pirate-cyan tracking-[0.2em] uppercase">Competition Status</label>
                      <select
                        name="status"
                        value={form.status}
                        onChange={onChange}
                        disabled={editingComp.status === 'ended'}
                        className="bg-[#0a1220] border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-pirate-cyan/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {ALL_STATUSES.map(s => {
                          const allowed = STATUS_TRANSITIONS[editingComp.status] ?? [];
                          const isDisabled = s !== editingComp.status && !allowed.includes(s);
                          return (
                            <option key={s} value={s} disabled={isDisabled}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                              {isDisabled ? ' (unavailable)' : ''}
                            </option>
                          );
                        })}
                      </select>
                      {editingComp.status === 'ended' && (
                        <p className="font-mono text-[10px] text-gray-500">Competition already ended — status locked.</p>
                      )}
                    </div>

                    {/* ✅ Bouton Finalize — seulement si status = active */}
                    {editingComp.status === 'active' && !editingComp.finalized_at && (
                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-[10px] text-red-400 tracking-[0.2em] uppercase">Finalization</label>
                        <button
                          type="button"
                          onClick={handleFinalize}
                          disabled={finalizing}
                          className="flex items-center gap-2 px-5 py-3 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 rounded-lg font-mono text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                        >
                          {finalizing ? <Loader2 size={13} className="animate-spin" /> : <Flag size={13} />}
                          {finalizing ? 'Finalizing...' : 'Finalize & Award Badges'}
                        </button>
                        <p className="font-mono text-[10px] text-gray-500">
                          Ends competition + attributes badges to winning teams.
                        </p>
                      </div>
                    )}

                    {/* ✅ Finalized_at — affiché si déjà finalisé */}
                    {editingComp.finalized_at && (
                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-[10px] text-green-400 tracking-[0.2em] uppercase">Finalized</label>
                        <div className="flex items-center gap-2 px-4 py-3 bg-green-400/5 border border-green-400/20 rounded-lg">
                          <Check size={14} className="text-green-400" />
                          <span className="font-mono text-sm text-green-400">
                            {new Date(editingComp.finalized_at).toLocaleDateString('fr-CA')} at {new Date(editingComp.finalized_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Prizes */}
              <div>
                <p className="font-mono text-[10px] text-pirate-cyan tracking-[0.3em] uppercase mb-4">// Prize Pool</p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[10px] text-pirate-gold tracking-[0.2em] uppercase flex items-center gap-2">
                      <Medal size={12} className="text-pirate-gold" /> 1st Place
                    </label>
                    <input type="text" name="first_place_prize" value={form.first_place_prize} onChange={onChange} placeholder="$1000..."
                      className="bg-[#0a1220] border border-pirate-gold/20 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-pirate-gold/50 transition-all placeholder-white/20" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[10px] text-gray-400 tracking-[0.2em] uppercase flex items-center gap-2">
                      <Medal size={12} className="text-gray-400" /> 2nd Place
                    </label>
                    <input type="text" name="second_place_prize" value={form.second_place_prize} onChange={onChange} placeholder="$500..."
                      className="bg-[#0a1220] border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-white/20 transition-all placeholder-white/20" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[10px] text-orange-400/70 tracking-[0.2em] uppercase flex items-center gap-2">
                      <Medal size={12} className="text-orange-400/70" /> 3rd Place
                    </label>
                    <input type="text" name="third_place_prize" value={form.third_place_prize} onChange={onChange} placeholder="$250..."
                      className="bg-[#0a1220] border border-orange-400/20 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-orange-400/30 transition-all placeholder-white/20" />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting}
                  className="flex items-center gap-2 bg-pirate-gold hover:bg-pirate-gold/90 text-black px-6 py-3 rounded-lg font-mono text-xs font-bold tracking-widest uppercase transition-all disabled:opacity-50">
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  {submitting ? 'Saving...' : (editId ? 'Save Changes' : 'Create Competition')}
                </button>
                <button type="button" onClick={closeForm}
                  className="px-6 py-3 rounded-lg font-mono text-xs text-gray-500 hover:text-white border border-white/10 hover:bg-white/5 tracking-widest uppercase transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Liste ── */}
      {loading ? (
        <div className="flex items-center gap-3 font-mono text-pirate-cyan animate-pulse">
          <span className="w-2 h-2 rounded-full bg-pirate-cyan" /> loading competitions...
        </div>
      ) : (
        <div className="space-y-4">
          {items.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl gap-4">
              <Map className="w-10 h-10 text-white/10" />
              <p className="font-mono text-sm text-white/30 uppercase tracking-widest">No competitions yet.</p>
            </div>
          )}

          {items.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-[#111a2e]/40 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all">
              <div className="flex flex-col md:flex-row md:items-center gap-4">

                <div className="w-10 h-10 rounded-lg bg-pirate-gold/10 flex items-center justify-center shrink-0">
                  <Map size={18} className="text-pirate-gold" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 className="font-serif text-lg text-white truncate">{c.title}</h3>
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase tracking-widest ${STATUS_COLORS[c.status] ?? 'bg-white/10 text-white/50'}`}>
                      {c.status}
                    </span>
                    {!c.is_public && (
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] uppercase tracking-widest bg-white/5 text-white/30 border border-white/10">Private</span>
                    )}
                    {/* ✅ finalized_at badge dans la liste */}
                    {c.finalized_at && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] bg-green-400/10 text-green-400 border border-green-400/20">
                        <Check size={10} /> Finalized
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-[11px] font-mono text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} className="text-pirate-cyan" />
                      {c.starts_at?.slice(0, 10)} → {c.ends_at?.slice(0, 10)}
                    </span>
                    {c.max_teams && (
                      <span className="flex items-center gap-1">
                        <Users size={11} className="text-pirate-cyan" /> Max {c.max_teams} teams
                      </span>
                    )}
                    {c.organizer_name && (
                      <span className="flex items-center gap-1">
                        <Globe size={11} className="text-pirate-cyan" /> {c.organizer_name}
                      </span>
                    )}
                    {c.finalized_at && (
                      <span className="flex items-center gap-1 text-green-400">
                        <Check size={11} /> {new Date(c.finalized_at).toLocaleDateString('fr-CA')}
                      </span>
                    )}
                  </div>

                  {(c.first_place_prize || c.second_place_prize || c.third_place_prize) && (
                    <div className="flex gap-3 mt-2 flex-wrap">
                      {c.first_place_prize && <span className="flex items-center gap-1 text-[11px] font-mono text-pirate-gold"><Trophy size={11} /> {c.first_place_prize}</span>}
                      {c.second_place_prize && <span className="flex items-center gap-1 text-[11px] font-mono text-gray-400"><Medal size={11} /> {c.second_place_prize}</span>}
                      {c.third_place_prize && <span className="flex items-center gap-1 text-[11px] font-mono text-orange-400/70"><Medal size={11} /> {c.third_place_prize}</span>}
                    </div>
                  )}
                </div>

                {/* ✅ Actions simplifiées — plus de dropdown status */}
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => openEdit(c)} className="text-pirate-cyan hover:text-white transition-colors p-2" title="Edit">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(c.id, c.title)} className="text-red-400 hover:text-red-300 transition-colors p-2" title="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}