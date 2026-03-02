import { useUI } from "../../context/UIContext";
import { cn } from "../../utils/ui";

export const Input = ({ className, label, error, ...props }) => {
  const { mode } = useUI();
  
  const modeStyles = {
    saas: "rounded-xl bg-brand-border/20 border-transparent focus:bg-brand-panel focus:ring-2 ring-brand-primary/20",
    gov: "rounded-sm border-2 border-brand-border focus:border-brand-primary",
    minimal: "rounded-none border-2 border-brand-border focus:border-brand-text",
  };

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className={cn(
          "text-sm font-bold tracking-tight",
          mode === "gov" && "uppercase text-xs text-brand-primary"
        )}>
          {label}
        </label>
      )}
      <input
        className={cn(
          "w-full px-4 py-2 text-brand-text transition-all outline-none",
          modeStyles[mode],
          error && "border-rose-500 ring-rose-500/20",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs font-bold text-rose-500 uppercase">{error}</p>}
    </div>
  );
};
