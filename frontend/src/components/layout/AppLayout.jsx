import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { useUI } from "../../context/UIContext";
import { cn } from "../../utils/ui";
import { motion } from "framer-motion";

export const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  
  // Hide sidebar and navbar for auth pages
  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  return (
    <div className={cn("min-h-screen flex bg-white", isAuthPage && "bg-gradient-to-br from-gray-50 via-white to-gray-100")}>
      {/* Modern Sidebar - Hidden on auth pages */}
      {!isAuthPage && <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Hidden on auth pages */}
        {!isAuthPage && <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />}

        {/* Main Content */}
        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "flex-1 overflow-y-auto",
            !isAuthPage && "p-6 md:p-8 bg-gradient-to-br from-gray-50 to-white",
            isAuthPage && "bg-gradient-to-br from-gray-50 via-white to-gray-100"
          )}
        >
          <div className={cn(!isAuthPage && "max-w-7xl mx-auto")}>
            {children}
          </div>
        </motion.main>

        {/* Footer - Hidden on auth pages */}
        {!isAuthPage && (
          <footer className="border-t border-gray-200 bg-white py-4 px-6 md:px-8">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center font-medium tracking-wider uppercase">
              © 2026 Digital Civic Response System • Connected to Government Gateway
            </p>
          </footer>
        )}
      </div>
    </div>
  );
};
