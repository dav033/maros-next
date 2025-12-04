import type { PropsWithChildren } from "react";

export interface PageContainerProps {
  centered?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
}

/**
 * Consistent page container component that provides standardized layouts
 * for different types of pages. Reduces repetition of layout classes.
 */
export function PageContainer({
  centered = false,
  title,
  subtitle,
  className = "",
  children,
}: PropsWithChildren<PageContainerProps>) {
  const baseClasses = [
    "min-h-screen bg-theme-dark text-theme-light",
    centered ? "flex flex-col items-center justify-center" : "flex flex-col",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main className={baseClasses}>
      {title && (
        <div className={centered ? "text-center mb-6" : "p-6 border-b border-theme-gray"}>
          <h1 className="text-3xl font-bold text-theme-light">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-lg text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div className={centered ? "w-full max-w-4xl px-4" : "flex-1 p-6"}>
        {children}
      </div>
    </main>
  );
}