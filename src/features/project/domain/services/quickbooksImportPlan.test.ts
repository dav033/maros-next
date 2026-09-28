import { describe, expect, it } from "vitest";

import type { QuickbooksImportJob } from "../models/QuickbooksImportJob";
import {
  buildImportDecisions,
  chunkImportDecisions,
  isChangeOrderNumber,
  normalizeProjectNumberKey,
  planImportRow,
  planImportRows,
  resolveCollision,
  summarizeImportPlan,
} from "./quickbooksImportPlan";

function job(overrides: Partial<QuickbooksImportJob> = {}): QuickbooksImportJob {
  return {
    qboCustomerId: "1",
    displayName: "001R-0625, 3324 NW 14th St",
    fullyQualifiedName: "001R-0625, 3324 NW 14th St",
    active: true,
    balance: 0,
    parentName: null,
    projectNumber: "001R-0625",
    importedProjectId: null,
    matchingLeads: [],
    status: "ok",
    statusDetail: "Ready to import.",
    role: "contrato_base",
    changeOrderNumber: null,
    suggestedProjectNumber: null,
    collidesWith: [],
    conflictProjectId: null,
    ...overrides,
  };
}

/** Los dos jobs que están colisionando en producción. */
const baseContract = job({
  qboCustomerId: "387",
  displayName: "001R-0625, 3324 NW 14th St, Miami FL",
  projectNumber: "001R-0625",
  status: "colision",
  role: "contrato_base",
  collidesWith: [
    {
      qboCustomerId: "283",
      displayName: "001R-0625 C01, 3324 NW 14th St, Miami FL",
      role: "orden_de_cambio",
      changeOrderNumber: 1,
      importedProjectId: null,
    },
  ],
});

const changeOrder = job({
  qboCustomerId: "283",
  displayName: "001R-0625 C01, 3324 NW 14th St, Miami FL",
  projectNumber: "001R-0625",
  status: "colision",
  role: "orden_de_cambio",
  changeOrderNumber: 1,
  suggestedProjectNumber: "001R-0625 CO01",
  collidesWith: [
    {
      qboCustomerId: "387",
      displayName: "001R-0625, 3324 NW 14th St, Miami FL",
      role: "contrato_base",
      changeOrderNumber: null,
      importedProjectId: null,
    },
  ],
});

describe("normalizeProjectNumberKey", () => {
  it("colapsa las grafías del sufijo de orden de cambio en una sola clave", () => {
    expect(normalizeProjectNumberKey("001R-0625 C01")).toBe("001R-0625 CO1");
    expect(normalizeProjectNumberKey("001R-0625 CO1")).toBe("001R-0625 CO1");
    expect(normalizeProjectNumberKey("001r-0625 co 01")).toBe("001R-0625 CO1");
  });

  it("deja el número base intacto y no lo confunde con una orden de cambio", () => {
    expect(normalizeProjectNumberKey("001R - 0625")).toBe("001R-0625");
    expect(isChangeOrderNumber("001R-0625")).toBe(false);
    expect(isChangeOrderNumber("001R-0625 CO01")).toBe(true);
  });
});

