import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { useAuth } from "./context/AuthContext";

// Landing
import Landing from "./pages/Landing";

// Auth
import Login    from "./auth/Login";
import Signup   from "./auth/Signup";
import Recover  from "./auth/Recover";
import ResetPassword from './auth/ResetPassword';

// Guards
import AuthGuard  from "./guards/AuthGuard";
import AdminGuard from "./guards/AdminGuard";

// Participant
import Dashboard from "./components/Dashboard";
import Layout from "./components/Layout";
import Competitions from "./pages/competitions/Competitions";
import CompetitionDetail from "./pages/competitions/CompetitionDetail";
import Teams from './pages/Teams/teams';
import CreateTeam from './pages/Teams/CreateTeam';
import JoinTeam from './pages/Teams/JoinTeam';
import TeamDetail from './pages/Teams/TeamDetail';
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import Scoreboard from "./pages/Scoreboard";

// Admin
import AdminLayout    from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminChallenge from "./pages/admin/AdminChallange";
import AdminCategorie from "./pages/admin/AdminCategorie";
import AdminTeams from "./pages/admin/AdminTeams";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCompetitions from "./pages/admin/AdminCompetitions";

// Redirect selon le rôle après login
function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.type?.toLowerCase() === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
}

// Wrapper pour passer onSelect via navigate
function CompetitionsPage() {
  const navigate = useNavigate();
  return <Competitions onSelect={(id) => navigate(`/competitions/${id}`)} />;
}

export default function App() {
  return (
    <Router>
      <Routes>

        {/* ── Landing page — publique ── */}
        <Route path="/" element={<Landing />} />

        {/* ── Auth — sans sidebar ── */}
        <Route path="/login"   element={<Login />} />
        <Route path="/signup"  element={<Signup />} />
        <Route path="/recover" element={<Recover />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<AuthGuard />}>

          {/* ── ADMIN ── */}
          <Route element={<AdminGuard />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard"    element={<AdminDashboard />} />
              <Route path="/admin/challenges"   element={<AdminChallenge />} />
              <Route path="/admin/categories"   element={<AdminCategorie />} />
              <Route path="/admin/teams"        element={<AdminTeams />} />
              <Route path="/admin/users"        element={<AdminUsers />} />
              <Route path="/admin/competitions" element={<AdminCompetitions />} />
              <Route path="/admin/leaderboard"  element={<Leaderboard />} />
              <Route path="/admin/scoreboard" element={<Scoreboard />} />
              <Route path="/admin/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* ── Pages avec Sidebar ── */}
          <Route element={<Layout />}>
            <Route path="/dashboard"        element={<Dashboard />} />
            <Route path="/competitions"     element={<CompetitionsPage />} />
            <Route path="/competitions/:id" element={<CompetitionDetail />} />
            <Route path="/teams"            element={<Teams />} />
            <Route path="/teams/create"     element={<CreateTeam />} />
            <Route path="/teams/join"       element={<JoinTeam />} />
            <Route path="/teams/:id"        element={<TeamDetail />} />
            <Route path="/profile"          element={<Profile />} />
            <Route path="/leaderboard"      element={<Leaderboard />} />
            <Route path="/scoreboard" element={<Scoreboard />} />
          </Route>

        </Route>

      </Routes>
    </Router>
  );
}