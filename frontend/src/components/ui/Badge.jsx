import { useUI } from "../../context/UIContext";
import { cn } from "../../utils/ui";

export const Badge = ({ children, status = "neutral", className, ...props }) => {
  const { mode } = useUI();
  
  const statusStyles = {
    neutral: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700",
    success: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
    warning: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    danger: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800",
  };
  
  return (
    <span 
      className={cn(
        "px-2.5 py-0.5 text-xs font-bold border uppercase tracking-wider",
        mode === "saas" && "rounded-full backdrop-blur-sm shadow-sm",
        mode === "gov" && "rounded-none",
        mode === "minimal" && "rounded-sm border-2 font-mono",
        statusStyles[status],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
