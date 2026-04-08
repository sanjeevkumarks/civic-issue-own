import { useUI } from "../../context/UIContext";
import { cn } from "../../utils/ui";

export const Textarea = ({ className, label, error, ...props }) => {
  const { mode } = useUI();
  
  const modeStyles = {
    saas: "rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
    gov: "rounded-sm border-2 border-gray-300 focus:border-blue-600",
    minimal: "rounded-none border-2 border-gray-300 focus:border-gray-900",
  };

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className={cn(
          "text-sm font-bold tracking-tight text-gray-900",
          mode === "gov" && "uppercase text-xs text-blue-600"
        )}>
          {label}
        </label>
      )}
      <textarea
        className={cn(
          "w-full px-4 py-2 text-gray-900 transition-all outline-none",
          modeStyles[mode],
          error && "border-red-500 ring-red-500/20",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs font-bold text-red-700 uppercase">{error}</p>}
    </div>
  );
};
