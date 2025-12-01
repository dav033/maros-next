import type { ReactNode } from "react";

export type CustomerSectionProps<T> = {
  title: string;
  itemCount: number;
  showSkeleton: boolean;
  skeleton: ReactNode;
  table: ReactNode;
};

export function CustomerSection<T>({
  title,
  itemCount,
  showSkeleton,
  skeleton,
  table,
}: CustomerSectionProps<T>) {
  const itemLabel = itemCount === 1 ? title.toLowerCase().slice(0, -1) : title.toLowerCase();
  
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-theme-light">{title}</h2>
        <span className="text-sm text-gray-400">
          {itemCount} {itemLabel}
        </span>
      </div>
      {showSkeleton ? skeleton : table}
    </section>
  );
}
