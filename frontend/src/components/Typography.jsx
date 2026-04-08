import { cn } from "../utils/ui";

export const H1 = ({ children, className, ...props }) => (
  <h1 className={cn("text-4xl font-bold tracking-tighter text-gray-900", className)} {...props}>
    {children}
  </h1>
);

export const H2 = ({ children, className, ...props }) => (
  <h2 className={cn("text-3xl font-bold tracking-tight text-gray-900", className)} {...props}>
    {children}
  </h2>
);

export const H3 = ({ children, className, ...props }) => (
  <h3 className={cn("text-2xl font-semibold text-gray-900", className)} {...props}>
    {children}
  </h3>
);

export const H4 = ({ children, className, ...props }) => (
  <h4 className={cn("text-xl font-semibold text-gray-900", className)} {...props}>
    {children}
  </h4>
);

export const Body = ({ children, className, ...props }) => (
  <p className={cn("text-base font-normal text-gray-700", className)} {...props}>
    {children}
  </p>
);

export const SmallText = ({ children, className, ...props }) => (
  <p className={cn("text-sm font-normal text-gray-600", className)} {...props}>
    {children}
  </p>
);

export const Label = ({ children, className, ...props }) => (
  <label className={cn("text-xs font-semibold uppercase tracking-wider text-gray-600", className)} {...props}>
    {children}
  </label>
);

export const Subtitle = ({ children, className, ...props }) => (
  <p className={cn("text-sm font-medium text-gray-600", className)} {...props}>
    {children}
  </p>
);
