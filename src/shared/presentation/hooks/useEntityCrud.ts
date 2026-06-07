"use client";

import { useQueryClient } from "@tanstack/react-query";

import type { ActionResult } from "@/shared/actions/types";
import type { EntityId, EntityKeys } from "@/shared/query/createEntityKeys";
import {
  optimisticInsert,
  optimisticRemove,
  optimisticUpdate,
} from "@/shared/query/optimistic";

import { useEntityMutation } from "./useEntityMutation";

type WithId<TId extends EntityId> = { id?: TId };

export type EntityCrudActions<TEntity, TDraft, TPatch, TId extends EntityId> = {
  create?: (draft: TDraft) => Promise<ActionResult<TEntity>>;
  update?: (id: TId, patch: TPatch) => Promise<ActionResult<TEntity>>;
  remove?: (id: TId) => Promise<ActionResult<void>>;
};

export type UseEntityCrudConfig<TEntity, TDraft, TPatch, TId extends EntityId> = {
  entityLabel: string;
  keys: EntityKeys;
  actions: EntityCrudActions<TEntity, TDraft, TPatch, TId>;
  /**
   * When true, applies optimistic updates with snapshot/rollback.
   * Create uses a temporary id (negative timestamp) until the server response arrives.
   */
  optimistic?: boolean;
  /**
   * Builds the optimistic entity from a draft. Required when `optimistic` is true
   * and `actions.create` is provided.
   */
  buildOptimisticEntity?: (draft: TDraft, tempId: TId) => TEntity;
};

const notConfigured = (op: string) => () =>
  Promise.resolve({
    success: false as const,
    error: `${op} action not configured for this entity`,
  });

export function useEntityCrud<
  TEntity extends WithId<TId>,
  TDraft,
  TPatch,
  TId extends EntityId = number,
>({
  entityLabel,
  keys,
  actions,
  optimistic = false,
  buildOptimisticEntity,
}: UseEntityCrudConfig<TEntity, TDraft, TPatch, TId>) {
  const queryClient = useQueryClient();

  const createMutation = useEntityMutation<TDraft, TEntity>({
    entityLabel,
    action: "created",
    mutationFn: actions.create ?? notConfigured("create"),
    optimistic:
      optimistic && actions.create && buildOptimisticEntity
        ? (qc, draft) => {
            const tempId = (-Date.now()) as unknown as TId;
            const optimisticEntity = buildOptimisticEntity(draft, tempId);
            return optimisticInsert<TEntity>(qc, {
              listKey: keys.lists(),
              item: optimisticEntity,
            });
          }
        : undefined,
    invalidate: (qc) => {
      void qc.invalidateQueries({ queryKey: keys.lists() });
    },
  });

  const updateMutation = useEntityMutation<{ id: TId; patch: TPatch }, TEntity>({
    entityLabel,
    action: "updated",
    mutationFn: actions.update
      ? ({ id, patch }) => actions.update!(id, patch)
      : notConfigured("update"),
    optimistic:
      optimistic && actions.update
        ? (qc, { id, patch }) =>
            optimisticUpdate<TEntity, TId>(qc, {
              listKey: keys.lists(),
              detailKey: keys.detail(id),
              id,
              patch: patch as Partial<TEntity>,
            })
        : undefined,
    invalidate: (qc, _data, { id }) => {
      void qc.invalidateQueries({ queryKey: keys.lists() });
      void qc.invalidateQueries({ queryKey: keys.detail(id) });
    },
  });

  const removeMutation = useEntityMutation<TId, void>({
    entityLabel,
    action: "deleted",
    mutationFn: actions.remove ?? notConfigured("delete"),
    optimistic:
      optimistic && actions.remove
        ? (qc, id) =>
            optimisticRemove<TEntity, TId>(qc, {
              listKey: keys.lists(),
              detailKey: keys.detail(id),
              id,
            })
        : undefined,
    invalidate: (qc) => {
      void qc.invalidateQueries({ queryKey: keys.lists() });
    },
  });

  return {
    queryClient,
    createMutation,
    updateMutation,
    removeMutation,
  } as const;
}
