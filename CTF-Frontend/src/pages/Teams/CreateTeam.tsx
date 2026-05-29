import { useState, type FormEvent } from 'react';
import { Swords, FileText, Image, Anchor, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../../components/Logo';
import { createTeam, messageFromAxiosError } from '../../api/teams';

export default function CreateTeam() {
  const navigate = useNavigate();
  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [avatar, setAvatar]           = useState('');
  const [error, setError]             = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const team = await createTeam({
        name: name.trim(),
        description: description.trim() || undefined,
        avatar: avatar.trim() || undefined,
      });
      navigate(`/teams/${team.id}`);
    } catch (err) {
      setError(messageFromAxiosError(err, 'Impossible de créer l\'équipe.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-transparent">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-xl"
      >
        <button
          onClick={() => navigate('/teams')}
          className="flex items-center gap-2 text-gray-400 hover:text-pirate-cyan font-mono text-xs uppercase tracking-widest transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to crews
        </button>
        <Logo />

        <div className="pirate-card p-10 md:p-14 text-center">
          <h2 className="pirate-header mb-2">Form Your Crew</h2>
          <p className="pirate-sub">// assemble your pirate squad</p>

          <form className="space-y-8 text-left" onSubmit={handleSubmit}>
            {error && (
              <p className="text-sm text-red-400 font-mono" role="alert">
                {error}
              </p>
            )}

            {/* Nom de l'équipe */}
            <div className="relative group">
              <label htmlFor="team_name" className="pirate-label group-focus-within:text-pirate-gold transition-colors">
                Crew Name
              </label>
              <div className="relative">
                <Swords className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-pirate-cyan transition-colors" />
                <input
                  type="text"
                  id="team_name"
                  placeholder="The Jolly Hackers"
                  className="pirate-input pl-12"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={80}
                />
              </div>
            </div>

            {/* Description */}
            <div className="relative group">
              <label htmlFor="team_desc" className="pirate-label group-focus-within:text-pirate-gold transition-colors">
                Description <span className="text-white/30">(optional)</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-5 h-5 text-white/20 group-focus-within:text-pirate-cyan transition-colors" />
                <textarea
                  id="team_desc"
                  placeholder="What makes your crew legendary..."
                  className="pirate-input pl-12 resize-none min-h-25"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                />
              </div>
            </div>

            {/* Avatar URL */}
            <div className="relative group">
              <label htmlFor="team_avatar" className="pirate-label group-focus-within:text-pirate-gold transition-colors">
                Avatar URL <span className="text-white/30">(optional)</span>
              </label>
              <div className="relative">
                <Image className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-pirate-cyan transition-colors" />
                <input
                  type="url"
                  id="team_avatar"
                  placeholder="https://..."
                  className="pirate-input pl-12"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="pirate-btn mt-4 group" disabled={loading}>
              <Anchor className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              {loading ? 'Raising the flag…' : 'Create Crew'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}