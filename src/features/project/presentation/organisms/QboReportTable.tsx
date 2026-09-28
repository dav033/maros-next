import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { QboRawReport, QboReportColData, QboReportRow } from "@/project/domain";

/** Sangría por nivel del árbol. A partir de cierta profundidad deja de crecer. */
const INDENT_PX = 16;
const MAX_INDENT_LEVEL = 8;
/** El padding horizontal que ya trae TableCell (`p-2`), para no perderlo al sangrar. */
const CELL_PADDING_PX = 8;

type FlatRowKind = "header" | "data" | "summary";

type FlatRow = {
  key: string;
  depth: number;
  kind: FlatRowKind;
  cells: QboReportColData[];
};

/**
 * Aplana el árbol de QuickBooks conservando el orden en que lo entrega:
 * encabezado de la sección, filas hijas (un nivel más adentro) y resumen.
 * No interpreta ni recalcula nada: sólo decide en qué renglón va cada ColData.
 */
function flattenRows(rows: QboReportRow[] | undefined, depth: number, prefix: string): FlatRow[] {
  if (!rows) return [];

  return rows.flatMap((row, index) => {
    const key = `${prefix}${index}`;
    const flat: FlatRow[] = [];

    if (row.ColData) {
      flat.push({ key: `${key}:d`, depth, kind: "data", cells: row.ColData });
    }
    if (row.Header?.ColData) {
      flat.push({ key: `${key}:h`, depth, kind: "header", cells: row.Header.ColData });
    }
    flat.push(...flattenRows(row.Rows?.Row, depth + 1, `${key}.`));
    if (row.Summary?.ColData) {
      flat.push({ key: `${key}:s`, depth, kind: "summary", cells: row.Summary.ColData });
    }

    return flat;
  });
}

const ROW_CLASSES: Record<FlatRowKind, string> = {
  header: "font-medium",
  data: "",
  summary: "bg-elev-3 font-medium",
};

export function QboReportTable({ raw }: { raw: QboRawReport }) {
  const columns = raw.Columns?.Column ?? [];
  const flatRows = flattenRows(raw.Rows?.Row, 0, "");
  const columnCount = flatRows.reduce((max, row) => Math.max(max, row.cells.length), columns.length);

  if (columnCount === 0 || flatRows.length === 0) {
    return (
      <p className="p-6 text-sm text-muted-foreground">
        QuickBooks no devolvió filas para este reporte con los filtros seleccionados.
      </p>
    );
  }

  const columnIndexes = Array.from({ length: columnCount }, (_, index) => index);
  // La alineación sale del ColType que manda QuickBooks, no del nombre de la columna.
  const isMoneyColumn = (index: number) => columns[index]?.ColType === "Money";

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columnIndexes.map((index) => (
            <TableHead
              key={index}
              className={isMoneyColumn(index) ? "text-right" : undefined}
            >
              {columns[index]?.ColTitle ?? ""}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {flatRows.map((row) => (
          <TableRow key={row.key} className={ROW_CLASSES[row.kind]}>
            {columnIndexes.map((index) => {
              const value = row.cells[index]?.value ?? "";
              const money = isMoneyColumn(index);
              return (
                <TableCell
                  key={index}
                  className={money ? "text-right font-mono tabular-nums" : undefined}
                  style={
                    index === 0
                      ? {
                          paddingLeft:
                            CELL_PADDING_PX + Math.min(row.depth, MAX_INDENT_LEVEL) * INDENT_PX,
                        }
                      : undefined
                  }
                >
                  {value}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
