"use client";

import { useCallback, useEffect, useState } from "react";
import React from "react";

/** Item del menú contextual de una fila de tabla. */
export interface ContextMenuItem {
  /** Texto visible del item. */
  label: string;
  /** Acción al hacer clic. No es necesario si el item tiene `subItems`. */
  onClick?: () => void;
  /** Variante visual: `"danger"` pinta el texto en rojo. */
  variant?: "default" | "danger";
  /** Icono (nombre string lucide/mdi o ReactNode). */
  icon?: string | React.ReactNode;
  /** Deshabilitado (no se puede hacer clic). */
  disabled?: boolean;
  /** Muestra un checkmark al final del item. */
  checked?: boolean;
  /** Renderiza un separador horizontal en lugar del item. */
  separator?: boolean;
  /** Subítems anidados para menú en cascada. */
  subItems?: ContextMenuItem[];
}

export interface UseEntityTableLogicOptions<T, TId = number> {
  items: T[] | undefined;
  onDelete?: (id: TId) => Promise<void>;
  onEdit?: (item: T) => void;
  getId?: (item: T) => TId;
  buildExtraMenuItems?: (item: T) => ContextMenuItem[];
}

export function useEntityTableLogic<T, TId = number>({
  items,
  onDelete,
  onEdit,
  getId = (item: any) => item.id,
  buildExtraMenuItems,
}: UseEntityTableLogicOptions<T, TId>) {
  const [rows, setRows] = useState<T[]>([]);

  const areItemsEqual = useCallback(
    (a: T[], b: T[]) => {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (getId(a[i]) !== getId(b[i])) return false;
      }
      return true;
    },
    [getId]
  );

  useEffect(() => {
    const newItems = items ?? [];
    setRows((prev) => (areItemsEqual(prev, newItems) ? prev : newItems));
  }, [items, areItemsEqual]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openDeleteModal = useCallback((item: T) => {
    setItemToDelete(item);
    setDeleteError(null);
    setIsDeleteModalOpen(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
    setDeleteError(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!itemToDelete || !onDelete) return;
    const id = getId(itemToDelete);

    try {
      setIsDeleting(true);
      setDeleteError(null);
      await onDelete(id);
      setRows((prev) => prev.filter((row) => getId(row) !== id));
      closeDeleteModal();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to delete item";
      setDeleteError(msg);
    } finally {
      setIsDeleting(false);
    }
  }, [itemToDelete, onDelete, getId, closeDeleteModal]);

  const getContextMenuItems = useCallback(
    (row: T): ContextMenuItem[] => {
      const items: ContextMenuItem[] = [];

      if (onEdit) {
        items.push({
          label: "Edit",
          onClick: () => onEdit(row),
          icon: "lucide:edit",
        });
      }

      if (buildExtraMenuItems) {
        items.push(...buildExtraMenuItems(row));
      }

      if (onDelete) {
        items.push({
          label: "Delete",
          onClick: () => openDeleteModal(row),
          variant: "danger",
          icon: "lucide:trash",
        });
      }

      return items;
    },
    [onEdit, onDelete, openDeleteModal, buildExtraMenuItems]
  );

  return {
    rows,
    deleteModalProps: {
      isOpen: isDeleteModalOpen,
      onClose: closeDeleteModal,
      onConfirm: confirmDelete,
      itemToDelete,
      isDeleting,
      error: deleteError,
    },
    getContextMenuItems,
  };
}
