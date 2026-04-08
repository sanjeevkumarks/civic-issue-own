import { useUI } from "../../context/UIContext";
import { cn } from "../../utils/ui";
import { motion } from "framer-motion";

export const Button = ({ children, variant = "primary", size = "md", className, disabled, ...props }) => {
  const { mode } = useUI();
  
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-white border border-gray-200 text-gray-900 hover:bg-gray-50",
    ghost: "bg-transparent text-gray-900 hover:bg-gray-100",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };
  
  const modeStyles = {
    saas: "rounded-lg shadow-lg hover:shadow-blue-600/20",
    gov: "rounded-sm uppercase tracking-wider font-bold",
    minimal: "rounded-none border-2",
  };
  
  return (
    <motion.button
      whileHover={mode === "saas" ? { scale: 1.02 } : {}}
      whileTap={{ scale: 0.98 }}
      className={cn(baseStyles, variants[variant], sizes[size], modeStyles[mode], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
};
