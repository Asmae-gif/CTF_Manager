import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminGuard() {
  const { user, loading } = useAuth();

  if (loading) return <div>Chargement de l'authentification...</div>;

  // Ce message s'affichera directement sur ta page web si l'accès est refusé
  if (!user || user.type?.toLowerCase() !== 'admin') {
    console.error("Accès refusé. Type utilisateur détecté :", user?.type);
    return (
      <div style={{ color: 'red', padding: '20px' }}>
        <h1>Accès Refusé</h1>
        <p>Tu n'es pas admin. Ton type est : {user?.type || 'Inconnu'}</p>
        <Navigate to="/dashboard" replace />
      </div>
    );
  }

  return <Outlet />;
}