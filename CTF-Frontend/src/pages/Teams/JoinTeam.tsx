import { useState, type FormEvent } from 'react';
import { KeyRound, Anchor, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../../components/Logo';
import { joinTeam, messageFromAxiosError } from "../../api/teams";


export default function JoinTeam() {
  const navigate  = useNavigate();
  const [code, setCode]     = useState('');
  const [error, setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { team } = await joinTeam(code.trim().toUpperCase());
      navigate(`/teams/${team.id}`);
    } catch (err) {
      setError(messageFromAxiosError(err, 'Code invalide ou équipe complète.'));
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
          <h2 className="pirate-header mb-2">Join a Crew</h2>
          <p className="pirate-sub">// enter your secret invite code</p>

          <form className="space-y-8 text-left" onSubmit={handleSubmit}>
            {error && (
              <p className="text-sm text-red-400 font-mono" role="alert">
                {error}
              </p>
            )}

            <div className="relative group">
              <label htmlFor="invite_code" className="pirate-label group-focus-within:text-pirate-gold transition-colors">
                Invite Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-pirate-cyan transition-colors" />
                <input
                  type="text"
                  id="invite_code"
                  placeholder="XXXXXXXX"
                  className="pirate-input pl-12 tracking-[0.3em] uppercase font-mono text-lg"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  maxLength={8}
                  required
                />
              </div>
              <p className="mt-2 text-xs font-mono text-white/30">
                8-character code provided by your crew leader
              </p>
            </div>

            <button type="submit" className="pirate-btn mt-4 group" disabled={loading}>
              <Anchor className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              {loading ? 'Boarding…' : 'Board the Ship'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}