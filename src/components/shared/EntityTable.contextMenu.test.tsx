import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EntityTable, type EntityContextMenuItem } from "./EntityTable";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
}));

afterEach(cleanup);

type Row = { id: number; name: string };

const rows: Row[] = [
  { id: 1, name: "Primera fila" },
  { id: 2, name: "Segunda fila" },
];

function renderTable(onPick = vi.fn()) {
  const getContextMenuItems = (row: Row): EntityContextMenuItem[] => [
    { label: `Ir al Profit and Loss de ${row.name}`, onClick: () => onPick(row.id) },
  ];
  render(
    <EntityTable<Row>
      data={rows}
      columns={[{ key: "name", header: "Nombre" }]}
      rowKey={(row) => row.id}
      getContextMenuItems={getContextMenuItems}
    />,
  );
  return { onPick };
}

function rowNamed(name: string): HTMLElement {
  const cell = screen.getByText(name);
  const row = cell.closest("tr");
  if (!row) throw new Error(`no encontré la fila de ${name}`);
  return row;
}

describe("EntityTable, el menú del clic derecho", () => {
  /**
   * El trigger es la propia fila. Esto es lo que antes no era así: el menú
   * colgaba de un `span` invisible que el código colocaba a mano en las
   * coordenadas del cursor, de modo que Radix medía contra algo que no era
   * donde se había pulsado y el menú salía lejos del cursor.
   */
  it("opens on the row that was right-clicked", () => {
    renderTable();

    fireEvent.contextMenu(rowNamed("Primera fila"));

    expect(
      screen.getByText("Ir al Profit and Loss de Primera fila"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Ir al Profit and Loss de Segunda fila")).toBeNull();
  });

  /**
   * El fallo que se veía: con el menú abierto, el DropdownMenu modal tapaba la
   * página y se comía el siguiente clic derecho, así que el menú se quedaba
   * contra el ancla de la vez anterior — salía sobre la fila equivocada.
   */
  it("follows a second right-click onto a different row", () => {
    renderTable();

    fireEvent.contextMenu(rowNamed("Primera fila"));
    expect(screen.getByText("Ir al Profit and Loss de Primera fila")).toBeInTheDocument();

    fireEvent.contextMenu(rowNamed("Segunda fila"));

    expect(screen.getByText("Ir al Profit and Loss de Segunda fila")).toBeInTheDocument();
    expect(screen.queryByText("Ir al Profit and Loss de Primera fila")).toBeNull();
  });

  it("runs the item of the row it was opened on", () => {
    const { onPick } = renderTable();

    fireEvent.contextMenu(rowNamed("Segunda fila"));
    fireEvent.click(screen.getByText("Ir al Profit and Loss de Segunda fila"));

    expect(onPick).toHaveBeenCalledWith(2);
  });

  /** El menú del clic derecho no sustituye al botón de tres puntos de la fila. */
  it("keeps the row's own actions button", () => {
    renderTable();

    const button = within(rowNamed("Primera fila")).getByRole("button", {
      name: "Row actions",
    });

    expect(button).toBeInTheDocument();
  });
});
