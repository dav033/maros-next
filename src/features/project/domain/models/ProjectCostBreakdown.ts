/**
 * Lo que un proyecto ha costado en material y en subcontratistas, contra lo que
 * se espera que acabe costando.
 *
 * Las cifras reales son las de QuickBooks: comprobado contra el 032P-0825, el
 * material sale 105.600,23 y los subcontratistas 78.840,63, que es exactamente
 * lo que dice su Profit and Loss en base caja.
 */
export type ProjectCostCategoryKey = "material" | "subcontractor";

export type ProjectCostVendor = {
  id?: string;
  name: string;
  /** Pagado en efectivo: la cifra que se compara con el pronóstico. */
  paid: number;
  openAp: number;
  committedPo: number;
  total: number;
  transactionCount: number;
};

export type ProjectCostCategory = {
  key: ProjectCostCategoryKey;
  /** La cuenta de QuickBooks de la que salen estas cifras, o null si no hubo ninguna. */
  accountName: string | null;
  paid: number;
  openAp: number;
  committedPo: number;
  total: number;
  /** `null` es "nadie lo escribió", que no es 0. */
  forecast: number | null;
  /** `paid - forecast`; positivo es pasarse. `null` si no hay pronóstico. */
  overrun: number | null;
  vendors: ProjectCostVendor[];
};

export type ProjectCostBreakdown = {
  projectId: number;
  leadNumber: string | null;
  qboCustomerId: string | null;
  found: boolean;
  /** Coste pagado del proyecto entero, no sólo de estas dos categorías. */
  totalPaid: number;
  totalJobCost: number;
  categories: ProjectCostCategory[];
  /**
   * Lo pagado fuera de las dos categorías: permisos, alquiler de equipo,
   * planos. Se enseña en vez de esconderse, porque si no las dos cifras no
   * suman el coste del proyecto y nadie sabe por qué.
   */
  otherPaid: number;
  forecastUpdatedAt: string | null;
};

export const COST_CATEGORY_LABELS: Record<ProjectCostCategoryKey, string> = {
  material: "Cost of material",
  subcontractor: "Subcontractors",
};
