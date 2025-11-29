import type { ResourceEndpoints } from "./makeResource";

export function buildCrudEndpoints<ID extends string | number>(
  base: string,
  options?: {
    listPath?: string;
    createPath?: string;
    byIdPath?: (id: ID) => string;
  }
): ResourceEndpoints<ID> {
  const list = () => (options?.listPath ? `${base}${options.listPath}` : base);
  const create = () =>
    options?.createPath ? `${base}${options.createPath}` : base;
  const byId = (id: ID) =>
    options?.byIdPath ? options.byIdPath(id) : `${base}/${id}`;

  return {
    base,
    list,
    create,
    getById: byId,
    update: byId,
    remove: byId,
  };
}
