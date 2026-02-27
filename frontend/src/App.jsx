import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CitizenDashboard from "./pages/CitizenDashboard";
import ReportComplaintPage from "./pages/ReportComplaintPage";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotificationsPage from "./pages/NotificationsPage";

const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "Citizen") return <Navigate to="/citizen" replace />;
  if (user.role === "Authority") return <Navigate to="/authority" replace />;
  return <Navigate to="/admin" replace />;
};

const App = () => {
  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute roles={["Citizen"]} />}>
            <Route path="/citizen" element={<CitizenDashboard />} />
            <Route path="/report" element={<ReportComplaintPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={["Authority"]} />}>
            <Route path="/authority" element={<AuthorityDashboard />} />
          </Route>

          <Route element={<ProtectedRoute roles={["Admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route element={<ProtectedRoute roles={["Citizen", "Authority", "Admin"]} />}>
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
