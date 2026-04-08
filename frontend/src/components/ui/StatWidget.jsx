import { useUI } from "../../context/UIContext";
import { cn } from "../../utils/ui";
import { Card } from "../ui/Card";
import { motion } from "framer-motion";

export const StatWidget = ({ label, value, icon: Icon, color = "primary", trend }) => {
  const { isSaas, isGov } = useUI();

  const colors = {
    primary: "text-blue-600 bg-blue-50",
    success: "text-emerald-500 bg-emerald-50",
    warning: "text-amber-500 bg-amber-50",
    danger: "text-rose-500 bg-rose-50",
  };

  return (
    <Card className="p-6 relative overflow-hidden group">
      {isSaas && (
        <div className={cn(
          "absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-20 transition-all duration-500 group-hover:scale-150 group-hover:opacity-30",
          color === "primary" ? "bg-blue-500" : color === "success" ? "bg-emerald-500" : color === "warning" ? "bg-amber-500" : "bg-rose-500"
        )} />
      )}
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className={cn(
            "text-xs font-bold uppercase tracking-widest mb-1 opacity-70 text-gray-600",
            isGov && "text-blue-600"
          )}>
            {label}
          </p>
          <h3 className="text-3xl font-black tracking-tight text-gray-900">{value}</h3>
          
          {trend && (
            <div className={cn(
              "flex items-center gap-1 mt-2 text-xs font-bold",
              trend > 0 ? "text-emerald-500" : "text-rose-500"
            )}>
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% 
              <span className="text-gray-600 font-normal ml-1">since last month</span>
            </div>
          )}
        </div>
        
        <div className={cn("p-3 rounded-2xl", colors[color])}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
      </div>
    </Card>
  );
};