describe("planImportRow", () => {
  it("crea cuando no hay ninguna coincidencia en el CRM", () => {
    const plan = planImportRow(job());
    expect(plan.intent).toBe("crear");
    expect(plan.leadId).toBeNull();
    expect(plan.projectId).toBeNull();
    expect(plan.blockedReason).toBeNull();
  });

  it("vincula al proyecto libre que ya tiene el mismo número", () => {
    const plan = planImportRow(
      job({
        matchingLeads: [
          { leadId: 9, leadNumber: "001R-0625", name: "Casa", projectId: 44, qboCustomerId: null },
        ],
      }),
    );
    expect(plan.intent).toBe("vincular");
    expect(plan.projectId).toBe(44);
    expect(plan.leadId).toBeNull();
  });

  it("vincula al lead cuando todavía no tiene proyecto", () => {
    const plan = planImportRow(
      job({
        matchingLeads: [
          { leadId: 9, leadNumber: "001R-0625", name: "Casa", projectId: null, qboCustomerId: null },
        ],
      }),
    );
    expect(plan.intent).toBe("vincular");
    expect(plan.leadId).toBe(9);
    expect(plan.projectId).toBeNull();
  });

  it("bloquea lo ya importado, lo que no tiene número y el número tomado", () => {
    expect(planImportRow(job({ status: "ya_importado", importedProjectId: 12 })).blockedReason)
      .toBe("ya_importado");
    expect(planImportRow(job({ status: "sin_numero", projectNumber: null })).blockedReason)
      .toBe("sin_numero");
    expect(
      planImportRow(
        job({
          status: "numero_en_uso",
          matchingLeads: [
            { leadId: 9, leadNumber: "001R-0625", name: "Casa", projectId: 44, qboCustomerId: "999" },
          ],
        }),
      ).blockedReason,
    ).toBe("numero_en_uso");
  });

  it("desbloquea un número tomado en cuanto el operador escribe otro", () => {
    const taken = job({
      status: "numero_en_uso",
      matchingLeads: [
        { leadId: 9, leadNumber: "001R-0625", name: "Casa", projectId: 44, qboCustomerId: "999" },
      ],
    });
    const plan = planImportRow(taken, "001R-0625 CO02");
    expect(plan.blockedReason).toBeNull();
    // Con otro número las coincidencias del número original ya no aplican.
    expect(plan.intent).toBe("crear");
    expect(plan.projectId).toBeNull();
  });

  it("guarda el número tal cual se teclea y recorta sólo la decisión", () => {
    // Escribir «001R-0625 CO01» pasa por «001R-0625 »: si el plan recorta el
    // valor que pinta el input, el espacio desaparece al teclearlo.
    const typing = planImportRow(job(), "001R-0625 ");
    expect(typing.rawProjectNumber).toBe("001R-0625 ");
    expect(typing.projectNumber).toBe("001R-0625");
    expect(buildImportDecisions([typing], new Set(["1"]))).toEqual([
      { qboCustomerId: "1", projectNumber: "001R-0625" },
    ]);
  });

  it("ofrece todos los destinos libres y respeta el que elija el operador", () => {
    const ambiguous = job({
      matchingLeads: [
        { leadId: 9, leadNumber: "001R-0625", name: "Casa", projectId: 44, qboCustomerId: null },
        { leadId: 12, leadNumber: "001R-0625", name: "Bodega", projectId: null, qboCustomerId: null },
      ],
    });

    const byDefault = planImportRow(ambiguous);
    expect(byDefault.matchOptions).toHaveLength(2);
    expect(byDefault.match?.leadId).toBe(9);
    expect(byDefault.projectId).toBe(44);

    const chosen = planImportRow(ambiguous, null, 12);
    expect(chosen.match?.leadId).toBe(12);
    expect(chosen.leadId).toBe(12);
    expect(chosen.projectId).toBeNull();
    expect(buildImportDecisions([chosen], new Set(["1"]))).toEqual([
      { qboCustomerId: "1", projectNumber: "001R-0625", leadId: 12 },
    ]);
  });

  it("no deja lista una orden de cambio con el número del contrato base", () => {
    // El backend la rechaza con ConflictException, así que la fila no puede
    // salir «lista» ni viajar en el lote.
    expect(planImportRow(changeOrder).blockedReason).toBe("orden_de_cambio_sin_numero");
    expect(planImportRow(changeOrder).changeOrderNeedsOwnNumber).toBe(true);
    // Da igual que no choque con nadie: la guarda del backend es de escritura.
    const lonely = job({ ...changeOrder, status: "ok", collidesWith: [] });
    expect(planImportRow(lonely).blockedReason).toBe("orden_de_cambio_sin_numero");
    // Con su propio número, escrito como sea, se desbloquea.
    expect(planImportRow(changeOrder, "001R-0625 CO01").blockedReason).toBeNull();
    expect(planImportRow(changeOrder, "001R-0625 C02").blockedReason).toBeNull();
    // Y una orden de cambio cuyo nombre ya deriva su propio número nunca lo estuvo.
    const spelledOut = job({
      ...changeOrder,
      projectNumber: "001R-0625 CO01",
      status: "ok",
      collidesWith: [],
    });
    expect(planImportRow(spelledOut).blockedReason).toBeNull();
  });

  it("marca la orden de cambio como conflicto sin resolver, no el contrato base", () => {
    expect(planImportRow(changeOrder).unresolvedCollision).toBe(true);
    expect(planImportRow(baseContract).unresolvedCollision).toBe(false);
  });

  it("resuelve la colisión cuando la orden de cambio toma el número sugerido", () => {
    const plan = planImportRow(changeOrder, "001R-0625 CO01");
    expect(plan.unresolvedCollision).toBe(false);
    expect(plan.overridden).toBe(true);
    expect(plan.projectNumber).toBe("001R-0625 CO01");
    expect(plan.intent).toBe("crear");
  });

  it("deja sin resolver las dos filas cuando el backend no pudo distinguirlas", () => {
    const left = job({
      qboCustomerId: "10",
      status: "colision",
      role: "indeterminado",
      collidesWith: [
        {
          qboCustomerId: "11",
          displayName: "001R-0625, otra cosa",
          role: "indeterminado",
          changeOrderNumber: null,
          importedProjectId: null,
        },
      ],
    });
    expect(planImportRow(left).unresolvedCollision).toBe(true);
  });
});

