import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">Digital Civic Response System</div>
      <nav className="navbar-links">
        {user && user.role === "Citizen" && (
          <NavLink to="/citizen" className={({ isActive }) => (isActive ? "is-active" : "")}>
            My Complaints
          </NavLink>
        )}
        {user && user.role === "Citizen" && (
          <NavLink to="/report" className={({ isActive }) => (isActive ? "is-active" : "")}>
            Report Issue
          </NavLink>
        )}
        {user && user.role === "Authority" && (
          <NavLink to="/authority" className={({ isActive }) => (isActive ? "is-active" : "")}>
            Authority Dashboard
          </NavLink>
        )}
        {user && user.role === "Admin" && (
          <NavLink to="/admin" className={({ isActive }) => (isActive ? "is-active" : "")}>
            Admin Dashboard
          </NavLink>
        )}
        {user && (
          <NavLink to="/notifications" className={({ isActive }) => (isActive ? "is-active" : "")}>
            Notifications
          </NavLink>
        )}
        {!user && (
          <NavLink to="/login" className={({ isActive }) => (isActive ? "is-active" : "")}>
            Login
          </NavLink>
        )}
        {!user && (
          <NavLink to="/register" className={({ isActive }) => (isActive ? "is-active" : "")}>
            Register
          </NavLink>
        )}
      </nav>
      <div className="navbar-right">
        {user ? (
          <>
            <span className="user-chip">
              {user.name} ({user.role})
            </span>
            <button type="button" className="button button-light" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : null}
      </div>
    </header>
  );
};

export default Navbar;
