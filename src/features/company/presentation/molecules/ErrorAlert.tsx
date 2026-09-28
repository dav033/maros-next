import { AlertCircle } from "lucide-react";

interface ErrorAlertProps {
  message: string;
  className?: string;
}

export function ErrorAlert({ message, className = "" }: ErrorAlertProps) {
  return (
    <div
      className={`mt-4 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 ${className}`}
    >
      <AlertCircle className="size-4 mt-0.5 text-destructive" />
      <p className="text-sm text-destructive">{message}</p>
    </div>
  );
}
