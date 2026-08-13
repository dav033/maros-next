import { MapPin } from "lucide-react";

export function JobAddressLink({
  address,
}: {
  address: { label: string; href: string | null } | null;
}) {
  if (!address) return null;

  if (!address.href) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{address.label}</span>
      </span>
    );
  }

  return (
    <a
      href={address.href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1 text-xs text-muted-foreground underline decoration-dotted hover:text-foreground"
    >
      <MapPin className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{address.label}</span>
    </a>
  );
}
