import { useState, type FormEvent, useEffect } from 'react';
import { Mail, Lock, User, ShieldCheck, Anchor } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { messageFromAxiosError } from '../api/auth';

export default function Signup() {
  const navigate = useNavigate();
  const { register, user } = useAuth();
  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Quand l'utilisateur est inscrit et dans le contexte, on redirige
  useEffect(() => {
    if (shouldRedirect && user) {
      console.log('🚀 Redirecting after signup. User:', user);
      navigate('/dashboard', { replace: true });
    }
  }, [shouldRedirect, user, navigate]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (password !== passwordConfirmation) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      console.log('🔄 Attempting signup with email:', email.trim());
      await register({
        username: username.trim(),
        fullname: fullname.trim() || undefined,
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
      });
      console.log('✅ Signup successful');
      // Marquer qu'on doit rediriger
      setShouldRedirect(true);
    } catch (err) {
      console.error('❌ Signup error:', err);
      setError(messageFromAxiosError(err, 'Inscription impossible.'));
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
          <h2 className="pirate-header mb-2">Join the Crew</h2>
          <p className="pirate-sub">// forge your pirate identity</p>

          <form className="space-y-6 text-left" onSubmit={handleSubmit}>
            {error ? (
              <p className="text-sm text-red-400 font-mono" role="alert">
                {error}
              </p>
            ) : null}

            <div className="relative group">
              <label htmlFor="piratename_input" className="pirate-label">
                Pirate Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input
                  type="text"
                  placeholder="blackbeard"
                  className="pirate-input pl-12"
                  id="piratename_input"
                  name="username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={1}
                  maxLength={30}
                  pattern="[A-Za-z0-9_-]+"
                  title="Lettres, chiffres, tirets et underscores uniquement (alpha_dash)"
                />
              </div>
            </div>

            <div className="relative group">
              <label htmlFor="fullname_input" className="pirate-label">
                Full Name
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input
                  type="text"
                  placeholder="Edward Teach"
                  className="pirate-input pl-12"
                  id="fullname_input"
                  name="fullname"
                  autoComplete="name"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                />
              </div>
            </div>

            <div className="relative group border-l-2 border-pirate-cyan pl-4 -ml-4">
              <label htmlFor="email_signup" className="pirate-label text-pirate-cyan">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input
                  type="email"
                  placeholder="captain@pirate.cyber"
                  className="pirate-input pl-12"
                  id="email_signup"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="relative group">
              <label htmlFor="pass_signup" className="pirate-label">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="pirate-input pl-12"
                  id="pass_signup"
                  name="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div className="relative group">
              <label htmlFor="confirm_signup" className="pirate-label">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="pirate-input pl-12"
                  id="confirm_signup"
                  name="password_confirmation"
                  autoComplete="new-password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
            </div>

            <button type="submit" className="pirate-btn mt-4" disabled={loading}>
              <Anchor className="w-5 h-5" />
              {loading ? 'Enlisting…' : 'Enlist Now'}
            </button>
          </form>
        </div>

        <div className="mt-12 text-center">
          <p className="font-mono text-sm text-white/60">
            Already a captain?{' '}
            <Link to="/login" className="text-pirate-gold hover:underline">
              Sign in →
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
