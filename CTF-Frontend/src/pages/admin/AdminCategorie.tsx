import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Plus, Trash2, Pencil, X, Check } from "lucide-react";

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    icon: "",
    description: "",
  });

  const [editForm, setEditForm] = useState<any>({});

  const loadCategories = () => {
    api.get("/categories").then(r => setCategories(r.data.data ?? r.data));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/categories", form);
      setForm({ name: "", slug: "", icon: "", description: "" });
      loadCategories();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Erreur creation");
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!window.confirm("Supprimer cette categorie ?")) return;
    try {
      await api.delete("/categories/" + id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.message || "Erreur suppression");
    }
  };

  const startEdit = (cat: any) => {
    setEditingId(cat.id);
    setEditForm({
      name: cat.name ?? "",
      slug: cat.slug ?? "",
      icon: cat.icon ?? "",
      description: cat.description ?? "",
    });
  };

  const saveEdit = async (id: string) => {
    try {
      await api.put("/categories/" + id, editForm);
      setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...editForm } : c)));
      setEditingId(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Erreur modification");
    }
  };

  return (
    <div className="p-8 space-y-8 font-sans">
      {/* Formulaire creation */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-lg mb-6 text-white flex items-center gap-2">
          <Plus size={18} className="text-pirate-cyan" /> Creer une categorie
        </h2>

        <form onSubmit={createCategory} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs text-pirate-cyan uppercase tracking-widest">Nom</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Nom de la categorie"
              required
              className="bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-pirate-cyan/50"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs text-pirate-cyan uppercase tracking-widest">
              Slug <span className="text-gray-500">(optionnel)</span>
            </label>
            <input
              value={form.slug}
              onChange={e => setForm({ ...form, slug: e.target.value })}
              placeholder="web, crypto, ..."
              className="bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-pirate-cyan/50"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs text-pirate-cyan uppercase tracking-widest">
              Icone <span className="text-gray-500">(optionnel)</span>
            </label>
            <input
              value={form.icon}
              onChange={e => setForm({ ...form, icon: e.target.value })}
              placeholder="emoji ou nom d'icone"
              className="bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-pirate-cyan/50"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs text-pirate-cyan uppercase tracking-widest">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Description de la categorie"
              rows={3}
              className="bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-pirate-cyan/50 resize-none"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-pirate-gold hover:bg-pirate-gold/90 text-black px-6 py-3 rounded-lg font-mono text-xs font-bold tracking-widest uppercase transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Plus size={16} /> {loading ? "Creation..." : "Creer la categorie"}
            </button>
          </div>
        </form>
      </div>

      {/* Liste des categories */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-lg mb-6 text-white">
          Categories ({categories.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left font-mono text-xs text-pirate-cyan uppercase tracking-widest pb-3 pr-4">Nom</th>
                <th className="text-left font-mono text-xs text-pirate-cyan uppercase tracking-widest pb-3 pr-4">Slug</th>
                <th className="text-left font-mono text-xs text-pirate-cyan uppercase tracking-widest pb-3 pr-4">Icone</th>
                <th className="text-left font-mono text-xs text-pirate-cyan uppercase tracking-widest pb-3 pr-4">Description</th>
                <th className="text-left font-mono text-xs text-pirate-cyan uppercase tracking-widest pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat: any) => (
                <tr key={cat.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  {editingId === cat.id ? (
                    <>
                      <td className="py-3 pr-4">
                        <input
                          value={editForm.name}
                          onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                          className="bg-black/30 border border-pirate-cyan/30 rounded px-2 py-1 text-white text-sm w-full font-mono"
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <input
                          value={editForm.slug}
                          onChange={e => setEditForm({ ...editForm, slug: e.target.value })}
                          className="bg-black/30 border border-pirate-cyan/30 rounded px-2 py-1 text-white text-sm w-full font-mono"
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <input
                          value={editForm.icon}
                          onChange={e => setEditForm({ ...editForm, icon: e.target.value })}
                          className="bg-black/30 border border-pirate-cyan/30 rounded px-2 py-1 text-white text-sm w-20 font-mono"
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <input
                          value={editForm.description}
                          onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                          className="bg-black/30 border border-pirate-cyan/30 rounded px-2 py-1 text-white text-sm w-full font-mono"
                        />
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => saveEdit(cat.id)} className="text-pirate-cyan hover:text-white transition-colors">
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
                      <td className="py-3 pr-4 text-white text-sm font-serif">{cat.name}</td>
                      <td className="py-3 pr-4">
                        <span className="font-mono text-xs text-pirate-cyan">{cat.slug ?? "-"}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="font-serif text-pirate-gold italic">{cat.icon ?? "-"}</span>
                      </td>
                      <td className="py-3 pr-4 text-gray-400 text-sm font-mono">{cat.description ?? "-"}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <button onClick={() => startEdit(cat)} className="text-pirate-cyan hover:text-white transition-colors">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => deleteCategory(cat.id)} className="text-red-400 hover:text-red-300 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center font-mono text-sm text-gray-500">
                    Aucune categorie.
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