describe("resolveCollision", () => {
  it("no propone nada cuando la fila no choca con nadie", () => {
    expect(resolveCollision(job())).toBeNull();
  });

  it("propone el número sugerido sólo para la orden de cambio", () => {
    expect(resolveCollision(changeOrder)).toEqual({
      suggestedProjectNumber: "001R-0625 CO01",
      indeterminate: false,
    });
    expect(resolveCollision(baseContract)).toEqual({
      suggestedProjectNumber: null,
      indeterminate: false,
    });
  });

  it("no inventa un número cuando el marcador no traía ordinal", () => {
    const withoutOrdinal = job({
      ...changeOrder,
      changeOrderNumber: null,
      suggestedProjectNumber: null,
    });
    expect(resolveCollision(withoutOrdinal)?.suggestedProjectNumber).toBeNull();
  });

  it("avisa de que no se pudo distinguir cuando el papel es indeterminado", () => {
    const undecided = job({ ...changeOrder, role: "indeterminado" });
    expect(resolveCollision(undecided)).toEqual({
      suggestedProjectNumber: null,
      indeterminate: true,
    });
  });
});

describe("summarizeImportPlan", () => {
  const jobs = [
    job({ qboCustomerId: "1" }),
    job({
      qboCustomerId: "2",
      matchingLeads: [
        { leadId: 9, leadNumber: "001R-0625", name: "Casa", projectId: 44, qboCustomerId: null },
      ],
    }),
    job({ qboCustomerId: "3", status: "ya_importado", importedProjectId: 7 }),
    changeOrder,
  ];

  it("cuenta lo que se va a crear, vincular, bloquear y lo que sigue en conflicto", () => {
    const plans = planImportRows(jobs, {});
    // La orden de cambio (283) va sin su propio número: bloqueada, como el job
    // ya importado (3).
    const summary = summarizeImportPlan(plans, new Set(["1", "2", "3", "283"]));
    expect(summary).toEqual({
      selected: 2,
      toCreate: 1,
      toLink: 1,
      unresolvedCollisions: 0,
      blocked: 2,
      batches: 1,
    });
  });

  it("sólo cuenta lo seleccionado", () => {
    const plans = planImportRows(jobs, {});
    expect(summarizeImportPlan(plans, new Set())).toEqual({
      selected: 0,
      toCreate: 0,
      toLink: 0,
      unresolvedCollisions: 0,
      blocked: 0,
      batches: 0,
    });
  });

  it("deja de contar el conflicto cuando el operador aplica el número sugerido", () => {
    const plans = planImportRows(jobs, { "283": "001R-0625 CO01" });
    const summary = summarizeImportPlan(plans, new Set(["283"]));
    expect(summary.unresolvedCollisions).toBe(0);
    expect(summary.toCreate).toBe(1);
  });

  it("anuncia cuántos lotes hacen falta por encima del límite del servidor", () => {
    const many = Array.from({ length: 201 }, (_, index) => job({ qboCustomerId: String(index) }));
    const plans = planImportRows(many, {});
    const summary = summarizeImportPlan(plans, new Set(many.map((row) => row.qboCustomerId)));
    expect(summary.selected).toBe(201);
    expect(summary.batches).toBe(2);
  });
});

describe("buildImportDecisions", () => {
  it("manda el destino como projectId o leadId, nunca los dos", () => {
    const plans = planImportRows(
      [
        job({ qboCustomerId: "1" }),
        job({
          qboCustomerId: "2",
          matchingLeads: [
            { leadId: 9, leadNumber: "001R-0625", name: "Casa", projectId: 44, qboCustomerId: null },
          ],
        }),
        job({
          qboCustomerId: "3",
          matchingLeads: [
            { leadId: 8, leadNumber: "001R-0625", name: "Casa", projectId: null, qboCustomerId: null },
          ],
        }),
      ],
      {},
    );

    expect(buildImportDecisions(plans, new Set(["1", "2", "3"]))).toEqual([
      { qboCustomerId: "1", projectNumber: "001R-0625" },
      { qboCustomerId: "2", projectNumber: "001R-0625", projectId: 44 },
      { qboCustomerId: "3", projectNumber: "001R-0625", leadId: 8 },
    ]);
  });

  it("nunca manda una fila bloqueada", () => {
    const plans = planImportRows([job({ status: "ya_importado", importedProjectId: 7 })], {});
    expect(buildImportDecisions(plans, new Set(["1"]))).toEqual([]);
  });
});

describe("chunkImportDecisions", () => {
  it("trocea por el límite del servidor sin perder ninguna decisión", () => {
    const decisions = Array.from({ length: 5 }, (_, index) => ({
      qboCustomerId: String(index),
      projectNumber: "001R-0625",
    }));
    const chunks = chunkImportDecisions(decisions, 2);
    expect(chunks.map((chunk) => chunk.length)).toEqual([2, 2, 1]);
    expect(chunks.flat()).toEqual(decisions);
  });

  it("no produce ningún lote cuando no hay nada que mandar", () => {
    expect(chunkImportDecisions([])).toEqual([]);
  });
});
