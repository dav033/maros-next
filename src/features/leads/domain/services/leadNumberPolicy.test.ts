import { describe, expect, it } from "vitest";

import {
  ensureLeadNumberAvailable,
  makeLeadNumber,
  normalizeLeadNumber,
  validateLeadNumberFormat,
} from "./leadNumberPolicy";

describe("makeLeadNumber", () => {
  it("devuelve null si el input es null o undefined", () => {
    expect(makeLeadNumber(null)).toBeNull();
    expect(makeLeadNumber(undefined)).toBeNull();
  });

  it("normaliza espacios (trim + colapsar)", () => {
    expect(makeLeadNumber("  001-0626  ")).toBe("001-0626");
    expect(makeLeadNumber("001   0626")).toBe("001 0626");
  });

  it("permite cadena vacía con las reglas por defecto", () => {
    expect(makeLeadNumber("")).toBe("");
  });
});

describe("normalizeLeadNumber", () => {
  it("aplica trim y colapso de espacios", () => {
    expect(normalizeLeadNumber("  a  b  ")).toBe("a b");
  });
});

describe("validateLeadNumberFormat", () => {
  it("lanza si está vacío y allowEmpty es false", () => {
    expect(() =>
      validateLeadNumberFormat("", { allowEmpty: false }),
    ).toThrowError();
  });

  it("lanza si no cumple el patrón", () => {
    expect(() =>
      validateLeadNumberFormat("xx", { pattern: /^\d+$/ }),
    ).toThrowError();
  });

  it("no lanza con un valor válido", () => {
    expect(() =>
      validateLeadNumberFormat("123", { pattern: /^\d+$/ }),
    ).not.toThrow();
  });
});

describe("ensureLeadNumberAvailable", () => {
  it("no lanza si el número está disponible", async () => {
    await expect(
      ensureLeadNumberAvailable("001-0626", async () => false),
    ).resolves.toBeUndefined();
  });

  it("lanza CONFLICT si el número ya está en uso", async () => {
    await expect(
      ensureLeadNumberAvailable("001-0626", async () => true),
    ).rejects.toMatchObject({ kind: "CONFLICT" });
  });

  it("no comprueba si el valor está vacío", async () => {
    await expect(
      ensureLeadNumberAvailable("", async () => true),
    ).resolves.toBeUndefined();
  });
});
