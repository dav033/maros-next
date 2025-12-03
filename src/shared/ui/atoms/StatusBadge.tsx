import { Badge } from "./Badge";

export type StatusBadgeProps = {
  status: boolean;
  trueLabel?: string;
  falseLabel?: string;
  trueColor?: "green" | "blue" | "emerald";
  falseColor?: "red" | "gray";
};

const colorMap = {
  green: "success" as const,
  blue: "primary" as const,
  emerald: "info" as const,
  red: "danger" as const,
  gray: "gray" as const,
};

export function StatusBadge({
  status,
  trueLabel = "Yes",
  falseLabel = "No",
  trueColor = "green",
  falseColor = "red",
}: StatusBadgeProps) {
  const variant = status ? colorMap[trueColor] : colorMap[falseColor];
  const label = status ? trueLabel : falseLabel;

  return (
    <Badge variant={variant} size="sm">
      {label}
    </Badge>
  );
}
