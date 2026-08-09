"use client";

import {
  type QueryClient,
  type QueryKey,
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";

import type { ActionResult } from "@/shared/actions/types";
import { AppError, emitUnauthorized } from "@/shared/errors";

import { entityToast, type EntityAction } from "../toast";
import type { Snapshot } from "@/shared/query/optimistic";

export type EntityMutationConfig<TInput, TEntity> = {
  entityLabel: string;
  action: EntityAction;
  mutationFn: (input: TInput) => Promise<ActionResult<TEntity>>;
  optimistic?: (queryClient: QueryClient, input: TInput) => Snapshot;
  invalidate?: (queryClient: QueryClient, data: TEntity, input: TInput) => void;
  successMessage?: string;
  errorMessage?: string;
  invalidateKeys?: QueryKey[];
  mutationOptions?: Omit<
    UseMutationOptions<TEntity, Error, TInput, MutationContext>,
    "mutationFn" | "onMutate" | "onError" | "onSuccess" | "onSettled"
  >;
};

type MutationContext = {
  snapshot?: Snapshot;
};

export function useEntityMutation<TInput, TEntity>({
  entityLabel,
  action,
  mutationFn,
  optimistic,
  invalidate,
  invalidateKeys,
  successMessage,
  errorMessage,
  mutationOptions,
}: EntityMutationConfig<TInput, TEntity>) {
  const queryClient = useQueryClient();

  return useMutation<TEntity, Error, TInput, MutationContext>({
    ...mutationOptions,
    mutationFn: async (input) => {
      const result = await mutationFn(input);
      if (!result.success) {
        // Server actions already resolve the backend response to a
        // user-facing message and a kind (see handleActionError). Throwing an
        // AppError instead of a plain Error preserves both — AppError.from()
        // short-circuits on an existing AppError, whereas a plain Error would
        // fall through to the generic fallback and lose the real reason, and
        // onError below needs `kind` to detect an expired session.
        throw new AppError({
          userMessage: result.error,
          kind: result.kind ?? "unknown",
          code: result.code,
          status: result.status,
          fieldErrors: result.fieldErrors,
        });
      }
      return result.data;
    },
    onMutate: async (input) => {
      const snapshot = optimistic ? optimistic(queryClient, input) : undefined;
      return { snapshot };
    },
    onError: (error, _input, context) => {
      context?.snapshot?.restore();
      // Server actions can't touch `window`, so an expired session detected
      // there can't dispatch the unauthorized event itself (unlike direct
      // client fetches via OptimizedApiClient). Do it here instead, once the
      // error is back on the client — same redirect-to-login flow either way.
      if (error instanceof AppError && error.kind === "unauthorized") {
        emitUnauthorized(error);
        return;
      }
      if (errorMessage) {
        entityToast.error(entityLabel, action, new Error(errorMessage));
      } else {
        entityToast.error(entityLabel, action, error);
      }
    },
    onSuccess: (data, input) => {
      if (invalidate) {
        invalidate(queryClient, data, input);
      }
      if (invalidateKeys) {
        for (const key of invalidateKeys) {
          void queryClient.invalidateQueries({ queryKey: key });
        }
      }
      if (successMessage) {
        entityToast.info(successMessage);
      } else {
        entityToast.success(entityLabel, action);
      }
    },
  });
}
