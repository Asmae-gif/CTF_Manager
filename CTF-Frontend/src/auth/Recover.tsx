import { useState, type FormEvent } from 'react';
import { Mail, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';
import { forgotPassword, messageFromAxiosError } from '../api/auth';

export default function Recover() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await forgotPassword({ email: email.trim() });
      setSuccess(res.message);
    } catch (err) {
      setError(messageFromAxiosError(err, "Impossible d'envoyer le lien."));
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
        <Logo />

        <div className="pirate-card p-10 md:p-14 text-center">
          <h2 className="pirate-header mb-2">Lost Your Map?</h2>
          <p className="pirate-sub">// recover access to your treasure</p>

          <form className="space-y-8 text-left" onSubmit={handleSubmit}>
            {error ? (
              <p className="text-sm text-red-400 font-mono" role="alert">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="text-sm text-emerald-400 font-mono" role="status">
                {success}
              </p>
            ) : null}

            <div className="relative group">
              <label htmlFor="recover_email" className="pirate-label">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input
                  type="email"
                  placeholder="captain@pirate.cyber"
                  className="pirate-input pl-12"
                  id="recover_email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="pirate-btn mt-4" disabled={loading}>
              <Send className="w-5 h-5" />
              {loading ? 'Sending…' : 'Send Recovery Beacon'}
            </button>
          </form>
        </div>

        <div className="mt-12 text-center">
          <p className="font-mono text-sm text-white/60">
            Remembered the route?{' '}
            <Link to="/login" className="text-pirate-gold hover:underline">
              Back to sign in →
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
