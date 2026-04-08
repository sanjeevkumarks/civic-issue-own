import { useUI } from "../../context/UIContext";
import { cn } from "../../utils/ui";

export const Card = ({ children, className, ...props }) => {
  const { mode } = useUI();
  
  return (
    <div 
      className={cn(
        "bg-white border border-gray-200 text-gray-900 rounded-xl shadow-lg",
        mode === "saas" && "backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
        mode === "gov" && "border-l-4 border-l-blue-600",
        mode === "minimal" && "border-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
