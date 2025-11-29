export type StatusBadgeProps = {
  status: boolean;
  trueLabel?: string;
  falseLabel?: string;
  trueColor?: "green" | "blue" | "emerald";
  falseColor?: "red" | "gray";
};

export function StatusBadge({
  status,
  trueLabel = "Yes",
  falseLabel = "No",
  trueColor = "green",
  falseColor = "red",
}: StatusBadgeProps) {
  const colorClasses = {
    green: {
      bg: "bg-green-500/15",
      text: "text-green-400",
    },
    blue: {
      bg: "bg-blue-500/15",
      text: "text-blue-400",
    },
    emerald: {
      bg: "bg-emerald-500/15",
      text: "text-emerald-400",
    },
    red: {
      bg: "bg-red-500/15",
      text: "text-red-400",
    },
    gray: {
      bg: "bg-theme-gray-subtle",
      text: "text-gray-300",
    },
  };

  const colors = status ? colorClasses[trueColor] : colorClasses[falseColor];
  const label = status ? trueLabel : falseLabel;

  return (
    <span
      className={`inline-flex items-center rounded-full ${colors.bg} px-2 py-0.5 text-xs font-medium ${colors.text}`}
    >
      {label}
    </span>
  );
}
