"use client";

import { useEffect } from "react";
import { Button, Icon } from "@/shared/ui";

type ToastType = "success" | "error" | "info" | "warning";

export interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const toastStyles: Record<ToastType, { bg: string; border: string; text: string; icon: string }> = {
  success: {
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    text: "text-green-400",
    icon: "lucide:check-circle",
  },
  error: {
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    text: "text-red-400",
    icon: "lucide:alert-circle",
  },
  info: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-400",
    icon: "lucide:info",
  },
  warning: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    text: "text-yellow-400",
    icon: "lucide:alert-triangle",
  },
};

export function Toast({ message, type = "info", duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = toastStyles[type];

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border ${styles.border} ${styles.bg} p-4 shadow-lg backdrop-blur-sm animate-in slide-in-from-top-5 fade-in duration-300`}
      role="alert"
    >
      <Icon name={styles.icon} size={20} className={`${styles.text} mt-0.5 shrink-0`} />
      <p className={`flex-1 text-sm font-medium ${styles.text}`}>{message}</p>
      <Button
        type="button"
        onClick={onClose}
        variant="ghost"
        size="sm"
        className={`${styles.text} hover:opacity-70 transition-opacity shrink-0 !p-0`}
        aria-label="Close"
      >
        <Icon name="lucide:x" size={18} />
      </Button>
    </div>
  );
}
