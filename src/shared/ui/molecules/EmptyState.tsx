"use client";

import { Icon } from "../atoms";

export type EmptyStateProps = {
  iconName: string;
  title: string;
  subtitle: string;
  variant?: "default" | "search";
};

export function EmptyState({
  iconName,
  title,
  subtitle,
  variant = "default",
}: EmptyStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="max-w-md rounded-xl border border-dashed border-theme-gray-subtle bg-theme-dark/80 px-4 py-8 text-center text-sm text-gray-400 sm:rounded-2xl sm:px-6 sm:py-10">
        <Icon 
          name={iconName} 
          size={48} 
          className="mx-auto mb-4 text-gray-500" 
        />
        <p className="text-base font-medium text-gray-300">{title}</p>
        <p className="mt-2 text-xs sm:text-sm">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
