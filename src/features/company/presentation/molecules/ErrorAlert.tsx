import { AlertCircle } from "lucide-react";

interface ErrorAlertProps {
  message: string;
  className?: string;
}

export function ErrorAlert({ message, className = "" }: ErrorAlertProps) {
  return (
    <div
      className={`mt-4 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 ${className}`}
    >
      <AlertCircle className="size-4 mt-0.5 text-red-400" />
      <p className="text-sm text-red-400">{message}</p>
    </div>
  );
}
