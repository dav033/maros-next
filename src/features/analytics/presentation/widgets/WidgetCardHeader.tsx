import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";

type WidgetCardHeaderProps = {
  icon: LucideIcon;
  iconBg?: string;
  iconText?: string;
  title: string;
  subtitle?: string;
  href?: string;
  hrefLabel?: string;
  rightSlot?: React.ReactNode;
};

export function WidgetCardHeader({
  icon: Icon,
  iconBg = "bg-primary/10",
  iconText = "text-primary",
  title,
  subtitle,
  href,
  hrefLabel = "View",
  rightSlot,
}: WidgetCardHeaderProps) {
  return (
    <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
      <div className="flex items-start gap-2.5">
        <span className={`grid h-8 w-8 place-items-center rounded-md ${iconBg} ${iconText}`}>
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <CardTitle className="text-sm">{title}</CardTitle>
          {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {rightSlot}
        {href ? (
          <Link
            href={href}
            className="group inline-flex items-center gap-1 rounded-md border border-border/60 bg-background/40 px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            {hrefLabel}
            <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        ) : null}
      </div>
    </CardHeader>
  );
}
