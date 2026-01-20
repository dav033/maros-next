/**
 * Type definitions for common component patterns
 */

// Search configuration for tables
export interface SearchField<T> {
  key: keyof T;
  label: string;
}

export interface SearchConfig<T> {
  fields: SearchField<T>[];
  defaultField: keyof T;
  normalize?: (value: string) => string;
}

// Select option type
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// Context menu option type
export interface ContextMenuOption {
  id: string;
  label: string;
  icon?: string;
  action: () => void;
  danger?: boolean;
  disabled?: boolean;
}

// Table skeleton column
export interface TableSkeletonColumn {
  width?: string;
  className?: string;
}
