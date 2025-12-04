import type { ResourceRepository } from "@/shared/infra";

export type MakeCrudUseCasesConfig<ID, Entity, Draft, Patch, Ctx> = {
  getRepo: (ctx: Ctx) => ResourceRepository<ID, Entity, Draft, Patch>;
};

export function makeCrudUseCases<ID, Entity, Draft, Patch, Ctx>(
  config: MakeCrudUseCasesConfig<ID, Entity, Draft, Patch, Ctx>
) {
  const { getRepo } = config;

  return {
    create: (ctx: Ctx) => (draft: Draft) => {
      const repo = getRepo(ctx);
      return repo.create(draft);
    },

    update: (ctx: Ctx) => (id: ID, patch: Patch) => {
      const repo = getRepo(ctx);
      return repo.update(id, patch);
    },

    delete: (ctx: Ctx) => (id: ID) => {
      const repo = getRepo(ctx);
      return repo.delete(id);
    },

    getById: (ctx: Ctx) => (id: ID) => {
      const repo = getRepo(ctx);
      return repo.getById(id);
    },

    list: (ctx: Ctx) => (params?: unknown) => {
      const repo = getRepo(ctx);
      return repo.list(params);
    },
  };
}
