import * as React from "react";

export interface ServiceBadgeProps {
  service: {
    id: number;
    name: string;
    color?: string | null;
  };
}

export function ServiceBadge({ service }: ServiceBadgeProps) {
  const bgColor = service.color || "#000000";
  
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: `${bgColor}20`,
        color: bgColor === "#000000" ? "#9ca3af" : bgColor,
        borderColor: `${bgColor}40`,
        borderWidth: "1px",
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: bgColor }}
      />
      {service.name}
    </span>
  );
}
