import { createContext, useContext, useEffect, useState } from "react";

const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
  const mode = "saas";
  const [theme, setTheme] = useState(() => localStorage.getItem("ui-theme") || "light");

  useEffect(() => {
    localStorage.removeItem("ui-mode");
    document.documentElement.setAttribute("data-ui-mode", mode);
  }, []);

  useEffect(() => {
    localStorage.setItem("ui-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));
  
  const value = {
    mode,
    theme,
    toggleTheme,
    isSaas: true,
    isGov: false,
    isMinimal: false
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI must be used within UIProvider");
  return context;
};
