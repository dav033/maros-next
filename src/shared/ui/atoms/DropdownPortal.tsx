"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export interface DropdownPortalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  children: ReactNode;
  className?: string;
}

/**
 * Reusable portal-based dropdown that handles:
 * - Positioning relative to trigger element
 * - Click-outside detection
 * - Portal rendering to document.body
 * 
 * Separated from Select to enable reuse in other components.
 */
export function DropdownPortal({
  isOpen,
  onClose,
  triggerRef,
  children,
  className = "",
}: DropdownPortalProps) {
  const [position, setPosition] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 0,
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click-outside handler
  useEffect(() => {
    if (typeof window === "undefined" || !isOpen) return;
    
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || dropdownRef.current?.contains(target)) {
        return;
      }
      onClose();
    };
    
    window.addEventListener("mousedown", onClickOutside);
    return () => window.removeEventListener("mousedown", onClickOutside);
  }, [isOpen, onClose, triggerRef]);

  // Position calculation
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen, triggerRef]);

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        width: position.width,
        zIndex: 9999,
      }}
      className={className}
    >
      {children}
    </div>,
    document.body
  );
}
