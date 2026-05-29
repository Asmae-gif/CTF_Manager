import { useState, type FormEvent, useEffect } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { messageFromAxiosError } from '../api/auth';

export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Quand l'utilisateur est connecté après le login, on redirige
  useEffect(() => {
    if (shouldRedirect && user) {
      const destination = user.type?.toLowerCase() === 'admin' ? '/admin/dashboard' : '/dashboard';
      console.log('🚀 Navigating to:', destination, 'User:', user);
      navigate(destination, { replace: true });
    }
  }, [shouldRedirect, user, navigate]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      console.log('🔄 Attempting login with email:', email.trim());
      const res = await login({ email: email.trim(), password });
      console.log('✅ Login response received:', res);
      
      if (!res.user) {
        throw new Error('Pas de données utilisateur reçues');
      }
      
      // Marquer qu'on doit rediriger, le useEffect va s'occuper du reste
      setShouldRedirect(true);
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(messageFromAxiosError(err, 'Connexion impossible.'));
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
          <h2 className="pirate-header mb-2">Board the Ship</h2>
          <p className="pirate-sub">// access your captain's quarters</p>

          <form className="space-y-8 text-left" onSubmit={handleSubmit}>
            {error ? (
              <p className="text-sm text-red-400 font-mono" role="alert">
                {error}
              </p>
            ) : null}

            <div className="relative group">
              <label
                htmlFor="email_input"
                className="pirate-label group-focus-within:text-pirate-gold transition-colors"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-pirate-cyan transition-colors" />
                <input
                  type="email"
                  placeholder="captain@pirate.cyber"
                  className="pirate-input pl-12"
                  id="email_input"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="relative group">
              <label
                htmlFor="password_input"
                className="pirate-label group-focus-within:text-pirate-gold transition-colors"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-pirate-cyan transition-colors" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="pirate-input pl-12"
                  id="password_input"
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end mt-4">
                <Link to="/recover" className="pirate-link">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className="pirate-btn mt-4 group"
              disabled={loading}
            >
              <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              {loading ? 'Boarding…' : 'Set Sail'}
            </button>
          </form>
        </div>

        <div className="mt-12 text-center">
          <p className="font-mono text-sm text-white/60">
            New to the crew?{' '}
            <Link to="/signup" className="text-pirate-gold hover:underline">
              Join the adventure →
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
