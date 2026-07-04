"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Hammer, House, Wrench } from "lucide-react";
import { LeadType } from "@/leads/domain";
import { leadTypeToRouteSegment } from "@/features/leads/utils/leadTypeRoute";

type LeadTypeSwitcherProps = {
  currentType: LeadType;
  basePath: "/leads" | "/projects";
};

const options: Array<{
  type: LeadType;
  label: string;
  subtitle: string;
  icon: typeof Hammer;
}> = [
  {
    type: LeadType.CONSTRUCTION,
    label: "Construction",
    subtitle: "Core builds",
    icon: Hammer,
  },
  {
    type: LeadType.ROOFING,
    label: "Roofing",
    subtitle: "Roofs & exteriors",
    icon: House,
  },
  {
    type: LeadType.PLUMBING,
    label: "Plumbing",
    subtitle: "Water systems",
    icon: Wrench,
  },
];

export function LeadTypeSwitcher({ currentType, basePath }: LeadTypeSwitcherProps) {
  const pathname = usePathname();

  const routeType = (() => {
    if (!pathname) return null;
    if (!pathname.startsWith(`${basePath}/`)) return null;
    const segment = pathname.slice(basePath.length + 1).split("/")[0]?.toLowerCase();
    switch (segment) {
      case "construction":
        return LeadType.CONSTRUCTION;
      case "roofing":
        return LeadType.ROOFING;
      case "plumbing":
        return LeadType.PLUMBING;
      default:
        return null;
    }
  })();

  const effectiveType = routeType ?? currentType;

  return (
    <div className="mx-auto w-full max-w-[88rem] rounded-xl border border-zinc-600/50 bg-gradient-to-r from-muted/35 via-muted/20 to-background p-2">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => {
          const active = option.type === effectiveType;
          const Icon = option.icon;

          return (
            <Link
              key={option.type}
              href={`${basePath}/${leadTypeToRouteSegment(option.type)}`}
              className={`group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all ${
                active
                  ? "border-border bg-background text-foreground shadow-[inset_0_0_0_1px_hsl(var(--sidebar-accent)/0.45)]"
                  : "border-border/60 bg-background/75 text-muted-foreground hover:border-border hover:bg-background"
              } outline-none focus:outline-none focus:ring-2 focus:ring-zinc-400/45 focus:ring-offset-1 focus:ring-offset-background focus-visible:ring-2 focus-visible:ring-zinc-400/45 focus-visible:ring-offset-1 focus-visible:ring-offset-background`}
              aria-current={active ? "page" : undefined}
            >
              <span
                className={`inline-flex size-8 items-center justify-center rounded-md border transition-all ${
                  active
                    ? "border-2 border-zinc-400/80 bg-sidebar-accent/20 text-sidebar-accent-foreground"
                    : "border-[1.5px] border-zinc-500/70 bg-muted/40 text-muted-foreground"
                }`}
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className={`block text-sm font-medium ${active ? "text-foreground" : "text-foreground/85"}`}>
                  {option.label}
                </span>
                <span className="block text-[11px] leading-tight text-muted-foreground">
                  {option.subtitle}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
