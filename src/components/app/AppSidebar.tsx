"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function AppSidebar({ config }: { config: any }) {
  // Transformar la estructura del config para que funcione con shadcn Sidebar
  const sections = config.top.map((entry: any) => {
    if ("section" in entry) {
      return {
        title: entry.section,
        items: entry.items.map((item: any) => ({
          title: item.title,
          href: item.href,
          icon: item.icon,
        })),
      };
    }
    return {
      title: "",
      items: [entry],
    };
  });

  return (
    <div className="flex h-full flex-col">
      <div className="px-2 py-3 border-b">
        <div className="px-2 text-sm font-semibold">
          {config.title || "Maros Construction"}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {sections.map((section: any, index: number) => (
          <div key={section.title || index} className="py-2">
            {section.title && (
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section.title}
              </div>
            )}
            <div>
              {section.items?.map((item: any) => {
                const ItemIcon = item.icon as LucideIcon | undefined;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    {ItemIcon ? <ItemIcon className="h-4 w-4 shrink-0" /> : null}
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
