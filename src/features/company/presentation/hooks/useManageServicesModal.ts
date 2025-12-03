"use client";

import { useState } from "react";

export interface UseManageServicesModalResult {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

/**
 * Simple hook to manage services modal state
 */
export function useManageServicesModal(): UseManageServicesModalResult {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}
