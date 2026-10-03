"use client";

import { ChevronRight, TrendingUp } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { projectsKeys } from "@/project/application";
import {
  COST_CATEGORY_LABELS,
  type ProjectCostCategory,
  type ProjectCostCategoryKey,
} from "@/project/domain";
import { formatCurrency } from "@/shared/utils";

import { useProjectCostBreakdown } from "../hooks/data/useProjectCostBreakdown";
import { useProjectsMutations } from "../hooks/mutations/useProjectsMutations";

const PATCH_FIELD: Record<ProjectCostCategoryKey, "forecastMaterialCost" | "forecastSubcontractorCost"> =
  {
    material: "forecastMaterialCost",
    subcontractor: "forecastSubcontractorCost",
  };

/**
 * Lo que el proyecto ha costado y lo que se espera que acabe costando.
 *
 * Las cifras reales son de QuickBooks y vienen ya repartidas por cuenta de
 * gasto; el pronóstico lo teclea quien lleva la obra, porque no hay nada en la
 * contabilidad que lo implique.
 */
export function ProjectCostBreakdownCard({ projectId }: { projectId: number }) {
  const query = useProjectCostBreakdown(projectId);
  const [expanded, setExpanded] = useState<ReadonlySet<ProjectCostCategoryKey>>(
    () => new Set<ProjectCostCategoryKey>(),
  );

  function toggle(key: ProjectCostCategoryKey) {
    setExpanded((current) => {
      const next = new Set(current);
      if (!next.delete(key)) next.add(key);
      return next;
    });
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4" />
              Coste del proyecto
            </CardTitle>
            <CardDescription>
              Lo pagado según QuickBooks, en base caja, contra lo que se espera acabar pagando.
            </CardDescription>
          </div>
          {query.data ? (
            <div className="text-right">
              <div className="font-mono text-lg font-semibold tabular-nums">
                {formatCurrency(query.data.totalPaid)}
              </div>
              <div className="text-xs text-muted-foreground">pagado hasta ahora</div>
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {query.isPending ? (
          <div className="space-y-2 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : query.error ? (
          <div className="space-y-3 p-4">
            <p className="text-sm text-muted-foreground">
              No se pudo leer el coste en QuickBooks: {query.error.message}
            </p>
            <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
              Reintentar
            </Button>
          </div>
        ) : !query.data?.found ? (
          <p className="p-4 text-sm text-muted-foreground">
            Este proyecto no está enlazado a un job de QuickBooks, así que no hay coste que
            mostrar. Enlázalo desde la lista de proyectos.
          </p>
        ) : (
          <>
            {query.data.categories.map((category) => (
              <CategoryRow
                key={category.key}
                projectId={projectId}
                category={category}
                expanded={expanded.has(category.key)}
                onToggle={() => toggle(category.key)}
              />
            ))}
            {/*
              El resto se enseña en vez de esconderse: sin esta fila, las dos
              categorías no suman el coste del proyecto y nadie sabría por qué
              faltan. Son permisos, alquiler de equipo y planos.
            */}
            <div className="flex items-center justify-between border-t border-line px-4 py-2 text-sm text-muted-foreground">
              <span>Otros gastos (permisos, alquiler, planos)</span>
              <span className="font-mono tabular-nums">
                {formatCurrency(query.data.otherPaid)}
              </span>
            </div>
            {query.data.forecastUpdatedAt ? (
              <p className="border-t border-line px-4 py-2 text-xs text-muted-foreground">
                Pronóstico actualizado el{" "}
                {new Date(query.data.forecastUpdatedAt).toLocaleDateString("es-ES")}
              </p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function CategoryRow({
  projectId,
  category,
  expanded,
  onToggle,
}: {
  projectId: number;
  category: ProjectCostCategory;
  expanded: boolean;
  onToggle: () => void;
}) {
  const hasVendors = category.vendors.length > 0;

  return (
    <div className="border-t border-line first:border-t-0">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <button
          type="button"
          onClick={onToggle}
          disabled={!hasVendors}
          aria-expanded={expanded}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            !hasVendors && "cursor-default",
          )}
        >
          <ChevronRight
            aria-hidden="true"
            className={cn(
              "size-3.5 shrink-0 opacity-60",
              expanded && "rotate-90",
              !hasVendors && "invisible",
            )}
          />
          <span className="truncate font-medium">{COST_CATEGORY_LABELS[category.key]}</span>
          {hasVendors ? (
            <span className="shrink-0 text-xs text-muted-foreground">
              {category.vendors.length}{" "}
              {category.vendors.length === 1 ? "proveedor" : "proveedores"}
            </span>
          ) : null}
        </button>

        <div className="shrink-0 text-right">
          <div className="font-mono text-sm font-medium tabular-nums">
            {formatCurrency(category.paid)}
          </div>
          <div className="text-xs text-muted-foreground">pagado</div>
        </div>

        <ForecastField projectId={projectId} category={category} />
      </div>

      {expanded && hasVendors ? (
        <div className="border-t border-line bg-elev-2">
          <table className="w-full text-sm">
            <tbody>
              {category.vendors.map((vendor) => (
                <tr key={vendor.id ?? vendor.name} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-1.5">
                    <span className="block max-w-[32ch] truncate" title={vendor.name}>
                      {vendor.name}
                    </span>
                  </td>
                  <td className="w-24 px-2 py-1.5 text-right text-xs text-muted-foreground">
                    {vendor.transactionCount}{" "}
                    {vendor.transactionCount === 1 ? "mov." : "movs."}
                  </td>
                  <td className="w-32 whitespace-nowrap px-4 py-1.5 text-right font-mono tabular-nums">
                    {formatCurrency(vendor.paid)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

/**
 * El pronóstico, editable en el sitio. Vacío guarda `null` y no 0: "nadie lo
 * escribió" y "no espero gastar nada" son cosas distintas, y un 0 convertiría
 * cada obra sin pronóstico en un sobrecoste de todo su importe.
 */
function ForecastField({
  projectId,
  category,
}: {
  projectId: number;
  category: ProjectCostCategory;
}) {
  const { updateMutation } = useProjectsMutations();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<string>(
    category.forecast === null ? "" : String(category.forecast),
  );

  const parsed = draft.trim() === "" ? null : Number(draft);
  const invalid = parsed !== null && (!Number.isFinite(parsed) || parsed < 0);
  const dirty = parsed !== category.forecast;

  async function save() {
    if (invalid || !dirty) return;
    await updateMutation.mutateAsync({
      id: projectId,
      patch: { [PATCH_FIELD[category.key]]: parsed },
    });
    // El desglose recalcula el desvío en el servidor, así que se vuelve a pedir
    // en vez de recomponerlo aquí con dos cifras que podrían no venir de la
    // misma base.
    await queryClient.invalidateQueries({
      queryKey: [...projectsKeys.detail(projectId), "cost-breakdown"],
    });
  }

  return (
    <div className="flex shrink-0 items-end gap-2">
      <div className="text-right">
        <label className="sr-only" htmlFor={`forecast-${category.key}`}>
          Pronóstico de {COST_CATEGORY_LABELS[category.key]}
        </label>
        <Input
          id={`forecast-${category.key}`}
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          value={draft}
          placeholder="sin pronóstico"
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => void save()}
          aria-invalid={invalid || undefined}
          className={cn(
            "h-8 w-32 text-right font-mono tabular-nums",
            invalid && "border-destructive",
          )}
        />
        <div className="mt-0.5 text-xs text-muted-foreground">pronóstico</div>
      </div>

      <div className="w-28 text-right">
        {category.overrun === null ? (
          <span className="text-xs text-muted-foreground">—</span>
        ) : (
          <>
            <div
              className={cn(
                "font-mono text-sm font-medium tabular-nums",
                category.overrun > 0 ? "text-destructive" : "text-foreground",
              )}
            >
              {category.overrun > 0 ? "+" : ""}
              {formatCurrency(category.overrun)}
            </div>
            <div className="text-xs text-muted-foreground">
              {category.overrun > 0 ? "de más" : "por debajo"}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
