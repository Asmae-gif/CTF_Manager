import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Plus, Trash2, Pencil, X, Check } from "lucide-react";

export default function AdminChallenge() {
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedComp, setSelectedComp] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "", category_id: "", flag: "",
    points: 100, difficulty: "easy", description: "",
    url: "", file: null as File | null, hints: [] as Array<{content: string, cost: number}>,
  });
  const [newHint, setNewHint] = useState({ content: "", cost: 0 });

  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    api.get("/competitions").then(r => {
      const data = r.data.data ?? r.data;
      setCompetitions(data);
      if (data.length > 0) setSelectedComp(data[0].id);
    });
    api.get("/categories").then(r => setCategories(r.data));
  }, []);

  useEffect(() => {
    if (selectedComp) {
      api.get("/competitions/" + selectedComp + "/challenges")
        .then(r => setChallenges(r.data.data ?? r.data));
    }
  }, [selectedComp]);

  const createChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("category_id", form.category_id);
        formData.append("flag", form.flag);
        formData.append("points", form.points.toString());
        formData.append("difficulty", form.difficulty);
        formData.append("description", form.description);
        formData.append("is_active", "1");
        if (form.url) formData.append("url", form.url);
        if (form.file) formData.append("file", form.file);
        
        // Add hints as JSON
        if (form.hints.length > 0) {
          formData.append("hints", JSON.stringify(form.hints));
        }

        await api.post("/competitions/" + selectedComp + "/challenges", formData);

        setForm({ title: "", category_id: "", flag: "", points: 100, difficulty: "easy", description: "", url: "", file: null, hints: [] });
        setNewHint({ content: "", cost: 0 });
        api.get("/competitions/" + selectedComp + "/challenges")
            .then(r => setChallenges(r.data.data ?? r.data));
    } catch (err: any) {
        alert(err?.response?.data?.message || "Erreur creation");
    } finally { setLoading(false); }
};

  const deleteChallenge = async (id: string) => {
    if (!window.confirm("Supprimer ce challenge ?")) return;
    try {
      await api.delete("/challenges/" + id);
      setChallenges(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.message || "Erreur suppression");
    }
  };

  const startEdit = (ch: any) => {
    setEditingId(ch.id);
    setEditForm({
      title: ch.title,
      category_id: ch.category_id ?? ch.category?.id ?? "",
      points: ch.points,
      difficulty: ch.difficulty,
      description: ch.description ?? "",
      flag: ch.flag ?? "",
    });
  };

  const saveEdit = async (id: string) => {
    try {
      const payload: any = { ...editForm };
      if (payload.flag === undefined || payload.flag === null || payload.flag === "") {
        delete payload.flag;
      } else {
        payload.flag = String(payload.flag);
      }

      await api.put("/challenges/" + id, payload);
      setChallenges(prev => prev.map(c => c.id === id ? { ...c, ...payload } : c));
      setEditingId(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Erreur modification");
    }
  };

  const diffColors: any = { easy: "#00CC66", medium: "#E3B341", hard: "#F78166" };

  return (
    <div className="p-8 space-y-8 font-sans">

      {/* Selection competition */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-lg mb-4 text-white">Competition</h2>
        <select
          value={selectedComp}
          onChange={e => setSelectedComp(e.target.value)}
          className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-pirate-cyan/50"
        >
          {competitions.map(c => (
            <option key={c.id} value={c.id}>{c.title ?? c.name}</option>
          ))}
        </select>
      </div>

      {/* Formulaire creation */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-lg mb-6 text-white flex items-center gap-2">
          <Plus size={18} className="text-pirate-cyan" /> Creer un challenge
        </h2>
        <form onSubmit={createChallenge} className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="flex flex-col gap-1">
    <label className="font-mono text-xs text-pirate-cyan uppercase tracking-widest">Titre</label>
    <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
      placeholder="Nom du challenge" required
      className="bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-pirate-cyan/50"
    />
  </div>

  <div className="flex flex-col gap-1">
    <label className="font-mono text-xs text-pirate-cyan uppercase tracking-widest">Categorie</label>
    <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} required
      className="bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-pirate-cyan/50"
    >
      <option value="">-- Choisir --</option>
      {categories.map(c => (
        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
      ))}
    </select>
  </div>

  <div className="flex flex-col gap-1">
    <label className="font-mono text-xs text-pirate-cyan uppercase tracking-widest">Flag</label>
    <input value={form.flag} onChange={e => setForm({...form, flag: e.target.value})}
      placeholder="CTF{...}" required
      className="bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-pirate-cyan/50"
    />
  </div>

  <div className="flex flex-col gap-1">
    <label className="font-mono text-xs text-pirate-cyan uppercase tracking-widest">Points</label>
    <input type="number" value={form.points} onChange={e => setForm({...form, points: parseInt(e.target.value)})}
      min={1} required
      className="bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-pirate-cyan/50"
    />
  </div>

  <div className="flex flex-col gap-1">
    <label className="font-mono text-xs text-pirate-cyan uppercase tracking-widest">Difficulte</label>
    <select value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}
      className="bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-pirate-cyan/50"
    >
      <option value="easy">Easy</option>
      <option value="medium">Medium</option>
      <option value="hard">Hard</option>
    </select>
  </div>

  <div className="flex flex-col gap-1">
    <label className="font-mono text-xs text-pirate-cyan uppercase tracking-widest">Description</label>
    <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
      placeholder="Description du challenge" rows={3}
      className="bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-pirate-cyan/50 resize-none"
    />
  </div>

  {/* URL du site */}
  <div className="flex flex-col gap-1">
    <label className="font-mono text-xs text-pirate-cyan uppercase tracking-widest">
      URL du challenge <span className="text-gray-500">(optionnel)</span>
    </label>
    <input value={form.url} onChange={e => setForm({...form, url: e.target.value})}
      placeholder="https://challenge.ctf.ma"
      className="bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-pirate-cyan/50"
    />
  </div>

  {/* Fichier joint */}
  <div className="flex flex-col gap-1">
    <label className="font-mono text-xs text-pirate-cyan uppercase tracking-widest">
      Fichier joint <span className="text-gray-500">(optionnel)</span>
    </label>
    <input type="file" onChange={e => setForm({...form, file: e.target.files?.[0] || null})}
      className="bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-pirate-cyan/50 file:mr-3 file:bg-pirate-cyan/20 file:text-pirate-cyan file:border-0 file:rounded file:px-3 file:py-1 file:text-xs file:font-mono"
    />
  </div>

  {/* Hints */}
  <div className="md:col-span-2 flex flex-col gap-3">
    <label className="font-mono text-xs text-pirate-cyan uppercase tracking-widest">Indices (Hints)</label>
    
    {/* Ajouter un hint */}
    <div className="flex gap-2 flex-col sm:flex-row">
      <input type="text" value={newHint.content} onChange={e => setNewHint({...newHint, content: e.target.value})}
        placeholder="Contenu du hint..."
        className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-pirate-cyan/50"
      />
      <input type="number" value={newHint.cost} onChange={e => setNewHint({...newHint, cost: Math.max(0, parseInt(e.target.value) || 0)})}
        placeholder="Coût"
        min={0}
        className="w-24 bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-pirate-cyan/50"
      />
      <button type="button" onClick={() => {
        if (newHint.content.trim()) {
          setForm({...form, hints: [...form.hints, newHint]});
          setNewHint({content: "", cost: 0});
        }
      }}
        className="bg-pirate-cyan/20 hover:bg-pirate-cyan/30 text-pirate-cyan px-4 py-3 rounded-lg font-mono text-xs font-bold tracking-widest uppercase transition-all"
      >
        <Plus size={16} />
      </button>
    </div>

    {/* Liste des hints */}
    {form.hints.length > 0 && (
      <div className="flex flex-col gap-2">
        {form.hints.map((hint, idx) => (
          <div key={idx} className="flex items-center justify-between bg-black/30 border border-white/10 rounded-lg px-4 py-2">
            <div className="flex-1">
              <p className="text-white text-sm">{hint.content}</p>
              <p className="text-pirate-cyan text-xs">Coût: {hint.cost} pts</p>
            </div>
            <button type="button" onClick={() => setForm({...form, hints: form.hints.filter((_, i) => i !== idx)})}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    )}
  </div>

  <div className="md:col-span-2">
    <button type="submit" disabled={loading}
      className="bg-pirate-gold hover:bg-pirate-gold/90 text-black px-6 py-3 rounded-lg font-mono text-xs font-bold tracking-widest uppercase transition-all disabled:opacity-50 flex items-center gap-2"
    >
      <Plus size={16} /> {loading ? "Creation..." : "Creer le challenge"}
    </button>
  </div>
</form>
      </div>

      {/* Liste des challenges */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-lg mb-6 text-white">
          Challenges ({challenges.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left font-mono text-xs text-pirate-cyan uppercase tracking-widest pb-3 pr-4">Titre</th>
                <th className="text-left font-mono text-xs text-pirate-cyan uppercase tracking-widest pb-3 pr-4">Categorie</th>
                <th className="text-left font-mono text-xs text-pirate-cyan uppercase tracking-widest pb-3 pr-4">Points</th>
                <th className="text-left font-mono text-xs text-pirate-cyan uppercase tracking-widest pb-3 pr-4">Difficulte</th>
                <th className="text-left font-mono text-xs text-pirate-cyan uppercase tracking-widest pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {challenges.map((ch: any) => (
                <tr key={ch.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  {editingId === ch.id ? (
                    <>
                      <td className="py-3 pr-4">
                        <input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})}
                          className="bg-black/30 border border-pirate-cyan/30 rounded px-2 py-1 text-white text-sm w-full font-mono"
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <select value={editForm.category_id} onChange={e => setEditForm({...editForm, category_id: e.target.value})}
                          className="bg-black/30 border border-pirate-cyan/30 rounded px-2 py-1 text-white text-sm font-mono"
                        >
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </td>
                      <td className="py-3 pr-4">
                        <input type="number" value={editForm.points} onChange={e => setEditForm({...editForm, points: parseInt(e.target.value)})}
                          className="bg-black/30 border border-pirate-cyan/30 rounded px-2 py-1 text-white text-sm w-20 font-mono"
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <select value={editForm.difficulty} onChange={e => setEditForm({...editForm, difficulty: e.target.value})}
                          className="bg-black/30 border border-pirate-cyan/30 rounded px-2 py-1 text-white text-sm font-mono"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => saveEdit(ch.id)} className="text-pirate-cyan hover:text-white transition-colors">
                            <Check size={16} />
                          </button>
                          <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-white transition-colors">
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 pr-4 text-white text-sm font-serif">{ch.title}</td>
                      <td className="py-3 pr-4">
                        <span className="font-mono text-xs text-pirate-cyan">
                          {ch.category?.name ?? ch.category}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="font-serif text-pirate-gold italic">{ch.points} pts</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="font-mono text-xs px-2 py-0.5 rounded"
                          style={{ color: diffColors[ch.difficulty], background: diffColors[ch.difficulty] + "22" }}
                        >
                          {ch.difficulty}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <button onClick={() => startEdit(ch)} className="text-pirate-cyan hover:text-white transition-colors">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => deleteChallenge(ch.id)} className="text-red-400 hover:text-red-300 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {challenges.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center font-mono text-sm text-gray-500">
                    Aucun challenge pour cette competition.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
