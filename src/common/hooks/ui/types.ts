import type { MouseEvent, ReactNode } from "react";

export type ContextMenuPosition = Readonly<{
  x: number;
  y: number;
  viewportWidth: number;
  viewportHeight: number;
}>;

export interface ContextMenuOption {
  id: string;
  label: string;
  icon?: string | ReactNode;
  action: () => void;
  disabled?: boolean;
  separator?: boolean;
  danger?: boolean;
  shortcut?: string;
}

export interface ContextMenuState {
  isVisible: boolean;
  position: ContextMenuPosition;
  options: ContextMenuOption[];
}

export interface UseContextMenuResult {
  isVisible: boolean;
  position: ContextMenuPosition;
  options: ContextMenuOption[];
  show: (event: MouseEvent, options: ContextMenuOption[]) => void;
  hide: () => void;
}
