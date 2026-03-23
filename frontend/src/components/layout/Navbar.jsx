import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";
import { 
  Sun, 
  Moon, 
  LogOut, 
  Bell, 
  Menu,
  X
} from "lucide-react";
import { Button } from "../ui/Button";
import { cn } from "../../utils/ui";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isSaas, isGov, isMinimal } = useUI();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Dashboard", path: user?.role === "Admin" ? "/admin" : user?.role === "Authority" ? "/authority" : "/citizen" },
    { label: "Report Issue", path: "/report", roles: ["Citizen"] },
    { label: "Explore", path: "/explore", roles: ["Citizen"] },
    { label: "Profile", path: "/profile", roles: ["Citizen"] },
    { label: "Notifications", path: "/notifications" },
  ].filter(link => !link.roles || link.roles.includes(user?.role));

  return (
    <nav className={cn(
      "sticky top-4 z-50 w-[96%] max-w-7xl mx-auto mb-8 transition-all duration-300",
      isSaas && "bg-brand-panel/60 backdrop-blur-xl border border-brand-border rounded-full px-6 py-2 shadow-xl",
      isGov && "bg-brand-primary text-white rounded-sm px-6 py-3 shadow-md top-0 w-full max-w-none",
      isMinimal && "bg-white dark:bg-slate-900 border-b-4 border-brand-primary rounded-none px-4 py-2 top-0 w-full max-w-none"
    )}>
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className={cn(
            "w-8 h-8 flex items-center justify-center font-black",
            isSaas && "bg-gradient-to-br from-brand-primary to-purple-500 text-white rounded-lg rotate-3 group-hover:rotate-12 transition-transform",
            isGov && "bg-white text-brand-primary rounded-none",
            isMinimal && "border-2 border-brand-primary text-brand-primary"
          )}>
            D
          </div>
          <span className={cn(
            "font-bold tracking-tighter text-xl hidden sm:block",
            isSaas && "bg-gradient-to-r from-brand-primary to-purple-500 bg-clip-text text-transparent",
            isGov && "text-white uppercase tracking-widest",
            isMinimal && "text-brand-text"
          )}>
            Civic<span className="font-light">Response</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link 
              key={link.path} 
              to={link.path}
              className={cn(
                "px-4 py-2 text-sm font-semibold transition-all",
                location.pathname === link.path 
                  ? (isSaas ? "text-brand-primary bg-brand-primary/10 rounded-full" : isGov ? "bg-white/20" : "border-b-2 border-brand-primary")
                  : (isSaas ? "text-brand-muted hover:text-brand-text" : isGov ? "text-white/80 hover:text-white" : "text-brand-muted hover:text-brand-text")
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleTheme}
            className={cn(isGov && "text-white hover:bg-white/10", isSaas && "rounded-full")}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </Button>

          {/* User Section */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-brand-border/30 ml-2">
              <Link to="/notifications" className="relative">
                <Button variant="ghost" size="sm" className={cn(isGov && "text-white hover:bg-white/10", isSaas && "rounded-full")}>
                  <Bell size={18} />
                </Button>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
              </Link>
              
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className={cn("text-xs font-bold leading-none", isGov ? "text-white" : "text-brand-text")}>{user.name}</span>
                <span className={cn("text-[10px] uppercase tracking-widest", isGov ? "text-white/70" : "text-brand-muted")}>{user.role}</span>
              </div>
              
              <Button 
                variant="danger" 
                size="sm" 
                onClick={logout}
                className={cn(isSaas ? "rounded-full" : isMinimal ? "rounded-none" : "rounded-sm")}
              >
                <LogOut size={16} />
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="primary" size="sm">Login</Button>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu className={isGov ? "text-white" : ""} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden flex flex-col gap-2 pt-4 pb-2"
          >
            {navLinks.map(link => (
              <Link 
                key={link.path} 
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-4 rounded-lg bg-black/5 dark:bg-white/5 font-semibold"
              >
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
