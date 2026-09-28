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
    <div className="mx-auto w-full max-w-[88rem] rounded-xl border border-line bg-elev-1 p-2">
      <div className="flex gap-1 sm:grid sm:grid-cols-2 sm:gap-2 lg:grid-cols-3">
        {options.map((option) => {
          const active = option.type === effectiveType;
          const Icon = option.icon;

          return (
            <Link
              key={option.type}
              href={`${basePath}/${leadTypeToRouteSegment(option.type)}`}
              className={`group flex min-w-0 flex-1 items-center justify-center rounded-lg border px-1 py-2 text-center transition-all sm:justify-start sm:gap-3 sm:px-3 sm:py-2 sm:text-left ${
                active
                  ? "border-line-strong bg-elev-3 text-foreground"
                  : "border-line bg-elev-2 text-muted-foreground hover:border-line-strong hover:bg-elev-3"
              } outline-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background`}
              aria-current={active ? "page" : undefined}
            >
              <span
                className={`hidden size-8 shrink-0 items-center justify-center rounded-md border transition-all sm:inline-flex ${
                  active
                    ? "border-line-strong bg-elev-4 text-primary"
                    : "border-line bg-elev-3 text-muted-foreground"
                }`}
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className={`block truncate font-display text-xs font-medium sm:text-sm ${active ? "text-foreground" : "text-fg-dim"}`}>
                  {option.label}
                </span>
                <span className="hidden text-xs leading-tight text-muted-foreground sm:block">
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
