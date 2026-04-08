import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, LogOut, Menu, X, Sun, Moon } from "lucide-react";
import { cn } from "../../utils/ui";

export const Navbar = ({ onToggleSidebar, sidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  // Check if on login/register page
  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  const navLinks = user?.role === "Citizen" 
    ? [
        { label: "Dashboard", path: "/citizen" },
        { label: "Report Issue", path: "/report" },
        { label: "Explore", path: "/explore" },
        { label: "Profile", path: "/profile" },
        { label: "Notifications", path: "/notifications" },
      ]
    : user?.role === "Authority"
    ? [
        { label: "Dashboard", path: "/authority" },
        { label: "Reports", path: "/authority", search: "?tab=reports" },
        { label: "Analytics", path: "/authority", search: "?tab=analytics" },
        { label: "Profile", path: "/profile" },
      ]
    : user?.role === "Admin"
    ? [
        { label: "Dashboard", path: "/admin" },
        { label: "Users", path: "/admin", search: "?tab=users" },
        { label: "Reports", path: "/admin", search: "?tab=complaints" },
        { label: "Analytics", path: "/admin", search: "?tab=analytics" },
      ]
    : [];

  const isActiveLink = (link) => location.pathname === link.path && (location.search || "") === (link.search || "");

  return (
    <nav className="sticky top-4 z-50 w-[96%] max-w-7xl mx-auto rounded-full bg-white/90 backdrop-blur-xl border border-gray-200 px-6 py-3 shadow-lg">
      <div className="flex items-center justify-between">
        {/* Logo & Branding */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 flex items-center justify-center font-black text-white bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
              D
            </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold text-white">DCR</div>
            <div className="text-xs text-slate-400">Civic System</div>
          </div>
        </Link>

        {/* Navigation Links - Only for authenticated users */}
        {user && !isAuthPage && (
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={`${link.path}${link.search || ""}`}
                to={`${link.path}${link.search || ""}`}
                className={cn(
                  "px-4 py-2 text-sm font-semibold rounded-lg transition-colors",
                  isActiveLink(link)
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600 hover:text-gray-900">
            <Sun size={18} />
          </button>

          {/* Authenticated User Section */}
          {user && !isAuthPage ? (
            <>
              {/* Notifications */}
              <button
                onClick={() => navigate("/notifications")}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition text-gray-600 hover:text-gray-900"
              >
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </button>

              {/* User Info & Logout */}
              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-gray-200">
                <div className="text-right">
                  <div className="text-xs font-bold text-gray-900">{user.email}</div>
                  <div className="text-xs text-gray-600 uppercase tracking-wider">{user.role}</div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition text-white flex-shrink-0"
                >
                  <LogOut size={16} />
                </motion.button>
              </div>

              {/* Mobile Menu Toggle */}
              <button onClick={onToggleSidebar} className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition text-gray-600">
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </>
          ) : (
            /* Login Button for unauthenticated */
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
              >
                Login
              </motion.button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
