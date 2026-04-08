import { motion } from "framer-motion";
import { cn } from "../utils/ui";

const variants = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl",
  secondary: "bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white",
  ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-900 dark:text-white",
  danger: "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl",
  success: "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl",
};

const sizes = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-base",
  lg: "px-6 py-3 text-lg",
};

export const ModernButton = ({ 
  children, 
  variant = "primary", 
  size = "md", 
  className,
  isLoading = false,
  disabled = false,
  ...props 
}) => {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      disabled={disabled || isLoading}
      className={cn(
        "font-semibold rounded-lg transition-all flex items-center justify-center gap-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
        />
      )}
      {children}
    </motion.button>
  );
};
