import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Users, Ban, Shield, ShieldCheck, Trash2, Eye, Pencil, Check, X } from "lucide-react";

export default function AdminTeams() {
  const [teams, setTeams] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
const [memberEditForm, setMemberEditForm] = useState({ username: "", email: "", role: "" });
  const loadTeams = () => {
    api.get("/teams").then(r => setTeams(r.data.data ?? r.data)).catch(() => {});
  };

  useEffect(() => { loadTeams(); }, []);

  const viewTeam = async (team: any) => {
    setSelected(team);
    try {
      const res = await api.get("/teams/" + team.id);
      setMembers(res.data.members ?? []);
    } catch { setMembers([]); }
  };

  const banTeam = async (teamId: string) => {
    if (!window.confirm("Bannir cette equipe ?")) return;
    try {
      await api.post("/admin/ban/team/" + teamId);
      alert("Equipe bannie !");
      loadTeams();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Erreur");
    }
  };

  const unbanTeam = async (teamId: string) => {
    if (!window.confirm("Debannir cette equipe ?")) return;
    try {
      await api.post("/admin/unban/team/" + teamId);
      alert("Equipe debannie !");
      loadTeams();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Erreur");
    }
  };

  const banIp = async (ip: string) => {
    if (!window.confirm("Bannir l'IP " + ip + " ?")) return;
    try {
      await api.post("/admin/ban/ip/" + ip);
      alert("IP bannie !");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Erreur");
    }
  };

  const unbanIp = async (ip: string) => {
    if (!window.confirm("Debannir l'IP " + ip + " ?")) return;
    try {
      await api.post("/admin/unban/ip/" + ip);
      alert("IP debannie !");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Erreur");
    }
  };

  const removeMember = async (teamId: string, userId: string) => {
    if (!window.confirm("Retirer ce membre ?")) return;
    try {
      await api.delete("/teams/" + teamId + "/members/" + userId);
      setMembers(prev => prev.filter(m => m.id !== userId));
    } catch (err: any) {
      alert(err?.response?.data?.message || "Erreur");
    }
  };

  return (
    <div className="p-8 space-y-8 font-sans">

      {/* Liste des equipes */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-lg mb-6 text-white flex items-center gap-2">
          <Users size={18} className="text-pirate-cyan" /> Teams ({teams.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left font-mono text-xs text-pirate-cyan uppercase tracking-widest pb-3 pr-4">Nom</th>
                <th className="text-left font-mono text-xs text-pirate-cyan uppercase tracking-widest pb-3 pr-4">Leader</th>
                <th className="text-left font-mono text-xs text-pirate-cyan uppercase tracking-widest pb-3 pr-4">Score</th>
                <th className="text-left font-mono text-xs text-pirate-cyan uppercase tracking-widest pb-3 pr-4">Competition</th>
                <th className="text-left font-mono text-xs text-pirate-cyan uppercase tracking-widest pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team: any) => (
                <tr key={team.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 pr-4 text-white text-sm font-serif">{team.name}</td>
                  <td className="py-3 pr-4">
                    <span className="font-mono text-xs text-pirate-cyan">
                      {team.leader?.username ?? "-"}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="font-serif text-pirate-gold italic">{team.score} pts</span>
                  </td>
                  <td className="py-3 pr-4 text-gray-400 text-xs font-mono">
                    {team.competition?.title ?? "Aucune"}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <button onClick={() => viewTeam(team)} className="text-pirate-cyan hover:text-white transition-colors" title="Voir membres">
                        <Eye size={15} />
                      </button>
                      <button onClick={() => banTeam(team.id)} className="text-red-400 hover:text-red-300 transition-colors" title="Bannir equipe">
                        <Ban size={15} />
                      </button>
                      <button onClick={() => unbanTeam(team.id)} className="text-green-400 hover:text-green-300 transition-colors" title="Debannir equipe">
                        <Shield size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {teams.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center font-mono text-sm text-gray-500">
                    Aucune equipe.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail equipe + membres */}
 {selected && (
  <div className="glass rounded-2xl p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="font-display text-lg text-white flex items-center gap-2">
        <Users size={18} className="text-pirate-gold" /> Membres — {selected.name}
      </h2>
      <button
        onClick={async () => {
          if (!window.confirm("Supprimer l'equipe " + selected.name + " ?")) return;
          try {
            await api.delete("/teams/" + selected.id);
            setSelected(null);
            setMembers([]);
            loadTeams();
            alert("Equipe supprimee !");
          } catch (err: any) {
            alert(err?.response?.data?.message || "Erreur");
          }
        }}
        className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-widest hover:bg-red-500/30 transition-all flex items-center gap-2"
      >
        <Trash2 size={14} /> Supprimer equipe
      </button>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left font-mono text-xs text-pirate-cyan uppercase tracking-widest pb-3 pr-4">Username</th>
            <th className="text-left font-mono text-xs text-pirate-cyan uppercase tracking-widest pb-3 pr-4">Email</th>
            <th className="text-left font-mono text-xs text-pirate-cyan uppercase tracking-widest pb-3 pr-4">Role</th>
            <th className="text-left font-mono text-xs text-pirate-cyan uppercase tracking-widest pb-3 pr-4">Score</th>
            <th className="text-left font-mono text-xs text-pirate-cyan uppercase tracking-widest pb-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member: any) => (
            <tr key={member.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              {editingMemberId === member.id ? (
                <>
                  <td className="py-3 pr-4">
                    <input
                      value={memberEditForm.username}
                      onChange={e => setMemberEditForm({...memberEditForm, username: e.target.value})}
                      className="bg-black/30 border border-pirate-cyan/30 rounded px-2 py-1 text-white text-sm w-full font-mono"
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <input
                      value={memberEditForm.email}
                      onChange={e => setMemberEditForm({...memberEditForm, email: e.target.value})}
                      className="bg-black/30 border border-pirate-cyan/30 rounded px-2 py-1 text-white text-sm w-full font-mono"
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <select
                      value={memberEditForm.role}
                      onChange={e => setMemberEditForm({...memberEditForm, role: e.target.value})}
                      className="bg-black/30 border border-pirate-cyan/30 rounded px-2 py-1 text-white text-sm font-mono"
                    >
                      <option value="member">Member</option>
                      <option value="leader">Leader</option>
                    </select>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="font-serif text-pirate-gold italic">{member.score} pts</span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          try {
                            await api.put("/admin/members/" + member.id, memberEditForm);
                            if (memberEditForm.role !== member.pivot?.role) {
                              await api.put("/teams/" + selected.id + "/members/" + member.id, { role: memberEditForm.role });
                            }
                            setMembers(prev => prev.map(m =>
                              m.id === member.id
                                ? { ...m, username: memberEditForm.username, email: memberEditForm.email, pivot: { ...m.pivot, role: memberEditForm.role } }
                                : memberEditForm.role === "leader" && m.pivot?.role === "leader"
                                  ? { ...m, pivot: { ...m.pivot, role: "member" } }
                                  : m
                            ));
                            setEditingMemberId(null);
                          } catch (err: any) {
                            alert(err?.response?.data?.message || "Erreur modification");
                          }
                        }}
                        className="text-pirate-cyan hover:text-white transition-colors"
                      >
                        <Check size={16} />
                      </button>
                      <button onClick={() => setEditingMemberId(null)} className="text-gray-500 hover:text-white transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td className="py-3 pr-4 text-white text-sm font-serif">{member.username}</td>
                  <td className="py-3 pr-4 text-gray-400 text-xs font-mono">{member.email ?? "-"}</td>
                  <td className="py-3 pr-4">
                    <span className={"font-mono text-xs px-2 py-0.5 rounded " + (member.pivot?.role === "leader" ? "text-pirate-gold bg-pirate-gold/10" : "text-pirate-cyan bg-pirate-cyan/10")}>
                      {member.pivot?.role ?? "member"}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="font-serif text-pirate-gold italic">{member.score} pts</span>
                  </td>
                  <td className="py-3">
    <div className="flex items-center gap-3">
        <button
            onClick={() => {
                setEditingMemberId(member.id);
                setMemberEditForm({
                    username: member.username,
                    email: member.email ?? "",
                    role: member.pivot?.role ?? "member",
                });
            }}
            className="text-pirate-cyan hover:text-white transition-colors"
            title="Modifier"
        >
            <Pencil size={15} />
        </button>
        <button
            onClick={() => removeMember(selected.id, member.id)}
            className="text-red-400 hover:text-red-300 transition-colors"
            title="Retirer"
        >
            <Trash2 size={15} />
        </button>
        <button
            onClick={() => {
                const ip = window.prompt("IP a bannir pour " + member.username + " :");
                if (ip) banIp(ip);
            }}
            className="text-orange-400 hover:text-orange-300 transition-colors"
            title="Bannir IP"
        >
            <Ban size={15} />
        </button>
        <button
            onClick={() => {
                const ip = window.prompt("IP a debannir pour " + member.username + " :");
                if (ip) unbanIp(ip);
            }}
            className="text-green-400 hover:text-green-300 transition-colors"
            title="Debannir IP"
        >
            <ShieldCheck size={15} />
        </button>
    </div>
</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}
      {/* Gestion IP */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-lg mb-6 text-white flex items-center gap-2">
          <Ban size={18} className="text-red-400" /> Gestion des IPs
        </h2>
        <div className="flex gap-4 flex-wrap">
          <div className="flex flex-col gap-2 flex-1 min-w-[250px]">
            <label className="font-mono text-xs text-pirate-cyan uppercase tracking-widest">Adresse IP</label>
            <div className="flex gap-2">
              <input
                id="ip-input"
                placeholder="127.0.0.1"
                className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-pirate-cyan/50"
              />
              <button
                onClick={() => {
                  const ip = (document.getElementById("ip-input") as HTMLInputElement).value;
                  if (ip) banIp(ip);
                }}
                className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg font-mono text-xs uppercase tracking-widest hover:bg-red-500/30 transition-all"
              >
                Bannir
              </button>
              <button
                onClick={() => {
                  const ip = (document.getElementById("ip-input") as HTMLInputElement).value;
                  if (ip) unbanIp(ip);
                }}
                className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg font-mono text-xs uppercase tracking-widest hover:bg-green-500/30 transition-all"
              >
                Debannir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}