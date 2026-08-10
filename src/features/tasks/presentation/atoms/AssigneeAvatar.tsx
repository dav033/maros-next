import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { TaskPersonRef } from "@/tasks/domain";

function initials(name: string | null, email: string): string {
  const source = name?.trim() || email;
  return source.slice(0, 2).toUpperCase();
}

export function AssigneeAvatar({
  person,
  size = "sm",
  className,
}: {
  person: TaskPersonRef | null;
  size?: "sm" | "md";
  className?: string;
}) {
  const dimension = size === "sm" ? "h-6 w-6" : "h-8 w-8";

  if (!person) {
    return (
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-full border border-dashed border-border/60 text-muted-foreground",
          dimension,
          className
        )}
        title="Unassigned"
      >
        <span className="text-[10px]">?</span>
      </span>
    );
  }

  return (
    <Avatar className={cn(dimension, "shrink-0", className)} title={person.name ?? person.email}>
      {person.picture ? <AvatarImage src={person.picture} alt="" /> : null}
      <AvatarFallback className="text-[10px]">
        {initials(person.name, person.email)}
      </AvatarFallback>
    </Avatar>
  );
}
