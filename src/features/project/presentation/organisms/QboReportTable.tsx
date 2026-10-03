"use client";

import { ChevronRight } from "lucide-react";
import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { QboRawReport, QboReportColData, QboReportRow } from "@/project/domain";

/** Sangría por nivel del árbol. A partir de cierta profundidad deja de crecer. */
const INDENT_PX = 12;
const MAX_INDENT_LEVEL = 6;
/** El padding horizontal que ya trae la celda (`px-2`), para no perderlo al sangrar. */
const CELL_PADDING_PX = 8;

type FlatRowKind = "header" | "data" | "summary";

type FlatRow = {
  key: string;
  depth: number;
  kind: FlatRowKind;
  cells: QboReportColData[];
  /** Sección de primer nivel que esconde esta fila al plegarse, si pertenece a una. */
  section: string | null;
  /** Sección que esta fila abre y cierra; sólo lo lleva el encabezado de la sección. */
  toggles: string | null;
};

/**
 * Aplana el árbol de QuickBooks conservando el orden en que lo entrega:
 * encabezado de la sección, filas hijas (un nivel más adentro) y resumen.
 * No interpreta ni recalcula nada: sólo decide en qué renglón va cada ColData.
 */
function flattenRows(
  rows: QboReportRow[] | undefined,
  depth: number,
  prefix: string,
  section: string | null,
): FlatRow[] {
  if (!rows) return [];

  return rows.flatMap((row, index) => {
    const key = `${prefix}${index}`;
    const children = row.Rows?.Row;
    /**
     * Sólo el primer nivel se pliega: más adentro el árbol es el detalle de una
     * misma sección y esconderlo a trozos no ayuda a comparar cifras. El
     * encabezado y el resumen quedan fuera de la sección que plieguen, así que
     * el total sigue a la vista con la sección cerrada.
     */
    const collapsible = depth === 0 && Boolean(children?.length) && Boolean(row.Header?.ColData);
    const childSection = collapsible ? key : section;
    const flat: FlatRow[] = [];

    if (row.ColData) {
      flat.push({
        key: `${key}:d`,
        depth,
        kind: "data",
        cells: row.ColData,
        section,
        toggles: null,
      });
    }
    if (row.Header?.ColData) {
      flat.push({
        key: `${key}:h`,
        depth,
        kind: "header",
        cells: row.Header.ColData,
        section,
        toggles: collapsible ? key : null,
      });
    }
    flat.push(...flattenRows(children, depth + 1, `${key}.`, childSection));
    if (row.Summary?.ColData) {
      flat.push({
        key: `${key}:s`,
        depth,
        kind: "summary",
        cells: row.Summary.ColData,
        section,
        toggles: null,
      });
    }

    return flat;
  });
}

const ROW_CLASSES: Record<FlatRowKind, string> = {
  header: "font-medium",
  data: "",
  // Un total tiene que leerse como total: la línea fuerte lo despega del detalle.
  summary: "border-t border-line-strong bg-elev-3 font-medium",
};

export function QboReportTable({ raw }: { raw: QboRawReport }) {
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(() => new Set<string>());

  const columns = raw.Columns?.Column ?? [];
  const flatRows = flattenRows(raw.Rows?.Row, 0, "", null);
  const columnCount = flatRows.reduce((max, row) => Math.max(max, row.cells.length), columns.length);
  /**
   * QuickBooks manda el mismo juego de columnas para todo el reporte, así que
   * filtrado por un job varias llegan vacías de punta a punta. Se quitan: no
   * llevan ninguna cifra y el ancho que ocupan es el que falta en móvil.
   */
  const columnIndexes = Array.from({ length: columnCount }, (_, index) => index).filter((index) =>
    flatRows.some((row) => (row.cells[index]?.value ?? "") !== ""),
  );

  if (columnIndexes.length === 0 || flatRows.length === 0) {
    return (
      <p className="p-6 text-sm text-muted-foreground">
        QuickBooks no devolvió filas para este reporte con los filtros seleccionados.
      </p>
    );
  }

  // La alineación sale del ColType que manda QuickBooks, no del nombre de la columna.
  const isMoneyColumn = (index: number) => columns[index]?.ColType === "Money";
  const visibleRows = flatRows.filter((row) => !row.section || !collapsed.has(row.section));

  function toggleSection(section: string) {
    setCollapsed((current) => {
      const next = new Set(current);
      if (!next.delete(section)) next.add(section);
      return next;
    });
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columnIndexes.map((index) => (
            <TableHead
              key={index}
              className={cn("h-8 px-2", isMoneyColumn(index) && "text-right")}
            >
              {columns[index]?.ColTitle ?? ""}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {visibleRows.map((row) => {
          const toggles = row.toggles;
          const expanded = toggles !== null && !collapsed.has(toggles);

          return (
            <TableRow key={row.key} className={ROW_CLASSES[row.kind]}>
              {columnIndexes.map((index, position) => {
                const value = row.cells[index]?.value ?? "";
                const money = isMoneyColumn(index);
                const first = position === 0;

                return (
                  <TableCell
                    key={index}
                    className={cn("px-2 py-1", money && "text-right font-mono tabular-nums")}
                    style={
                      first
                        ? {
                            paddingLeft:
                              CELL_PADDING_PX + Math.min(row.depth, MAX_INDENT_LEVEL) * INDENT_PX,
                          }
                        : undefined
                    }
                  >
                    {first && toggles !== null ? (
                      <button
                        type="button"
                        aria-expanded={expanded}
                        onClick={() => toggleSection(toggles)}
                        className="inline-flex items-center gap-1 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <ChevronRight
                          aria-hidden="true"
                          className={cn("size-3 shrink-0 opacity-60", expanded && "rotate-90")}
                        />
                        {value}
                      </button>
                    ) : (
                      value
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
