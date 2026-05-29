import { useState, type FormEvent } from 'react';
import { Lock, Check } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';
import { resetPassword, messageFromAxiosError } from '../api/auth';

export default function ResetPassword() {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();

  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const [password, setPassword]               = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError]                     = useState<string | null>(null);
  const [success, setSuccess]                 = useState(false);
  const [loading, setLoading]                 = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirm,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 5173);
    } catch (err) {
      setError(messageFromAxiosError(err, 'Impossible de réinitialiser.'));
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
          <h2 className="pirate-header mb-2">New Secret Code</h2>
          <p className="pirate-sub">// set your new password</p>

          {success ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-12 h-12 rounded-full bg-green-400/10 border border-green-400/20 flex items-center justify-center">
                <Check className="w-6 h-6 text-green-400" />
              </div>
              <p className="font-mono text-sm text-green-400">
                Password updated! Redirecting to login...
              </p>
            </div>
          ) : (
            <form className="space-y-6 text-left mt-6" onSubmit={handleSubmit}>
              {error && (
                <p className="text-sm text-red-400 font-mono" role="alert">{error}</p>
              )}

              {/* Email — pré-rempli depuis l'URL */}
              <div className="flex flex-col gap-1.5">
                <label className="pirate-label">Email</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="pirate-input opacity-60 cursor-not-allowed"
                />
              </div>

              {/* Nouveau mot de passe */}
              <div className="relative group">
                <label className="pirate-label">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="pirate-input pl-12"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                </div>
              </div>

              {/* Confirmation */}
              <div className="relative group">
                <label className="pirate-label">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="pirate-input pl-12"
                    value={passwordConfirm}
                    onChange={e => setPasswordConfirm(e.target.value)}
                    minLength={8}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="pirate-btn mt-4" disabled={loading}>
                <Lock className="w-5 h-5" />
                {loading ? 'Saving...' : 'Set New Password'}
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link to="/login" className="font-mono text-sm text-white/60 hover:text-pirate-gold">
            ← Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}