import { Navbar } from "./Navbar";
import { useUI } from "../../context/UIContext";
import { cn } from "../../utils/ui";

export const AppLayout = ({ children }) => {
  const { isSaas, isGov } = useUI();

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Background decoration for SaaS mode */}
      {isSaas && (
        <>
          <div className="fixed -top-24 -left-24 w-96 h-96 bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />
          <div className="fixed top-1/2 -right-24 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
          <div className="fixed -bottom-24 left-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        </>
      )}

      <Navbar />
      
      <main className={cn(
        "flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pb-20",
        isSaas ? "animate-fade-in" : ""
      )}>
        {children}
      </main>

      {/* Footer / Status Bar */}
      <footer className={cn(
        "py-6 px-4 border-t mt-auto text-center",
        isSaas ? "bg-brand-panel/50 backdrop-blur-md border-brand-border" : isGov ? "bg-slate-900 text-white border-none" : "bg-white dark:bg-slate-900 border-t-2 border-brand-border"
      )}>
        <p className="text-sm opacity-60 font-semibold tracking-tighter">
          &copy; 2026 DIGITAL CIVIC RESPONSE SYSTEM • CONNECTED TO GOVERNMENT GATEWAY
        </p>
      </footer>
    </div>
  );
};
