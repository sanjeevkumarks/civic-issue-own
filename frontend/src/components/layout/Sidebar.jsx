import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { 
  LayoutDashboard, 
  FileText, 
  Compass, 
  User, 
  Bell, 
  Settings,
  BarChart3,
  Users,
  Menu,
  X,
  LogOut,
  Building2
} from "lucide-react";

const menuItems = {
  Citizen: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/citizen" },
    { label: "Report Issue", icon: FileText, path: "/report" },
    { label: "Explore", icon: Compass, path: "/explore" },
    { label: "Profile", icon: User, path: "/profile" },
  ],
  Authority: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/authority" },
    { label: "Reports", icon: FileText, path: "/authority", search: "?tab=reports" },
    { label: "Analytics", icon: BarChart3, path: "/authority", search: "?tab=analytics" },
    { label: "Profile", icon: User, path: "/profile" },
  ],
  Admin: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { label: "Users", icon: Users, path: "/admin", search: "?tab=users" },
    { label: "Reports", icon: FileText, path: "/admin", search: "?tab=complaints" },
    { label: "Analytics", icon: BarChart3, path: "/admin", search: "?tab=analytics" },
    { label: "Settings", icon: Settings, path: "/admin", search: "?tab=departments" },
  ]
};

const isMenuItemActive = (location, item) => {
  const currentSearch = location.search || "";
  const itemSearch = item.search || "";
  return location.pathname === item.path && currentSearch === itemSearch;
};

export const Sidebar = ({ open, onToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const items = menuItems[user?.role] || [];

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onToggle}
          className="fixed inset-0 bg-black/50 md:hidden z-40"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: open ? 0 : -300 }}
        transition={{ duration: 0.3 }}
        className="fixed md:static md:translate-x-0 top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40 flex flex-col overflow-y-auto"
      >
        {/* Logo Area */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Building2 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">DCR</h1>
              <p className="text-xs text-gray-500">Civic System</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="md:hidden p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-6 space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = isMenuItemActive(location, item);
            return (
              <Link
                key={`${item.path}${item.search || ""}`}
                to={`${item.path}${item.search || ""}`}
                onClick={() => {
                  if (open && window.innerWidth < 768) onToggle();
                }}
              >
                <motion.button
                  whileHover={{ x: 4 }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-600 border-l-4 border-blue-500"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-sm">{item.label}</span>
                </motion.button>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 space-y-2 mt-auto">
          <Link to="/notifications">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-all">
              <Bell size={20} />
              <span className="text-sm">Notifications</span>
            </button>
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 font-medium transition-all"
          >
            <LogOut size={20} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
};
