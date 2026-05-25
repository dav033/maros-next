import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export type KpiTone = "primary" | "emerald" | "amber" | "sky" | "violet";

type KpiCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  tone?: KpiTone;
  href?: string;
};

const toneStyles: Record<KpiTone, { iconBg: string; iconText: string; accent: string }> = {
  primary: {
    iconBg: "bg-primary/15",
    iconText: "text-primary",
    accent: "from-primary/10",
  },
  emerald: {
    iconBg: "bg-emerald-500/15",
    iconText: "text-emerald-400",
    accent: "from-emerald-500/10",
  },
  amber: {
    iconBg: "bg-amber-500/15",
    iconText: "text-amber-400",
    accent: "from-amber-500/10",
  },
  sky: {
    iconBg: "bg-sky-500/15",
    iconText: "text-sky-400",
    accent: "from-sky-500/10",
  },
  violet: {
    iconBg: "bg-violet-500/15",
    iconText: "text-violet-400",
    accent: "from-violet-500/10",
  },
};

export function KpiCard({ label, value, icon: Icon, hint, tone = "primary", href }: KpiCardProps) {
  const styles = toneStyles[tone];

  const content = (
    <Card
      className={`group relative h-full overflow-hidden border-border/60 transition-all ${
        href ? "cursor-pointer hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg" : "hover:-translate-y-0.5 hover:border-border hover:shadow-md"
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${styles.accent} to-transparent opacity-60`}
      />
      <CardContent className="relative flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <span className={`grid h-9 w-9 place-items-center rounded-lg ${styles.iconBg} ${styles.iconText}`}>
            <Icon className="h-4 w-4" />
          </span>
        </div>
        <p className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.7rem]">{value}</p>
        <div className="flex items-end justify-between gap-2">
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : <span />}
          {href ? (
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );

  if (!href) return content;

  return (
    <Link
      href={href}
      aria-label={`${label}: view details`}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl"
    >
      {content}
    </Link>
  );
}
