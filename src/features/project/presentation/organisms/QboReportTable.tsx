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

/**
 * Columnas de importe, por el `ColType` que manda QuickBooks.
 *
 * Los reportes de resumen (ProfitAndLoss, BalanceSheet) usan el literal `Money`;
 * los de detalle (ProfitAndLossDetail, GeneralLedger) no lo usan nunca y mandan
 * el tipo del campo: `subt_nat_amount` para el importe, `rbal_nat_amount` para
 * el saldo acumulado, `credit_amt` y `debt_amt` en el libro mayor. Comprobar
 * sólo `Money` dejaba los reportes de detalle —los que más cifras traen— sin
 * alinear a la derecha y sin formato.
 */
function isMoneyColType(colType: string | undefined): boolean {
  if (!colType) return false;
  if (colType === "Money") return true;
  const type = colType.toLowerCase();
  return type.includes("amount") || type.includes("amt") || type.endsWith("bal");
}

/**
 * La descripción: ancha, repetitiva y casi nunca lo que se viene a mirar, así
 * que arranca oculta detrás del interruptor. `memo` es el `ColType` de
 * "Memo/Description" en los reportes de detalle.
 */
const DESCRIPTION_COL_TYPES = new Set(["memo"]);

/**
 * Columnas de texto que llegan con el nombre completo de QuickBooks — el `Name`
 * de un reporte filtrado por job trae "JFB Construction and Development,
 * Inc:032P-0825, ITB Divine Savior Worship WPB 5133 Tylerlakes Blvd" en cada
 * fila. Se recortan con el valor completo en el `title`: es lo que estiraba la
 * tabla a lo ancho y partía cada fila en tres renglones.
 */
const WIDE_TEXT_COL_TYPES = new Set(["name", "memo", "split_acc", "dept_name", "klass_name"]);

const moneyFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * QuickBooks manda los importes como cadena sin separar los miles ("145143.00"),
 * así que el formato es nuestro. Lo que no sea un número se devuelve tal cual:
 * una celda de importe puede traer vacío o un texto, y reemplazarlo por "0.00"
 * sería inventar una cifra.
 */
export function formatQboMoney(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return value;
  const parsed = Number(trimmed.replace(/,/g, ""));
  if (!Number.isFinite(parsed)) return value;
  return moneyFormat.format(parsed);
}

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
  const [showDescription, setShowDescription] = useState(false);

  const columns = raw.Columns?.Column ?? [];
  const flatRows = flattenRows(raw.Rows?.Row, 0, "", null);
  const columnCount = flatRows.reduce((max, row) => Math.max(max, row.cells.length), columns.length);
  /**
   * QuickBooks manda el mismo juego de columnas para todo el reporte, así que
   * filtrado por un job varias llegan vacías de punta a punta. Se quitan: no
   * llevan ninguna cifra y el ancho que ocupan es el que falta en móvil.
   */
  const filledIndexes = Array.from({ length: columnCount }, (_, index) => index).filter((index) =>
    flatRows.some((row) => (row.cells[index]?.value ?? "") !== ""),
  );

  const isMoneyColumn = (index: number) => isMoneyColType(columns[index]?.ColType);
  const isWideTextColumn = (index: number) =>
    WIDE_TEXT_COL_TYPES.has(String(columns[index]?.ColType ?? ""));
  const isDescriptionColumn = (index: number) =>
    DESCRIPTION_COL_TYPES.has(String(columns[index]?.ColType ?? ""));

  /** Sólo hay interruptor si el reporte trae descripción y además viene con algo escrito. */
  const hasDescription = filledIndexes.some(isDescriptionColumn);
  const columnIndexes =
    showDescription || !hasDescription
      ? filledIndexes
      : filledIndexes.filter((index) => !isDescriptionColumn(index));

  const visibleRows = flatRows.filter((row) => !row.section || !collapsed.has(row.section));

  function toggleSection(section: string) {
    setCollapsed((current) => {
      const next = new Set(current);
      if (!next.delete(section)) next.add(section);
      return next;
    });
  }

  if (filledIndexes.length === 0 || flatRows.length === 0) {
    return (
      <p className="p-6 text-sm text-muted-foreground">
        QuickBooks no devolvió filas para este reporte con los filtros seleccionados.
      </p>
    );
  }

  return (
    <>
      {hasDescription ? (
        <div className="flex justify-end border-b border-line px-2 py-1">
          <button
            type="button"
            aria-pressed={showDescription}
            onClick={() => setShowDescription((current) => !current)}
            className="rounded-sm text-xs text-muted-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {showDescription ? "Ocultar descripción" : "Mostrar descripción"}
          </button>
        </div>
      ) : null}
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
                  const cell = row.cells[index]?.value ?? "";
                  const money = isMoneyColumn(index);
                  const value = money ? formatQboMoney(cell) : cell;
                  const first = position === 0;
                  /**
                   * La primera columna lleva el árbol de cuentas y el plegado:
                   * recortarla escondería de qué cuenta es la cifra.
                   */
                  const clamp = !first && !money && isWideTextColumn(index);

                  return (
                    <TableCell
                      key={index}
                      className={cn(
                        "px-2 py-1",
                        money && "whitespace-nowrap text-right font-mono tabular-nums",
                      )}
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
                      ) : clamp ? (
                        <span className="block max-w-[22ch] truncate" title={value}>
                          {value}
                        </span>
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
    </>
  );
}
