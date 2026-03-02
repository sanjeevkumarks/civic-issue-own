import { useUI } from "../../context/UIContext";
import { cn } from "../../utils/ui";

export const Card = ({ children, className, ...props }) => {
  const { mode } = useUI();
  
  return (
    <div 
      className={cn(
        "bg-brand-panel border-brand-border text-brand-text rounded-[var(--radius-card)] shadow-[var(--shadow-card)]",
        mode === "saas" && "backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
        mode === "gov" && "border-l-4 border-l-brand-primary",
        mode === "minimal" && "border-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
