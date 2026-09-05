import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useEntityTableLogic } from "./useEntityTableLogic";

type Row = { id: number; amount?: number };

describe("useEntityTableLogic", () => {
  it("adopta objetos nuevos aunque conserven los mismos ids", () => {
    // Caso real: la tabla de Projects renderiza primero sin montos y después
    // recibe las mismas filas ya enriquecidas con QuickBooks. Comparar solo por
    // id descartaba ese segundo update y la tabla se quedaba sin montos.
    const initial: Row[] = [{ id: 1 }, { id: 2 }];
    const { result, rerender } = renderHook(({ items }) => useEntityTableLogic<Row>({ items }), {
      initialProps: { items: initial },
    });

    expect(result.current.rows).toEqual([{ id: 1 }, { id: 2 }]);

    rerender({ items: [{ id: 1, amount: 300 }, { id: 2, amount: 500 }] });

    expect(result.current.rows).toEqual([
      { id: 1, amount: 300 },
      { id: 2, amount: 500 },
    ]);
  });

  it("mantiene la misma referencia de filas cuando los items no cambiaron", () => {
    const items: Row[] = [{ id: 1 }];
    const { result, rerender } = renderHook(({ items }) => useEntityTableLogic<Row>({ items }), {
      initialProps: { items },
    });

    const first = result.current.rows;
    rerender({ items: [...items] });

    expect(result.current.rows).toBe(first);
  });
});
