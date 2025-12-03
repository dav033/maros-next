import { Icon } from "@/shared/ui";

interface ErrorAlertProps {
  message: string;
  className?: string;
}

export function ErrorAlert({ message, className = "" }: ErrorAlertProps) {
  return (
    <div
      className={`mt-4 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 ${className}`}
    >
      <Icon name="lucide:alert-circle" size={16} className="mt-0.5 text-red-400" />
      <p className="text-sm text-red-400">{message}</p>
    </div>
  );
}
