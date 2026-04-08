import { motion } from "framer-motion";
import { cn } from "../utils/ui";

const statColors = {
  blue: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600", text: "text-blue-900" },
  green: { bg: "bg-green-50", border: "border-green-200", icon: "text-green-600", text: "text-green-900" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-600", text: "text-amber-900" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", icon: "text-purple-600", text: "text-purple-900" },
};

export const DashboardStatCard = ({ icon: Icon, label, value, change, color = "blue" }) => {
  const colors = statColors[color];
  const isPositive = !change || change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={cn(
        "p-6 rounded-xl border-2 shadow-sm hover:shadow-md transition-all",
        colors.bg,
        colors.border
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-lg bg-gray-100", colors.icon)}>
          <Icon size={24} className={colors.icon} />
        </div>
        {change !== undefined && (
          <div className={cn(
            "text-xs font-bold px-2 py-1 rounded-full",
            isPositive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          )}>
            {isPositive ? "↑" : "↓"} {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className={cn("text-sm font-medium text-gray-600 mb-1 uppercase tracking-wider")}>
        {label}
      </p>
      <p className={cn("text-3xl font-bold", colors.text)}>
        {value}
      </p>
    </motion.div>
  );
};
